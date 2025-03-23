import { db, getUserData } from "../scripts/app.js";

initialize();

// This function initializes the account page from current user data
async function initialize() {
    let user = await getUserData();

    if (user) {
        document.querySelector("#bigName").innerHTML = user.data().name;
        document.querySelector("#profile-picture-large").setAttribute("src", user.data().profilePhoto);
    } else {
        window.location.href = "./404.html";
        console.log("Error: User not found");
    }
}
