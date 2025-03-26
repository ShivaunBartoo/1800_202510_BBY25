import { loadHeader, loadMatchCard } from "./loadContent.js";
import { getGroupMembers } from "./groupManager.js";
import { getUserData, getCurrentGroup, setBackButtonDestination } from "./app.js";

initialize();

async function initialize() {
    // loads the header with a back button, group, and profile image
    loadHeader(
        true, // show back button
        true, // show group
        true, // show profile image
        false //   show login/logout button
    ).then(() => setBackButtonDestination("main.html"));

    let currentUser = await getUserData();
    const response = await fetch("./components/match_card.html");
    if (!response.ok) {
        throw new Error(`Failed to load match_card.html: ${response.statusText}`);
    }
    const matchCardHTML = await response.text();

    let currentMatches = currentUser.data().currentMatches;
    if (!currentMatches || currentMatches.length == 0) {
        const noMatches = document.querySelector("#no-matches");
        noMatches.style.display = "block";
    } else {
        for (let i = currentMatches.length - 1; i >= 0; i--) {
            loadMatchCard("#member-list", currentMatches[i], matchCardHTML);
        }
    }
    const allMatchesHeader = document.querySelector("#all-matches");
    allMatchesHeader.textContent += currentMatches ? ` (${currentMatches.length})` : " (0)";

    const group = await getCurrentGroup();
    const groupMembers = await getGroupMembers(group.id);
    document.querySelector("#member-count").innerHTML = groupMembers.length;

    const groupShareLink = document.querySelector("#group-share-link");
    groupShareLink.addEventListener("click", async () => {
        const groupId = group.id;
        try {
            await navigator.clipboard.writeText(groupId);
            const originalText = groupShareLink.textContent;
            groupShareLink.textContent = "Link copied";
            setTimeout(() => {
                groupShareLink.textContent = originalText;
            }, 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    });
}
