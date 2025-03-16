import { getUser } from "../scripts/app.js";

initialize();

// Check if the user is logged in and redirect to main.html if they are
async function initialize() {
    let user = await getUser();
    console.log("User:", user);
    if (user) {
        window.location.href = "./main.html";
    }
}
