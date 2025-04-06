/**
 * This script manages the group page functionality.
 * It loads the group header, displays the current user's matches, and shows group member details.
 *
 * This script is used on the group.html page to provide an overview of the user's group and matches.
 * Firestore is used to fetch group and user data.
 */

import { loadHeader, loadMatchCard } from "./loadContent.js";
import { getGroupMembers } from "./groupManager.js";
import { getUserData, getCurrentGroup, setBackButtonDestination } from "./app.js";

initialize();

/**
 * Initializes the group page by loading the header, matches, and group member details.
 * Fetches user and group data from Firestore and dynamically updates the UI.
 *
 * @returns {Promise<void>}
 */
async function initialize() {
    // Load the header with a back button, group name, and profile image.
    loadHeader(
        true, // show back button
        true, // show group
        true, // show profile image
        false // do not show login/logout button
    ).then(() => setBackButtonDestination("main.html")); // Set the back button destination to the main page.

    let currentUser = await getUserData(); // Fetch the current user's data from Firestore.

    // Fetch the match card HTML template.
    const response = await fetch("./components/match_card.html");
    if (!response.ok) {
        throw new Error(`Failed to load match_card.html: ${response.statusText}`);
    }
    const matchCardHTML = await response.text();

    // Get the current user's matches and display them.
    let currentMatches = currentUser.data().currentMatches;
    if (!currentMatches || currentMatches.length == 0) {
        // Show a "no matches" message if there are no matches.
        const noMatches = document.querySelector("#no-matches");
        noMatches.style.display = "block";
    } else {
        // Load match cards for each match in reverse order.
        for (let i = currentMatches.length - 1; i >= 0; i--) {
            loadMatchCard("#member-list", currentMatches[i], matchCardHTML);
        }
    }

    // Update the "All Matches" header with the number of matches.
    const allMatchesHeader = document.querySelector("#all-matches");
    allMatchesHeader.textContent = currentMatches ? `All Matches (${currentMatches.length})` : " (0)";

    // Fetch the current group and its members from Firestore.
    const group = await getCurrentGroup(); // Fetch the current group document.
    const groupMembers = await getGroupMembers(group.id); // Fetch the group members.

    // Update the member count in the UI.
    document.querySelector("#member-count").innerHTML = groupMembers.length;

    // Set up the "Copy Group Link" functionality.
    const groupShareLink = document.querySelector("#group-share-link");
    groupShareLink.addEventListener("click", async () => {
        const groupId = group.id; // Get the group ID.
        try {
            // Copy the group ID to the clipboard.
            await navigator.clipboard.writeText(groupId);
            const originalText = groupShareLink.textContent;
            groupShareLink.textContent = "Link copied"; // Show a confirmation message.
            setTimeout(() => {
                groupShareLink.textContent = originalText; // Revert to the original text after 2 seconds.
            }, 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    });
}
