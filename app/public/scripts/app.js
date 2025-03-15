import "https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js";
import "https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js";
import "https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js";
import { firebaseConfig } from "../scripts/firebaseAPI_BBY25.js";

// App Constants
export const app = firebase.initializeApp(firebaseConfig);
export const db = firebase.firestore();
export const auth = firebase.auth();
export let user = null;

// Monitor authentication state
auth.onAuthStateChanged((currentUser) => {
    if (currentUser) {
        user = currentUser;
        console.log("User logged in:", user.uid);
    } else {
        console.log("User logged out:", user.uid);
        user = null;
    }
});

document.addEventListener("DOMContentLoaded", () => {
    let requiresAuth = document.body.getAttribute("requires-auth");
    let requiresSetup = document.body.getAttribute("requires-setup");
});
