/**
 * This script manages the functionality for the landing page (index.html).
*/

import { getUser } from "../scripts/app.js";
import { loadHeader } from "../scripts/loadContent.js";

initialize();

/**
 * Initializes the landing page.
 * Checks if the user is logged in and redirects to main.html if they are.
 * Loads the header for the landing page.
 * 
 * @returns {Promise<void>}
 */
async function initialize() {
    let user = await getUser(); // Check if the user is logged in.
    if (user) {
        window.location.href = "./html/main.html"; // Redirect to the main page if the user is logged in.
    }
    loadHeader(
        false, // Do not show the back button.
        false, // Do not show the group button.
        false, // Do not show the profile image.
        true // Show the login/logout button.
    );
}
