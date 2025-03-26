import { getUser } from "../scripts/app.js";
import { loadHeader } from "../scripts/loadContent.js";

initialize();

// Check if the user is logged in and redirect to main.html if they are
async function initialize() {
    loadHeader(
        false, // show back button
        false, // show group
        false, // show profile image
        true //   show login/logout button
    );
    let user = await getUser();
    console.log("User:", user);
    if (user) {
        window.location.href = "./main.html";
    }
}
