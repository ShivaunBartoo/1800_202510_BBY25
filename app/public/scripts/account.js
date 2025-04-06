/**
 * This script manages the account.html functionality.
 * It initializes the account page by loading user data from Firestore,
 * dynamically populates the UI with user information, and provides drag-and-drop
 * and edit functionality for user interests and values.
 */

import { db, getUserData, setBackButtonDestination, getUser, auth } from "../scripts/app.js";
import { loadContent, loadHeader } from "../scripts/loadContent.js";

let dragged;
initialize();

/**
 * Initializes the account page by loading user data and setting up the UI.
 * Reads user data from Firestore and populates the page with user information.
 * Also sets up event listeners for drag-and-drop and edit functionality.
 *
 * @returns {Promise<void>}
 */
async function initialize() {
    loadContent(".match-card-container", "./components/match_card.html");
    await loadHeader(
        true, // show back button
        false, // show group
        false, // show profile image
        true //   show login/logout button
    );
    setBackButtonDestination("main.html");
    let user = await getUserData();

    if (user) {
        let udata = user.data();
        populateUserInfo(udata);
        setupDragAndDrop(udata);
        addDragListeners(udata);
        addEditListeners();
        onSubmit(udata);
    } else {
        window.location.href = "./404.html";
        console.log("Error: User not found");
    }
}

/**
 * Populates the UI with user information.
 *
 * @param {Object} udata - The user data object containing profile information.
 */
function populateUserInfo(udata) {
    document.querySelector("#bigName").innerHTML = udata.name;
    document.querySelector("#name").innerHTML = udata.name;
    document.querySelector("#profile-picture-large").setAttribute("src", udata.profilePhoto);
    document.querySelector("#email").innerHTML = udata.email;
    document.querySelector("#contactMethod").innerHTML = udata.contactMethod;
    document.querySelector("#contactInfo").innerHTML = udata.contactInfo;
    document.querySelector("#bio").innerHTML = udata.bio;
    addBubbles(udata);
}

/**
 * Sets up drag-and-drop functionality for noun bubbles.
 *
 * @param {Object} udata - The user data object containing interests and values.
 */
function setupDragAndDrop(udata) {
    document.querySelectorAll(".noun-bubble").forEach((bubble) => {
        bubble.addEventListener("drag", (event) => {});
        bubble.addEventListener("dragstart", (event) => {
            dragged = event.target;
            event.target.classList.add("dragging");
        });
        bubble.addEventListener(
            "dragover",
            (event) => {
                event.preventDefault();
            },
            false
        );
        bubble.addEventListener("drop", (event) => {
            event.preventDefault();
            handleDrop(event, udata);
        });
    });
}

/**
 * Handles the drop event for noun bubbles.
 *
 * @param {Event} event - The drop event.
 * @param {Object} udata - The user data object containing interests and values.
 */
function handleDrop(event, udata) {
    let parent = event.target.parentNode;
    parent.appendChild(dragged);
    let newValue = parseInt(parent.dataset.value);
    let noun = dragged.innerHTML;
    if (noun in udata.interests) {
        addNoun(noun, newValue, true);
    } else if (noun in udata.values) {
        addNoun(noun, newValue, false);
    } else {
        console.log("Something went wrong");
    }
}

/**
 * Dynamically adds interest and value bubbles to the UI based on user data.
 *
 * @param {Object} udata - The user data object containing interests and values.
 */
function addBubbles(udata) {
    for (let interest in udata.interests) {
        let score = udata.interests[interest];
        // Append interest bubbles to the appropriate container based on their score
        switch (score) {
            case 2:
                document.querySelector(
                    "#very-interested"
                ).innerHTML += `<span class="noun-bubble" draggable="true">${interest}</span>`;
                break;
            case 1:
                document.querySelector(
                    "#mildly-interested"
                ).innerHTML += `<span class="noun-bubble" draggable="true">${interest}</span>`;
                break;
            case 0:
                document.querySelector(
                    "#no-opinion"
                ).innerHTML += `<span class="noun-bubble" draggable="true">${interest}</span>`;
                break;
            case -1:
                document.querySelector(
                    "#mildly-disinterested"
                ).innerHTML += `<span class="noun-bubble" draggable="true">${interest}</span>`;
                break;
            case -2:
                document.querySelector(
                    "#very-disinterested"
                ).innerHTML += `<span class="noun-bubble" draggable="true">${interest}</span>`;
        }
    }

    for (let value in udata.values) {
        let score = udata.values[value];
        // Append value bubbles to the appropriate container based on their score
        switch (score) {
            case 2:
                document.querySelector(
                    "#very-interested"
                ).innerHTML += `<span class="noun-bubble" draggable="true">${value}</span>`;
                break;
            case 1:
                document.querySelector(
                    "#mildly-interested"
                ).innerHTML += `<span class="noun-bubble" draggable="true">${value}</span>`;
                break;
            case 0:
                document.querySelector(
                    "#no-opinion"
                ).innerHTML += `<span class="noun-bubble" draggable="true">${value}</span>`;
                break;
            case -1:
                document.querySelector(
                    "#mildly-disinterested"
                ).innerHTML += `<span class="noun-bubble" draggable="true">${value}</span>`;
                break;
            case -2:
                document.querySelector(
                    "#very-disinterested"
                ).innerHTML += `<span class="noun-bubble" draggable="true">${value}</span>`;
        }
    }
}

/**
 * Adds event listeners to edit icons for inline editing of user profile fields.
 */
function addEditListeners() {
    document.querySelectorAll(".edit").forEach((icon) => {
        icon.addEventListener("click", (event) => {
            let target = event.target.dataset.value;
            let originalValue = document.getElementById(target).innerHTML;
            // Replace the field with an input box for editing
            document.getElementById(
                target
            ).innerHTML = `<input type='text' id='${target}Input' placeholder='${originalValue}' />`;
            document.getElementById("subDiv").innerHTML = `<input type='submit'>`;
            console.log(event.target);
            event.target.style.display = "none";
        });
    });
}

/**
 * Handles form submission for updating user profile data.
 * Writes updated user data to Firestore and updates the UI.
 *
 * @param {Object} udata - The user data object containing current profile information.
 */
async function onSubmit(udata) {
    let user = await getUser();
    let userDoc = await db.collection("users").doc(user.uid);
    document.getElementById("profile").addEventListener("submit", (event) => {
        event.preventDefault();
        const profileData = {
            name: udata.name,
            email: udata.email,
            contactMethod: udata.contactMethod,
            contactInfo: udata.contactInfo,
            bio: udata.bio,
        };

        // Update profileData with new values from input fields
        for (let key in profileData) {
            if (document.getElementById(key + "Input")) {
                if (document.getElementById(key + "Input").value) {
                    profileData[key] = document.getElementById(key + "Input").value;
                }
            }
        }

        // Update Firestore and UI with the new profile data
        firebase
            .auth()
            .currentUser.updateEmail(profileData["email"])
            .then(() => {
                userDoc.set(profileData, { merge: true });
                for (let key in profileData) {
                    document.getElementById(key).innerHTML = profileData[key];
                }
                document.querySelectorAll(".edit").forEach((e) => {
                    e.style.display = "";
                });
                document.getElementById("subDiv").innerHTML = "";
            })
            .catch((err) => {
                alert(err);
            });
    });
}

/**
 * Adds drag-and-drop event listeners to noun containers for reordering interests and values.
 * Writes updated interest and value scores to Firestore.
 *
 * @param {Object} udata - The user data object containing interests and values.
 */
async function addDragListeners(udata) {
    let user = await getUser();
    let userDoc = await db.collection("users").doc(user.uid);
    document.querySelectorAll(".noun-container").forEach((container) => {
        container.addEventListener(
            "dragover",
            (event) => {
                event.preventDefault();
            },
            false
        );

        container.addEventListener("drop", (event) => {
            event.preventDefault();
            if (event.target.classList.contains("noun-container")) {
                event.target.appendChild(dragged);
                let newValue = parseInt(event.target.dataset.value);
                let noun = dragged.innerHTML;
                if (noun in udata.interests) {
                    addNoun(noun, newValue, true);
                } else if (noun in udata.values) {
                    addNoun(noun, newValue, false);
                } else {
                    console.log("something went wrong");
                }
            }
        });
    });
}

/**
 * Updates the Firestore database with a new score for a given interest or value.
 *
 * @param {string} noun - The interest or value being updated.
 * @param {number} newValue - The new score for the interest or value.
 * @param {boolean} isInterest - Whether the noun is an interest (true) or a value (false).
 */
async function addNoun(noun, newValue, isInterest) {
    let user = await getUser();
    let userDoc = await db.collection("users").doc(user.uid);

    if (isInterest) {
        try {
            userDoc.set(
                {
                    interests: {
                        [noun]: newValue,
                    },
                },
                { merge: true }
            );
        } catch (err) {
            console.log(err);
        }
    } else {
        try {
            userDoc.set(
                {
                    values: {
                        [noun]: newValue,
                    },
                },
                { merge: true }
            );
        } catch (err) {
            console.log(err);
        }
    }
}
