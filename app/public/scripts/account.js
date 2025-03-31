import { db, getUserData, setBackButtonDestination, getUser, auth } from "../scripts/app.js";
import { loadContent, loadHeader } from "../scripts/loadContent.js";

let dragged;
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
        document.querySelector("#contactMethod").innerHTML = udata.contactMethod;
        document.querySelector("#contactInfo").innerHTML = udata.contactInfo;
        document.querySelector('#bio').innerHTML = udata.bio;
        addBubbles(udata);


        document.querySelectorAll('.noun-bubble').forEach((bubble) =>{
            bubble.addEventListener('drag', (event) => {
            })
            bubble.addEventListener('dragstart', (event) => {
                dragged = event.target;
                event.target.classList.add('dragging');
            })
            bubble.addEventListener('dragover', (event) => {
                event.preventDefault();
            }, false)
            bubble.addEventListener('drop', (event) => {
                event.preventDefault();
                let parent = event.target.parentNode;
                parent.appendChild(dragged)
                let newValue = parseInt(parent.dataset.value);
                let noun = dragged.innerHTML;
                if (noun in udata.interests) {
                    addNoun(noun, newValue, true);
                } else if(noun in udata.values) {
                    addNoun(noun, newValue, false);
                } else {
                    console.log('Something went wrong')
                }
            })
        })

        addDragListeners(udata);
        addEditListeners();
        onSubmit(udata);

    } else {
        window.location.href = "./404.html";
        console.log("Error: User not found");
    }
}

function addBubbles(udata) {
    for (let interest in udata.interests) {
        let score = udata.interests[interest];
        switch(score){
            case 2: document.querySelector("#very-interested").innerHTML += `<span class="noun-bubble" draggable="true">${interest}</span>`;
            break;
            case 1: document.querySelector("#mildly-interested").innerHTML +=`<span class="noun-bubble" draggable="true">${interest}</span>`;
            break;
            case 0: document.querySelector("#no-opinion").innerHTML +=`<span class="noun-bubble" draggable="true">${interest}</span>`;
            break;
            case -1: document.querySelector("#mildly-disinterested").innerHTML +=`<span class="noun-bubble" draggable="true">${interest}</span>`;
            break;
            case -2: document.querySelector("#very-disinterested").innerHTML +=`<span class="noun-bubble" draggable="true">${interest}</span>`;
        }
    }

    for (let value in udata.values) {
        let score = udata.values[value];
        switch(score){
            case 2: document.querySelector("#very-interested").innerHTML += `<span class="noun-bubble" draggable="true">${value}</span>`;
            break;
            case 1: document.querySelector("#mildly-interested").innerHTML +=`<span class="noun-bubble" draggable="true">${value}</span>`;
            break;
            case 0: document.querySelector("#no-opinion").innerHTML +=`<span class="noun-bubble" draggable="true">${value}</span>`;
            break;
            case -1: document.querySelector("#mildly-disinterested").innerHTML +=`<span class="noun-bubble" draggable="true">${value}</span>`;
            break;
            case -2: document.querySelector("#very-disinterested").innerHTML +=`<span class="noun-bubble" draggable="true">${value}</span>`;
        }
    }
}

function addEditListeners() {
    document.querySelectorAll('.edit').forEach((icon) => {
        icon.addEventListener('click', (event) => {
            let target = event.target.dataset.value;
            let originalValue = document.getElementById(target).innerHTML;
            document.getElementById(target).innerHTML = `<input type='text' id='${target}Input' placeholder='${originalValue}' />`
            document.getElementById('subDiv').innerHTML = `<input type='submit'>`
            console.log(event.target)
            event.target.style.display = 'none';

        });
    });
}

async function onSubmit(udata) {
    let user = await getUser();
    let userDoc = await db.collection('users').doc(user.uid);
    document.getElementById('profile').addEventListener('submit', (event) => {
        event.preventDefault();
        const profileData = {
            name: udata.name,
            email: udata.email,
            contactMethod: udata.contactMethod,
            contactInfo: udata.contactInfo,
            bio: udata.bio
        }

        for (let key in profileData) {
            if(document.getElementById(key + "Input")) {
                if(document.getElementById(key + "Input").value){
                    profileData[key] = document.getElementById(key + "Input").value;
                }
            }
        }
        firebase.auth().currentUser.updateEmail(profileData['email']).then(() => {
            userDoc.set(profileData, {merge: true});
            for(let key in profileData) {
                document.getElementById(key).innerHTML = profileData[key];
            }
            document.querySelectorAll('.edit').forEach((e) => {
                e.style.display = "";
            });
            document.getElementById("subDiv").innerHTML = "";
        }).catch((err) => {
            alert(err);
        });

    });
}
async function addDragListeners(udata) {
    let user = await getUser();
    
    let userDoc = await db.collection('users').doc(user.uid);
    document.querySelectorAll(".noun-container").forEach((container) => {
        container.addEventListener('dragover', (event) => {
            event.preventDefault();
        }, false);

        container.addEventListener('drop', (event) => {
            event.preventDefault();
            // console.log('this is working')
            if(event.target.classList.contains('noun-container')){
                event.target.appendChild(dragged)
                let newValue = parseInt(event.target.dataset.value);
                let noun = dragged.innerHTML;
                if (noun in udata.interests) {
                    addNoun(noun, newValue, true);
                } else if(noun in udata.values) {
                    addNoun(noun, newValue, false);
                } else{
                    console.log('something went wrong')
                }
            }
        });
    });
}

async function addNoun(noun, newValue, isInterest) {
    let user = await getUser();
    let userDoc = await db.collection('users').doc(user.uid);

    if(isInterest) {
        try{
            userDoc.set({
                "interests": {
                    [noun]: newValue
                } 
            }, {merge: true})
        } catch(err) {
            console.log(err);
        }
    } else{
        try{
            userDoc.set({
                "values": {
                    [noun]: newValue
                } 
            }, {merge: true})
        } catch(err) {
            console.log(err);
        }
    }

}