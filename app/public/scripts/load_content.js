import { user } from "../scripts/app.js";

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
export async function loadHeader(showBackButton, showGroup = false, showAvatar = true) {
    await loadContent("header", "./components/header.html");
    let header = document.querySelector("header");
    if (header) {
        let backButton = header.querySelector(".header-back-button");
        let titleHeader = header.querySelector("#title-header");
        let groupHeader = header.querySelector("#group-header");
        let avatar = header.querySelector("#profile-picture");

        if (backButton) {
            backButton.style.display = showBackButton ? "block" : "none";
            backButton.setAttribute("href", document.referrer);
        }
        if (titleHeader && groupHeader) {
            groupHeader.style.display = showGroup ? "flex" : "none";
            titleHeader.style.display = showGroup ? "none" : "flex";
        }
        if (avatar && user) {
            avatar.style.display = showAvatar ? "block" : "none";
            //TODO: Set the avatar image source
        }
    }
}
