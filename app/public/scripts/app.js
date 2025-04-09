/**
 * This script initializes and manages the Firebase app, Firestore database, and authentication.
 * It provides utility functions for interacting with Firebase services, such as retrieving user data,
 * managing groups, and handling authentication. This script is used across multiple pages in the application
 * to ensure consistent access to Firebase resources and user session management.
 */

import "https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js";
import "https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js";
import "https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js";
import { firebaseConfig } from "../scripts/firebaseAPI_BBY25.js";

// App Constants
export const app = firebase.initializeApp(firebaseConfig);
export const db = firebase.firestore();
export const auth = firebase.auth();

let cachedGroup = null; // Cache for the current group

await authenticatePage();

/**
 * Retrieves the current Firebase user or waits for auth state changes.
 *
 * @returns {Promise<Object>} The current Firebase user object.
 */
export async function getUser() {
    if (auth.currentUser) {
        return auth.currentUser;
    } else {
        return new Promise((resolve) => {
            auth.onAuthStateChanged((user) => {
                resolve(user);
            });
        });
    }
}

/**
 * Retrieves the user data from Firestore.
 * Reads the user document from the "users" collection in Firestore.
 *
 * @returns {Promise<Object|null>} The Firestore document for the user, or null if not found.
 */
export async function getUserData() {
    const user = await getUser();
    if (user) {
        try {
            const userDoc = await db.collection("users").doc(user.uid).get();
            if (userDoc.exists) {
                return userDoc;
            } else {
                console.log("No document found for the user");
                return null;
            }
        } catch (error) {
            console.error("Error fetching user document:", error);
            throw error;
        }
    } else {
        console.log("No user found");
        return null;
    }
}

/**
 * Retrieves all users in the current group from Firestore.
 * Reads the "users" collection and filters users based on the active group.
 *
 * @returns {Promise<Object>} An object containing user IDs as keys and user data as values.
 */
export async function getAllUsersInGroup() {
    let users = {};
    let group = await getCurrentGroup();
    if (!group) {
        console.error("No group found.");
        return users;
    }

    let usersSnapshot = await db.collection("users").get();
    usersSnapshot.forEach((userDoc) => {
        if (group.data().users.includes(userDoc.id)) {
            users[userDoc.id] = userDoc.data();
        }
    });
    return users;
}

/**
 * Retrieves the current group document from Firestore.
 * Reads the "groups" collection and fetches the group associated with the user's active group.
 *
 * @returns {Promise<Object|null>} The Firestore document for the current group, or null if not found.
 */
export async function getCurrentGroup() {
    if (cachedGroup) {
        return cachedGroup;
    }

    const userData = await getUserData();
    if (userData) {
        try {
            const groupDoc = await db.collection("groups").doc(userData.data().activeGroup).get();
            if (groupDoc.exists) {
                cachedGroup = groupDoc; // Cache the group document
                return groupDoc;
            } else {
                console.log("No active group found.");
                return null;
            }
        } catch (error) {
            console.error("Error fetching group document:", error);
            throw error;
        }
    } else {
        console.log("No user data found");
        return null;
    }
}

/**
 * Clears the cached group data.
 * This is useful when the user switches groups or the group data needs to be refreshed.
 */
export function clearCachedGroup() {
    cachedGroup = null;
    console.log("Cached group cleared.");
}

/**
 * Sets the destination for the back button on the header.
 *
 * @param {string} href - The URL to set as the back button's destination.
 */
export function setBackButtonDestination(href) {
    document.querySelector(".header-back-button").setAttribute("href", href);
}

/**
 * Sets up the functionality for copying the group share link.
 */
export function setupShareLinkFunctionality() {
    const groupShareLink = document.querySelector("#group-share-link");

    groupShareLink.addEventListener("click", async () => {
        const group = await getCurrentGroup();
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

/**
 * Authenticates the page based on meta tags and user data.
 * Redirects the user to appropriate pages if authentication or setup is required.
 */
async function authenticatePage() {
    const requiresAuthElement = document.querySelector('meta[name="requires-auth"]');
    const requiresSetupElement = document.querySelector('meta[name="requires-setup"]');
    const requiresAuth = requiresAuthElement ? requiresAuthElement.content : false;
    const requiresSetup = requiresSetupElement ? requiresSetupElement.content : false;

    if (requiresAuth || requiresSetup) {
        let userData = await getUserData();
        if (requiresAuth && !auth.currentUser) {
            // Redirect to the login page if authentication is required and no user is logged in
            window.location.href = `../index.html`;
        } else if (!userData || userData.data().activeGroup == null) {
            // Redirect to the group creation/join page if no active group is set
            window.location.href = `./create_or_join.html`;
        } else if (requiresSetup && userData.data().hasProfile == false) {
            // Redirect to the profile setup page if setup is required and the profile is incomplete
            window.location.href = `./profile_setup.html`;
        }
    }
}
