/**
 * This script handles the dynamic loading of HTML components and content into the application.
 * It is used across multiple pages to load reusable components like the header and match cards.
 *
 * Firestore is used to fetch user and group data for dynamically updating the UI.
 */

import { getUserData, getAllUsersInGroup, getCurrentGroup, auth, db } from "./app.js";
import { getCompatibility, getCommonInterests } from "./groupManager.js";

// This constant determines the correct path for fetching header.html based on the current page location.
const BASE_PATH = window.location.pathname.includes("/html/") ? "./" : "./html/";

let matchcard;
let usersCache = null; // Cache for group users.
let currentUser = null; // Cache for the current user.

/**
 * Loads HTML content from a specified file path and inserts it into elements matching a given selector.
 *
 * @param {string} selector - The CSS selector for the elements to insert the content into.
 * @param {string} filePath - The path to the HTML file to load.
 * @returns {Promise<void>}
 */
export async function loadContent(selector, filePath) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
        try {
            const response = await fetch(filePath); // Fetch the content from the specified file path.
            if (!response.ok) {
                throw new Error(`Failed to load ${filePath}: ${response.statusText}`);
            }
            const html = await response.text();
            element.innerHTML = html; // Insert the fetched HTML content into the element.
        } catch (error) {
            console.error(`Error loading ${filePath} into ${selector}:`, error);
        }
    }
}

/**
 * Loads the header component into the page and configures its elements.
 * It dynamically updates the header based on the provided parameters.
 *
 * @param {boolean} showBackButton - Whether to show the back button.
 * @param {boolean} showGroup - Whether to show the group title.
 * @param {boolean} showAvatar - Whether to show the user's profile image.
 * @param {boolean} showButton - Whether to show the login/logout button.
 * @param {boolean} showGroupButton - Whether to show the group button.
 * @returns {Promise<void>}
 */
export async function loadHeader(showBackButton = false, showGroup = false, showAvatar = true, showButton = false, showGroupButton = false) {
    // Load the header HTML content into the page.
    await loadContent("header", `${BASE_PATH}components/header.html`);
    let header = document.querySelector("header");
    await cacheCurrentUser();

    if (header) {
        // Configure the back button visibility.
        let backButton = header.querySelector(".header-back-button");
        if (backButton) {
            backButton.style.display = showBackButton ? "block" : "none";
        }

        // Configure the group button visibility.
        let groupButton = header.querySelector(".header-group-button");
        if (groupButton) {
            groupButton.style.display = showGroupButton ? "block" : "none";
        }

        // Configure the title and group header visibility.
        let titleHeader = header.querySelector("#title-header");
        let groupHeader = header.querySelector("#group-header");
        if (titleHeader && groupHeader) {
            if (showGroup) {
                let currentGroup = await getCurrentGroup();
                header.querySelector(".group-title").innerHTML = currentGroup.data().groupName;
            }
            groupHeader.style.display = showGroup ? "flex" : "none";
            titleHeader.style.display = showGroup ? "none" : "flex";
        }

        // Configure the avatar visibility and content.
        let avatar = header.querySelector("#profile-picture-container");
        if (avatar) {
            if (currentUser) {
                header.querySelector("#profile-picture").src = currentUser.data().profilePhoto || "../public/images/blank_avatar.jpeg";
                avatar.style.display = showAvatar ? "block" : "none";
            } else {
                avatar.style.display = "none";
            }
        }

        // Configure the login/logout button visibility and behavior.
        let headerButtons = header.querySelector("#header-buttons");
        if (headerButtons) {
            headerButtons.style.display = !showAvatar && showButton ? "block" : "none";
            if (!showAvatar && showButton) {
                let loginButton = headerButtons.querySelector("#login-button");
                let logoutButton = headerButtons.querySelector("#logout-button");

                // Show the logout button if the user is logged in.
                if (currentUser) {
                    loginButton.style.display = "none";
                    logoutButton.style.display = "block";
                    logoutButton.addEventListener("click", () => {
                        auth.signOut()
                            .then(() => {
                                window.location.href = "../index.html";
                            })
                            .catch((error) => {
                                console.error("Error signing out: ", error);
                            });
                    });
                }
                // Show the login button if the user is not logged in.
                else {
                    loginButton.style.display = "block";
                    logoutButton.style.display = "none";
                    loginButton.addEventListener("click", () => {
                        window.location.href = "./html/login.html?mode=login";
                    });
                }
            } else {
                headerButtons.style.display = "none";
            }
        }
    }
}

/**
 * Dynamically loads a match card into a specified container.
 * Fetches user data from Firestore using the provided UID and populates the card's content.
 *
 * @param {string} containerSelector - The CSS selector for the container where the match card will be inserted.
 * @param {string} uid - The unique identifier of the user whose data will populate the match card.
 * @param {string} matchCardHTML - The HTML template for the match card structure.
 * @returns {Promise<HTMLElement>} - The created match card element.
 */
export async function loadMatchCard(containerSelector, uid, matchCardHTML, calculateMatchPercentage = true) {
    let container = document.querySelector(containerSelector);
    if (!container) {
        throw new Error(`Container does not exist`);
    }

    await cacheCurrentUser(true); // Cache the current user's data.
    await cacheGroupUsers(); // Cache the group users' data.

    let cardUser = usersCache[uid];

    if (!cardUser) {
        throw new Error(`No user found with the given ID: ${uid}`);
    }

    let tempDiv = document.createElement("div");
    tempDiv.innerHTML = matchCardHTML;

    let card = tempDiv.firstElementChild;
    if (card) {
        if (calculateMatchPercentage) {
            let matchPercent = Math.ceil(getCompatibility(currentUser.data(), cardUser)[0]) + "%";
            card.querySelector(".match-card-percent").textContent = matchPercent;
        }
        card.querySelector(".match-card-name").textContent = cardUser.name || "Unknown";
        card.querySelector(".match-card-image").setAttribute("src", cardUser.profilePhoto || "../public/images/blank_avatar.jpeg");
        let commonInterests = await getCommonInterests(currentUser.data(), cardUser, 2);
        card.querySelectorAll(".match-card-info").forEach((info, index) => {
            if (commonInterests[index]) {
                let output = "";
                if (commonInterests[index].type === "value") {
                    output = "also values ";
                } else {
                    output = "also likes ";
                }
                output = output + commonInterests[index].word;
                info.innerHTML = output;
            } else {
                info.innerHTML = "";
            }
        });

        container.appendChild(card);
        card.addEventListener("click", () => {
            window.location.href = `profile.html?uid=${uid}`;
        });
        return card;
    }
}

/**
 * Caches the group users' data to a local variable.
 * Only makes a Firestore call if the cache doesn't exist or the reload flag is true.
 *
 * @param {boolean} reload - Whether to force a reload of the cache.
 * @returns {Promise<void>}
 */
async function cacheGroupUsers(reload = false) {
    if (!usersCache || reload) {
        usersCache = await getAllUsersInGroup(); // Fetch all users in the group from Firestore.
    }
}

/**
 * Caches the current user's data to a local variable.
 * Only makes a Firestore call if the cache doesn't exist or the reload flag is true.
 *
 * @param {boolean} reload - Whether to force a reload of the cache.
 * @returns {Promise<void>}
 */
async function cacheCurrentUser(reload = false) {
    if (!currentUser || reload) {
        currentUser = await getUserData(); // Fetch the current user's data from Firestore.
    }
}
