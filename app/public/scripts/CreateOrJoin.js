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
 * Sets up event listeners for creating a group, joining a group, and toggling between the two forms.
 */
function initialize() {
    loadHeader(false, false, false, false); // Load the header without any buttons.

    /**
     * Handles the "Create Group" form submission.
     * Writes the new group data to Firestore and updates the user's active group.
     * 
     * @param {Event} event - The form submission event.
     */
    document.getElementById("createGroup").addEventListener("submit", async (event) => {
        event.preventDefault();
        const user = auth.currentUser; // Get the currently authenticated user.
        if (user) {
            const groupName = document.getElementById("groupName").value; // Get the group name from the input field.
            if (groupName) {
                let group = await createGroup(groupName, user.uid); // Create a new group in Firestore.

                // Update the user's active group in Firestore.
                await db.collection("users").doc(user.uid).update({
                    activeGroup: group.id,
                });
                location.href = "./profile_setup.html"; // Redirect to the profile setup page.
            } else {
                // Show a warning if the group name is blank.
                let warning = document.querySelector("#blank-name");
                warning.style.display = "block";
                document.getElementById("groupName").value = "";
            }
        } else {
            console.log("User is not logged in");
        }
    });

    // Toggle between the "Create Group" and "Join Group" forms when the user clicks the switcher buttons.
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

    // Hide all warning messages when the user clicks on any text input field.
    document.querySelectorAll("input[type='text']").forEach((input) => {
        input.addEventListener("click", () => {
            document.querySelectorAll(".warning").forEach((warning) => {
                warning.style.display = "none";
            });
        });
    });

    /**
     * Handles the "Join Group" form submission.
     * Reads the group data from Firestore and updates the user's active group if the group exists.
     * 
     * @param {Event} event - The form submission event.
     */
    document.getElementById("joinGroup").addEventListener("submit", async (event) => {
        event.preventDefault();
        const user = auth.currentUser; // Get the currently authenticated user.
        if (user) {
            let groupID = document.getElementById("groupCode").value; // Get the group code from the input field.
            if (!groupID) {
                groupID = defaultGroupCode; // Use the default group code if none is provided.
            }
            console.log(groupID);
            let group = await getGroup(groupID); // Fetch the group data from Firestore.
            if (group.exists) {
                addToGroup(groupID, user.uid); // Add the user to the group in Firestore.

                // Update the user's active group in Firestore.
                await db.collection("users").doc(user.uid).update({
                    activeGroup: groupID,
                });
                location.href = "./profile_setup.html"; // Redirect to the profile setup page.
            } else {
                // Show a warning if the group code is invalid.
                let warning = document.querySelector("#bad-group-code");
                warning.style.display = "block";
                document.getElementById("groupCode").value = "";

                console.log("Invalid group code.");
            }
        } else {
            console.log("User is not logged in");
        }
    });
}
