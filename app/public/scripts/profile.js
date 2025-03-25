import { db, getUser, getUserData } from "../scripts/app.js";
import { loadHeader } from "../scripts/loadContent.js";
import { getCommonInterests } from "../scripts/groupManager.js";

initialize();
const MAX_NOUNS = 20;

// This function initializes the profile page by retrieving user data from Firestore
async function initialize() {
    loadHeader(
        true, // show back button
        true, // show group
        true, // show profile image
        false //   show login/logout button
    );
    let params = new URLSearchParams(window.location.search);
    let user = null;
    // Check if the URL contains a "uid" parameter,
    // and if not, default to the current user's UID
    let uid = params.get("uid") || (await getUser()).uid;
    if (uid) {
        let userDoc = await db.collection("users").doc(uid).get();
        user = userDoc.data();
    }

    if (user) {
        document.querySelector("#user-name").innerHTML = user.name;
        document.querySelector("#profile-bio").innerHTML = user.bio;
        document.querySelector("#user-picture").setAttribute("src", user.profilePhoto);
        let interestList = document.querySelector("#interest-container");
        let interestCount = 0;
        for (let interest in user.interests) {
            if (user.interests[interest] === 2 && interestCount <= MAX_NOUNS) {
                interestList.innerHTML += `<span class="noun-bubble">${interest}</span>`;
                interestCount++;
            }
        }
        let valueList = document.querySelector("#value-container");
        let valueCount = 0;
        for (let value in user.values) {
            if (user.values[value] === 2 && valueCount <= MAX_NOUNS) {
                valueList.innerHTML += `<span class="noun-bubble">${value}</span>`;
                valueCount++;
            }
        }
    } else {
        window.location.href = "./404.html";
        console.log("Error: User not found");
    }
}

// Example URL of a valid profile page:
//http://127.0.0.1:5500/app/html/profile.html?uid=gQU0BFofIdU62MllKWlbAuw9k2F2
