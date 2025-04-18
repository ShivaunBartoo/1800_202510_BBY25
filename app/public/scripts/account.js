/**
 * This script manages the account.html functionality.
 * It initializes the account page by loading user data from Firestore,
 * dynamically populates the UI with user information, and provides drag-and-drop
 * and edit functionality for user interests and values.
 */

import { db, getUserData, setBackButtonDestination, getUser, setupShareLinkFunctionality, auth } from "../scripts/app.js";
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
    setupShareLinkFunctionality();
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
        setupEditProfileImage(user.id);
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
 * Sets up the profile image upload and preview functionality.
 * Adds event listeners to the upload button to trigger file selection
 * and to the file input to display the selected image as a preview.
 * Also updates the user's profile photo in Firestore.
 *
 * @param {Object} udata - The user data object containing profile information.
 */
function setupEditProfileImage(uid) {
    // Set up the profile photo upload functionality.
    document.getElementById("upload-button").addEventListener("click", function () {
        document.getElementById("profile-photo-input").click(); // Trigger the file input click event.
    });

    // Display the selected profile photo.
    document.getElementById("profile-photo-input").addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            const fileSizeInBytes = file.size;
            if (fileSizeInBytes > 1024 * 1024) {
                alert("File is too large. Please select an image smaller than 1MB.");
                return;
            }

            const reader = new FileReader();
            reader.onload = async function (e) {
                const img = document.getElementById("profile-picture-large");
                img.src = e.target.result; // Display the selected image.
                console.log("uid " + uid);
                console.log("setting firebase image");
                await db.collection("users").doc(uid).set({ profilePhoto: e.target.result }, { merge: true });
            };
            reader.readAsDataURL(file);
        }
    });
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
        appendBubbleToContainer(score, interest);
    }

    for (let value in udata.values) {
        let score = udata.values[value];
        appendBubbleToContainer(score, value);
    }
}

function appendBubbleToContainer(score, text) {
    const containerMap = {
        2: "#very-interested",
        1: "#mildly-interested",
        0: "#no-opinion",
        "-1": "#mildly-disinterested",
        "-2": "#very-disinterested",
    };

    const containerSelector = containerMap[score];
    if (containerSelector) {
        document.querySelector(containerSelector).innerHTML += `<span class="noun-bubble" draggable="true">${text}</span>`;
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
            document.getElementById(target).innerHTML = `<input type='text' id='${target}Input' value="${originalValue}" />`;
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
    try {
        let user = await getUser();
        let userDoc = await db.collection("users").doc(user.uid);

        const updateData = isInterest ? { interests: { [noun]: newValue } } : { values: { [noun]: newValue } };

        await userDoc.set(updateData, { merge: true });
    } catch (err) {
        console.error("Error updating Firestore:", err);
    }
}
