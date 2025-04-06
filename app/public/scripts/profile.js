/**
 * This script manages the functionality for the profile page (profile.html).
 * It retrieves user data from Firestore and dynamically populates the profile page with the user's information.
 * The script also handles displaying the user's interests, values, and contact information if they are a match.
 * 
 * This script is used exclusively on the profile.html page.
 */

import { db, getUser, getUserData, setBackButtonDestination } from "../scripts/app.js";
import { loadHeader } from "../scripts/loadContent.js";
import { getCommonInterests } from "../scripts/groupManager.js";

initialize();
const MAX_NOUNS = 20; // Maximum number of interests or values to display on the profile page.

/**
 * Initializes the profile page by retrieving user data from Firestore.
 * Dynamically updates the UI with the user's profile information, interests, values, and contact details.
 * 
 * @returns {Promise<void>}
 */
async function initialize() {
    loadHeader(
        true, // Show back button.
        true, // Show group button.
        true, // Show profile image.
        false // Do not show login/logout button.
    ).then(() => setBackButtonDestination("javascript:history.back()")); 

    let params = new URLSearchParams(window.location.search); // Parse URL parameters.
    let user = null;
    let userDoc = null;

    // Check if the URL contains a "uid" parameter.
    // If not, default to the current user's UID.
    let uid = params.get("uid") || (await getUser()).uid;
    if (uid) {
        userDoc = await db.collection("users").doc(uid).get(); // Fetch the user's document from Firestore.
        user = userDoc.data(); // Extract the user data.
    }

    if (user) {
        // Populate the profile page with the user's information.
        document.querySelector("#user-name").innerHTML = user.name;
        document.querySelector("#profile-bio").innerHTML = user.bio;
        document.querySelector("#user-picture").setAttribute("src", user.profilePhoto);

        // Display the user's top interests.
        let interestList = document.querySelector("#interest-container");
        let interestCount = 0;
        for (let interest in user.interests) {
            if (user.interests[interest] === 2 && interestCount <= MAX_NOUNS) {
                interestList.innerHTML += `<span class="noun-bubble">${interest}</span>`;
                interestCount++;
            }
        }

        // Display the user's top values.
        let valueList = document.querySelector("#value-container");
        let valueCount = 0;
        for (let value in user.values) {
            if (user.values[value] === 2 && valueCount <= MAX_NOUNS) {
                valueList.innerHTML += `<span class="noun-bubble">${value}</span>`;
                valueCount++;
            }
        }

        // Check if the current user is a match with the profile user.
        let currentUserData = await getUserData(); // Fetch the current user's data from Firestore.
        if (currentUserData.data().currentMatches.includes(userDoc.id)) {
            // Display the contact information if the users are a match.
            let contactContainer = document.querySelector("#contact-container");
            contactContainer.style.display = "flex";
            contactContainer.querySelector(".name").innerHTML = user.name.split(" ")[0];
            contactContainer.querySelector("#contact-method").innerHTML = user.contactMethod + ": ";
            contactContainer.querySelector("#contact-info").innerHTML = user.contactInfo;
        }
    } else {
        // Redirect to a 404 page if the user is not found.
        window.location.href = "./404.html";
        console.log("Error: User not found");
    }
}

// Example URL of a valid profile page:
// http://127.0.0.1:5500/app/html/profile.html?uid=gQU0BFofIdU62MllKWlbAuw9k2F2
