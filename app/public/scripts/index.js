import { getUser } from "../scripts/app.js";

initialize();

async function initialize() {
    let user = await getUser();
    console.log("User:", user);
    // Check if the user is logged in and redirect to main.html if they are
    if (user) {
        window.location.href = "./main.html";
    }
}
