import { db, getUserData } from "../scripts/app.js";

initialize();

// This function initializes the account page from current user data
async function initialize() {
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
            switch(score){
                case 2: document.querySelector("#very-interested").innerHTML += `<span class="noun-bubble">${interest}</span>`;
                break;
                case 1: document.querySelector("#mildly-interested").innerHTML +=`<span class="noun-bubble">${interest}</span>`;
                break;
                case 0: document.querySelector("#no-opinion").innerHTML +=`<span class="noun-bubble">${interest}</span>`;
                case -1: document.querySelector("#mildly-disinterested").innerHTML +=`<span class="noun-bubble">${interest}</span>`;
                case -2: document.querySelector("#very-disinterested").innerHTML +=`<span class="noun-bubble">${interest}</span>`;

            }

            // if (udata.interests[interest] === 2) {
            // }
        }
    } else {
        window.location.href = "./404.html";
        console.log("Error: User not found");
    }
}
