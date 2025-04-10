/**
 * This script handles the functionality for creating or joining a group.
 * It is used on createOrJoin.html
 *
 * Firestore is used to store and update group and user data.
 */

import { auth, db } from "./app.js";
import { createGroup, addToGroup, getGroup } from "./groupManager.js";
import { loadHeader } from "./loadContent.js";

const defaultGroupCode = "OVWSdIxoOVFbOTcOjRRN"; // Default group code
initialize();

/**
 * Initializes the "Create or Join Group" page.
 * Coordinates setup of all event listeners and UI elements.
 */
function initialize() {
    loadHeader(
        false, // Do not show the back button
        false, // Do not show the group button
        false, // Do not show the profile image
        false // Do not show the login/logout button
    );
    setupCreateGroupForm();
    setupJoinGroupForm();
    setupFormToggling();
    setupWarningDismissal();
}

/**
 * Sets up the "Create Group" form and its submission handler.
 * Writes new group data to Firestore and updates the user's active group.
 */
function setupCreateGroupForm() {
    document.getElementById("createGroup").addEventListener("submit", async (event) => {
        event.preventDefault();
        const user = auth.currentUser;

        if (!user) {
            console.log("User is not logged in");
            return;
        }

        const groupName = document.getElementById("groupName").value;

        if (!groupName) {
            // Show a warning if the group name is blank
            let warning = document.querySelector("#blank-name");
            warning.style.display = "block";
            document.getElementById("groupName").value = "";
            return;
        }

        // Create group and update user's active group
        let group = await createGroup(groupName, user.uid);
        await db.collection("users").doc(user.uid).update({
            activeGroup: group.id,
        });

        location.href = "./html/profile_setup.html";
    });
}

/**
 * Sets up the "Join Group" form and its submission handler.
 * Reads group data from Firestore and updates the user's active group.
 */
function setupJoinGroupForm() {
    document.getElementById("joinGroup").addEventListener("submit", async (event) => {
        event.preventDefault();
        const user = auth.currentUser;

        if (!user) {
            console.log("User is not logged in");
            return;
        }

        let groupID = document.getElementById("groupCode").value || defaultGroupCode;
        console.log(groupID);

        let group = await getGroup(groupID);

        if (!group.exists) {
            // Show a warning if the group code is invalid
            let warning = document.querySelector("#bad-group-code");
            warning.style.display = "block";
            document.getElementById("groupCode").value = "";
            console.log("Invalid group code.");
            return;
        }

        // Add user to group and update user's active group
        addToGroup(groupID, user.uid);
        await db.collection("users").doc(user.uid).update({
            activeGroup: groupID,
        });

        location.href = "/html/profile_setup.html";
    });
}

/**
 * Sets up toggling between "Create Group" and "Join Group" forms.
 */
function setupFormToggling() {
    document.querySelectorAll(".choice-switcher").forEach((element) => {
        element.addEventListener("click", () => {
            const joinGroup = document.querySelector("#joinGroup");
            const createGroup = document.querySelector("#createGroup");

            if (joinGroup.style.display === "none") {
                joinGroup.style.display = "flex";
                createGroup.style.display = "none";
            } else {
                joinGroup.style.display = "none";
                createGroup.style.display = "flex";
            }
        });
    });
}

/**
 * Sets up automatic dismissal of warning messages when clicking text inputs.
 */
function setupWarningDismissal() {
    document.querySelectorAll("input[type='text']").forEach((input) => {
        input.addEventListener("click", () => {
            document.querySelectorAll(".warning").forEach((warning) => {
                warning.style.display = "none";
            });
        });
    });
}
