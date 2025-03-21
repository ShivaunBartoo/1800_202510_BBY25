import "https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js";
import "https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js";
import "https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js";
import { firebaseConfig } from "../scripts/firebaseAPI_BBY25.js";

// App Constants
export const app = firebase.initializeApp(firebaseConfig);
export const db = firebase.firestore();
export const auth = firebase.auth();

// copilot helped me get the Promise working with this function
// Retrieves the current Firebase user or waits for auth state changes.
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

// Retrieves the user data from Firestore.
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

let cachedGroup = null; // Cache for the current group

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

// Function to clear the cached group data (e.g., when the user switches groups)
export function clearCachedGroup() {
    cachedGroup = null;
    console.log("Cached group cleared.");
}

export async function getCommonInterests(userID) {}

// Monitor authentication state
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("User logged in:", user.uid);
    } else {
        console.log("User logged out");
    }
});

document.addEventListener("DOMContentLoaded", () => {
    let requiresAuth = document.body.getAttribute("requires-auth");
    let requiresSetup = document.body.getAttribute("requires-setup");
});
