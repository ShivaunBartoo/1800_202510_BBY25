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
