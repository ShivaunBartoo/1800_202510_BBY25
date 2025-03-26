import { db, getUserData, getUser } from "../scripts/app.js";

let dragged;
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
                case 2: document.querySelector("#very-interested").innerHTML += `<span class="noun-bubble" draggable="true">${interest}</span>`;
                break;
                case 1: document.querySelector("#mildly-interested").innerHTML +=`<span class="noun-bubble" draggable="true">${interest}</span>`;
                break;
                case 0: document.querySelector("#no-opinion").innerHTML +=`<span class="noun-bubble" draggable="true">${interest}</span>`;
                case -1: document.querySelector("#mildly-disinterested").innerHTML +=`<span class="noun-bubble" draggable="true">${interest}</span>`;
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
                case -1: document.querySelector("#mildly-disinterested").innerHTML +=`<span class="noun-bubble" draggable="true">${value}</span>`;
                case -2: document.querySelector("#very-disinterested").innerHTML +=`<span class="noun-bubble" draggable="true">${value}</span>`;
            }
        }

        document.querySelectorAll('.noun-bubble').forEach((bubble) =>{
            bubble.addEventListener('drag', (event) => {
                // console.log('dragging');
            })
            bubble.addEventListener('dragstart', (event) => {
                dragged = event.target;
                event.target.classList.add('dragging');
                console.log(dragged.innerHTML);
            })
        })

        addDragListeners(udata);

    } else {
        window.location.href = "./404.html";
        console.log("Error: User not found");
    }
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
                // console.log(event.target.dataset.value)
                // console.log(dragged.innerHTML);
                if (noun in udata.interests) {
                    try{
                        userDoc.set({
                            "interests": {
                                [noun]: newValue
                            } 
                        }, {merge: true})
                    } catch(err) {
                        console.log(err);
                    }
                } else if (noun in udata.values) {
                    try{
                        userDoc.set({
                            "interests": {
                                [noun]: newValue
                            } 
                        }, {merge: true})
                    } catch(err) {
                        console.log(err);
                    }
                } else {
                    console.log('something broke');
                }
            }
        });
    });
}