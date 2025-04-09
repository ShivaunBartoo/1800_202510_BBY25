/**
 * This script manages the group page functionality.
 * It loads the group header, displays the current user's matches, and shows group member details.
 *
 * This script is used on the group.html page to provide an overview of the user's group and matches.
 * Firestore is used to fetch group and user data.
 */

import { loadHeader, loadMatchCard } from "./loadContent.js";
import { getGroupMembers } from "./groupManager.js";
import { getUserData, getCurrentGroup, setBackButtonDestination, setupShareLinkFunctionality } from "./app.js";

// The gap (in milliseconds) between revealing each match card or group member card.
const revealGap = 50;

initialize();

/**
 * Initializes the group page by loading the header, matches, and group member details.
 * Fetches user and group data from Firestore and dynamically updates the UI.
 *
 * @returns {Promise<void>}
 */
async function initialize() {
    loadHeader(
        true, // show back button
        true, // show group
        true, // show profile image
        false // do not show login/logout button
    ).then(() => setBackButtonDestination("main.html"));

    const currentUser = await getUserData();
    const matchCardHTML = await fetchMatchCardTemplate();
    const currentMatches = currentUser.data().currentMatches;

    await displayUserMatches(currentUser, currentMatches, matchCardHTML);
    setupShareLinkFunctionality();

    const group = await getCurrentGroup();
    const groupMembers = await getGroupMembers(group.id);
    document.querySelector("#member-count").innerHTML = groupMembers.length;
    displayGroupMembers(currentUser, groupMembers, currentMatches, matchCardHTML);
}

/**
 * Fetches the match card HTML template.
 *
 * @returns {Promise<string>} The HTML content of the match card template.
 */
async function fetchMatchCardTemplate() {
    const response = await fetch("./components/match_card.html");
    if (!response.ok) {
        throw new Error(`Failed to load match_card.html: ${response.statusText}`);
    }
    return await response.text();
}

/**
 * Displays the user's matches using match cards.
 *
 * @param {Object} currentUser - The current user's data.
 * @param {string} matchCardHTML - The HTML template for match cards.
 * @returns {Promise<void>}
 */
async function displayUserMatches(currentUser, currentMatches, matchCardHTML) {
    if (!currentMatches || currentMatches.length == 0) {
        // Show a "no matches" message if there are no matches.
        document.querySelector("#no-matches").style.display = "block";
        document.querySelector("#match-list .loader").style.display = "none";
    } else {
        // Load match cards for each match in reverse order.
        let delay = 0;

        for (let i = currentMatches.length - 1; i >= 0; i--) {
            loadMatchCard("#match-list", currentMatches[i], matchCardHTML).then((card) => {
                document.querySelector("#match-list .loader").style.display = "none";
                if (card) {
                    animateReveal(card, delay);
                    delay += revealGap;
                }
            });
        }
    }

    // Update the "All Matches" header with the number of matches.
    const allMatchesHeader = document.querySelector("#all-matches");
    allMatchesHeader.textContent = currentMatches ? `All Matches (${currentMatches.length})` : "All Matches (0)";
}

/**
 * Displays group members by loading and rendering match cards for each member.
 * Filters out the current user and members already in the current matches list.
 * Dimmed styling is applied to the cards of members who are not in the current matches.
 *
 * @param {Object} currentUser - The current user object.
 * @param {Array<Object>} groupMembers - An array of group member objects to display.
 * @param {Array<Object>} [currentMatches] - An optional array of current match objects.
 * @param {string} matchCardHTML - The HTML template string for a match card.
 * @returns {Promise<void>} Resolves when all member cards are processed.
 */
async function displayGroupMembers(currentUser, groupMembers, currentMatches, matchCardHTML) {
    let delay = 0;
    for (let member of groupMembers) {
        if (!currentMatches?.includes(member.id) && member.id != currentUser.id) {
            loadMatchCard("#member-list", member.id, matchCardHTML, false).then((card) => {
                if (card) {
                    document.querySelector("#member-list .loader").style.display = "none";
                    card.style.filter = "grayscale(80%)";
                    animateReveal(card, delay);
                    delay += revealGap;
                }
            });
        }
    }
}

function animateReveal(card, delay) {
    card.style.opacity = "0";
    card.style.transition = "opacity 1s ease";
    setTimeout(() => {
        card.style.opacity = "";
        card.style.transition = "";
    }, delay);
}
