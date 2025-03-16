import { db, getUser } from "../scripts/app.js";

initialize();

async function initialize() {
    let params = new URLSearchParams(window.location.search);
    let user = null;
    let uid = params.get("uid") || (await getUser()).uid;
    if (uid) {
        let userDoc = await db.collection("users").doc(uid).get();
        user = userDoc.data();
    }
    if (user) {
        document.querySelector("#user-name").innerHTML = user.name;
        document.querySelector("#profile-bio").innerHTML = user.bio;
        // document.querySelector("#profile-image").src = user.profileImage;
        let interestList = document.querySelector("#interest-list");

        for (let interest in user.interests) {
            console.log(interest + ": " + user.interests[interest]);
        }
    } else {
        window.location.href = "./404.html";
        console.log("Error: User not found");
    }
}

// Example URL of a valid profile page:
//http://127.0.0.1:5500/app/html/profile.html?uid=gQU0BFofIdU62MllKWlbAuw9k2F2
