import { getUser, auth, db } from "./app.js";

let matchcard;

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

// loads the header component into the page, and confures its elements
export async function loadHeader(showBackButton = false, showGroup = false, showAvatar = true, showButton = false) {
    await loadContent("header", "./components/header.html");
    let header = document.querySelector("header");
    let user = await getUser();
    if (header) {
        let backButton = header.querySelector(".header-back-button");
        let titleHeader = header.querySelector("#title-header");
        let groupHeader = header.querySelector("#group-header");
        let avatar = header.querySelector("#profile-picture");
        let headerButtons = header.querySelector("#header-buttons");

        if (backButton) {
            backButton.style.display = showBackButton ? "block" : "none";
            backButton.setAttribute("href", document.referrer);
        }
        if (titleHeader && groupHeader) {
            groupHeader.style.display = showGroup ? "flex" : "none";
            titleHeader.style.display = showGroup ? "none" : "flex";
        }
        if (avatar) {
            if (user) {
                //TODO: Set the avatar image source
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
                if (user) {
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

export async function loadMatchCard(containerSelector, uid, matchCardHTML) {
    let container = document.querySelector(containerSelector);
    if (!container) {
        throw new Error(`Container does not exist`);
    }

    let user = await db.collection("users").doc(uid).get();
    if (!user.exists) {
        throw new Error(`No user found with the given ID: ${uid}`);
    }

    let userData = user.data();

    let tempDiv = document.createElement("div");
    tempDiv.innerHTML = matchCardHTML;

    let card = tempDiv.firstElementChild;
    if (card) {
        card.querySelector(".match-card-name").textContent = userData.name || "Unknown";

        container.appendChild(card);
        card.addEventListener("click", () => {
            window.location.href = `profile.html?uid=${uid}`;
        });
    }
}
