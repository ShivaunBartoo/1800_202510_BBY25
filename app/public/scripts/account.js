import { db, getUserData, setBackButtonDestination } from "../scripts/app.js";
import { loadContent, loadHeader } from "../scripts/loadContent.js";

initialize();

// This function initializes the account page from current user data
async function initialize() {
    loadContent(".match-card-container", "./components/match_card.html");
    loadHeader(
        true, // show back button
        false, // show group
        false, // show profile image
        true //   show login/logout button
    ).then(() => setBackButtonDestination("main.html"));

    let user = await getUserData();

    if (user) {
        let udata = user.data();
        document.querySelector("#bigName").innerHTML = udata.name;
        document.querySelector("#name").innerHTML = udata.name;
        document.querySelector("#profile-picture-large").setAttribute("src", udata.profilePhoto);
        document.querySelector("#email").innerHTML = udata.email;
        document.querySelector("#contact-method").innerHTML = udata.contactMethod;
        document.querySelector("#contact-info").innerHTML = udata.contactInfo;

        for (let interest in udata.interests) {
            let score = udata.interests[interest];
            switch (score) {
                case 2:
                    document.querySelector(
                        "#very-interested"
                    ).innerHTML += `<span class="noun-bubble">${interest}</span>`;
                    break;
                case 1:
                    document.querySelector(
                        "#mildly-interested"
                    ).innerHTML += `<span class="noun-bubble">${interest}</span>`;
                    break;
                case 0:
                    document.querySelector("#no-opinion").innerHTML += `<span class="noun-bubble">${interest}</span>`;
                case -1:
                    document.querySelector(
                        "#mildly-disinterested"
                    ).innerHTML += `<span class="noun-bubble">${interest}</span>`;
                case -2:
                    document.querySelector(
                        "#very-disinterested"
                    ).innerHTML += `<span class="noun-bubble">${interest}</span>`;
            }

            // if (udata.interests[interest] === 2) {
            // }
        }
    } else {
        window.location.href = "./404.html";
        console.log("Error: User not found");
    }
}
