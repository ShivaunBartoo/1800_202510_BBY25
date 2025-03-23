import { db, getUser } from "../scripts/app.js";

initialize();

// This function initializes the profile page by retrieving user data from Firestore
async function initialize() {
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
        let interestList = document.querySelector("#interest-list");
        let interestCount = 0;
        for (let interest in user.interests) {
            if (user.interests[interest] === 5 && interestCount <= 3) {
                interestList.innerHTML += `<li>${interest}</li>`;
                interestCount++;
            }
        }
        let valueList = document.querySelector("#value-list");
        let valueCount = 0;
        for (let value in user.values) {
            if (user.values[value] === 5 && valueCount <= 3) {
                valueList.innerHTML += `<li>${value}</li>`;
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
