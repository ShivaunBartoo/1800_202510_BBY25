import { getUserData, getAllUsersInGroup, getCurrentGroup, auth, db } from "./app.js";
import { getCompatibility, getCommonInterests } from "./groupManager.js";

let matchcard;
let usersCache = null;
let currentUser = null;

// This function loads HTML content from a specified file path
// and inserts it into elements matching a given selector.
export async function loadContent(selector, filePath) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
        try {
            const response = await fetch(filePath); // Fetch the content from the specified file path
            if (!response.ok) {
                throw new Error(`Failed to load ${filePath}: ${response.statusText}`);
            }
            const html = await response.text(); // Wait for the response to be converted to text
            element.innerHTML = html; // Insert the fetched HTML content into the element
        } catch (error) {
            console.error(`Error loading ${filePath} into ${selector}:`, error);
        }
    }
}

// loads the header component into the page, and confures its elements.
// It is used on all pages in the app.
export async function loadHeader(showBackButton = false, showGroup = false, showAvatar = true, showButton = false) {
    await loadContent("header", "./components/header.html");
    let header = document.querySelector("header");
    await cacheCurrentUser();
    if (header) {
        let backButton = header.querySelector(".header-back-button");
        let titleHeader = header.querySelector("#title-header");
        let groupHeader = header.querySelector("#group-header");
        let avatar = header.querySelector("#profile-picture-container");
        let headerButtons = header.querySelector("#header-buttons");

        if (backButton) {
            backButton.style.display = showBackButton ? "block" : "none";
        }
        if (titleHeader && groupHeader) {
            if (showGroup) {
                let currentGroup = await getCurrentGroup();
                header.querySelector(".group-title").innerHTML = currentGroup.data().groupName;
            }
            groupHeader.style.display = showGroup ? "flex" : "none";
            titleHeader.style.display = showGroup ? "none" : "flex";
        }
        if (avatar) {
            if (currentUser) {
                header.querySelector("#profile-picture").src =
                    currentUser.data().profilePhoto || "../public/images/blank_avatar.jpeg";
                avatar.style.display = showAvatar ? "block" : "none";
            } else {
                avatar.style.display = "none";
            }
        }
        if (headerButtons) {
            // Because the avatar and header buttons are in the same spot, only one
            // should be shown at a time. If both are set to true, the avatar will be shown
            headerButtons.style.display = !showAvatar && showButton ? "block" : "none";
            if (!showAvatar && showButton) {
                headerButtons.style.display = "block";
                let loginButton = headerButtons.querySelector("#login-button");
                let logoutButton = headerButtons.querySelector("#logout-button");
                // Check if the user is logged in, and show the logout button if they are
                if (currentUser) {
                    console.log("User is logged in");
                    loginButton.style.display = "none";
                    logoutButton.style.display = "block";
                    logoutButton.addEventListener("click", () => {
                        auth.signOut()
                            .then(() => {
                                window.location.href = "./index.html";
                            })
                            .catch((error) => {
                                console.error("Error signing out: ", error);
                            });
                    });
                }
                // If the user is not logged in, show the login button
                else {
                    console.log("User is logged out");
                    loginButton.style.display = "block";
                    logoutButton.style.display = "none";
                    loginButton.addEventListener("click", () => {
                        window.location.href = "./login.html?mode=login";
                    });
                }
            } else {
                headerButtons.style.display = "none";
            }
        }
    }
}

// This function loads a match card into a specified container.
// It retrieves user data from Firestore using the provided UID and updates the card's content.
// It is used in the group.html and main.html pages.
export async function loadMatchCard(containerSelector, uid, matchCardHTML) {
    let container = document.querySelector(containerSelector);
    if (!container) {
        throw new Error(`Container does not exist`);
    }

    await cacheCurrentUser();
    await cacheGroupUsers();
    let cardUser = usersCache[uid];

    if (!cardUser) {
        throw new Error(`No user found with the given ID: ${uid}`);
    }

    let tempDiv = document.createElement("div");
    tempDiv.innerHTML = matchCardHTML;

    let card = tempDiv.firstElementChild;
    if (card) {
        let matchPercent = Math.ceil(getCompatibility(currentUser.data(), cardUser)[0]) + "%";
        console.log("compatability for " + cardUser.name + ": " + matchPercent + "%");
        card.querySelector(".match-card-percent").textContent = matchPercent;
        card.querySelector(".match-card-name").textContent = cardUser.name || "Unknown";
        card.querySelector(".match-card-image").setAttribute(
            "src",
            cardUser.profilePhoto || "../public/images/blank_avatar.jpeg"
        );
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
    }
}

//populates the user cache
//only makes a db call if the cache doesn't exist or the reload flag is true.
async function cacheGroupUsers(reload = false) {
    if (!usersCache || reload) {
        usersCache = await getAllUsersInGroup();
    }
}

//caches the currentUser to a local variable.
//only makes a db call if the cache doesn't exist or the reload flag is true.
async function cacheCurrentUser(reload = false) {
    if (!currentUser) {
        currentUser = await getUserData();
    }
}
