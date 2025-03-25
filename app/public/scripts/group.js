import { loadHeader, loadMatchCard } from "./loadContent.js";
import { getGroupMembers } from "./groupManager.js";
import { getUser, getCurrentGroup } from "./app.js";
async function initialize() {
    // loads the header with a back button, group, and profile image
    loadHeader(true, true, true);
    let currentUser = await getUser();
    const response = await fetch("./components/match_card.html");
    if (!response.ok) {
        throw new Error(`Failed to load match_card.html: ${response.statusText}`);
    }
    const matchCardHTML = await response.text();

    const group = await getCurrentGroup();
    if (group) {
        const groupMembers = await getGroupMembers(group.id);
        document.querySelector("#member-count").innerHTML = groupMembers.length;
        for (const member of groupMembers) {
            if (member.id != currentUser.uid) {
                loadMatchCard("#member-list", member.id, matchCardHTML);
            }
        }
    } else {
        window.location.href = "./main.html";
    }
}
initialize();
