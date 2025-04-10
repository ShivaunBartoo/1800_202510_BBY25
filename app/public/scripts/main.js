/**
 * This script manages the functionality for the main page (main.html).
 * It handles the survey process, progress tracking, and match generation for users.
 *
 * Firestore is used to store and retrieve user data, including survey responses, progress, and matches.
 * This script is used exclusively on the main.html page.
 */

import { loadContent, loadHeader, loadMatchCard } from "../scripts/loadContent.js";
import { getNouns, getCompatibilityList } from "../scripts/groupManager.js";
import { db, getCurrentGroup, getUser, getUserData } from "../scripts/app.js";

let questions = []; // Stores survey questions.
const questionProgressValue = 20; // Progress increment for each answered question.
let nextMatch = null; // Stores the next match to be revealed.
let matchCardHTML = null; // Stores the HTML template for match cards.
initialize();

/**
 * Initializes the main page.
 * Loads the header, retrieves user and group data, generates survey questions, and sets up event listeners.
 *
 * @returns {Promise<void>}
 */
async function initialize() {
    populateSurveyCards();
    loadHeader(
        false, // Do not show the back button.
        false, // Do not show the group button.
        true, // Show the profile image.
        false, // Do not show the login/logout button.
        true // Show the group button.
    );
    let userData = await getUserData(); // Fetch the current user's data from Firestore.
    let group = await getCurrentGroup(); // Fetch the current group from Firestore.
    let nouns = await getNouns(group.id); // Fetch nouns (interests and values) from the group.

    let progressPercent = await getMatchProgress(userData); // Get the user's current progress.
    setProgressBar(progressPercent); // Update the progress bar.

    generateQuestions(nouns, userData); // Generate survey questions.

    // Set up survey cards with questions.
    //Animates opacity when switching from loader to actual topic for smooth transition
    let i = 1;
    document.querySelectorAll(".survey-card-container").forEach(async (element) => {
        let topic = element.querySelector(".survey-card-topic");
        topic.style.opacity = 0;
        setTimeout(async () => {
            topic.style.opacity = 100;
            setCardQuestion(element, await nextQuestion());
        }, i * 100);
        i++;
    });

    // Load the match card HTML template.
    const response = await fetch("./components/match_card.html");
    if (!response.ok) {
        throw new Error(`Failed to load match_card.html: ${response.statusText}`);
    }

    matchCardHTML = await getMatchcardHTML(); // Fetch the match card HTML.
    let currentMatches = userData.data().currentMatches;
    if (currentMatches && currentMatches.length >= 1) {
        let recentMatch = currentMatches[currentMatches.length - 1];
        updateMatchCard(recentMatch); // Update the match card with the most recent match.
    } else {
        document.querySelector("#recent-match-container .loader").style.display = "none";
        document.querySelector("#no-matches").style.display = "block";
    }
    nextMatch = await getNextMatch(); // Determine the next match.

    if (nextMatch) {
        document.querySelector(".match-progress-bar-label").style.opacity = "100";
        document.querySelector(".match-progress-bar").style.opacity = "100";
    } else {
        document.querySelector("#no-more-matches-message").style.display = "block";
        document.querySelector(".match-progress-bar-label").style.display = "none";
        document.querySelector(".match-progress-bar").style.display = "none";
    }

    // Attach event listeners to survey response buttons.
    setupSurveyCardEvents(userData);
}

/**
 * Dynamically creates survey cards using the survey card template.
 *
 * @param {Array<Object>} topics - An array of topics to populate the survey cards.
 * Each topic object should have a `word` property (the topic name) and a `type` property (e.g., "interest" or "value").
 */
function populateSurveyCards(topics) {
    const template = document.getElementById("survey-card-template"); // Get the survey card template.
    const containers = document.querySelectorAll(".survey-card"); // Get the container for survey cards.

    let delay = 0;
    containers.forEach((container) => {
        const clone = template.content.cloneNode(true); // Clone the template including its subtree
        container.appendChild(clone);
    });
    const content = document.querySelectorAll(".survey-card-content");
    for (let i = 0; i < content.length; i++) {
        const card = content[i];
        setTimeout(() => (card.style.opacity = 100), (i + 1) * 10);
    }
}

/**
 * Sets up event listeners for survey response elements within survey cards.
 * When a survey response is clicked, it updates the user's response in Firestore,
 * increments the progress bar, and moves the survey card to the bottom of the gallery
 * with a fade-out and fade-in animation.
 *
 * @function setupSurveyCardEvents
 * @param {Object} userData - The user data object containing user-specific information.
 * @param {string} userData.id - The unique identifier for the user in Firestore.
 */
function setupSurveyCardEvents(userData) {
    document.querySelectorAll(".survey-response").forEach((element) => {
        element.addEventListener("click", async () => {
            const surveyCardGallery = document.querySelector(".survey-card-gallery");
            const surveyCard = element.closest(".survey-card-container");

            // Ensure the clicked card is the first in the gallery.
            if (surveyCardGallery.firstElementChild === surveyCard) {
                let dataValue = element.getAttribute("data-value");
                let surveyTopic = surveyCard.querySelector(".survey-card-topic").textContent;
                let dataType = surveyCard.dataset.type; // Get the data type (e.g., "interest" or "value").

                // Update the Firestore map field with the user's response.
                await db
                    .collection("users")
                    .doc(userData.id)
                    .update({
                        [`${dataType}s.${surveyTopic}`]: parseInt(dataValue),
                    });

                incrementProgressBar(questionProgressValue); // Increment the progress bar.
                surveyCardGallery.appendChild(surveyCard); // Move the card to the bottom of the gallery.

                // Add a fade-out and fade-in animation for the card.
                surveyCard.style.opacity = "0";
                setCardQuestion(surveyCard, await nextQuestion());
                setTimeout(() => {
                    surveyCard.style.opacity = "";
                }, 100);
            }
        });
    });
}

/**
 * Populates a survey card with the content of a given question.
 *
 * @param {HTMLElement} container - The survey card container element.
 * @param {Object} question - The question object containing the word and type.
 */
function setCardQuestion(container, question) {
    if (question.type === "value") {
        container.setAttribute("data-type", "value");
        container.querySelector(".survey-card-question").innerHTML = "how much do you care about";
    } else if (question.type === "interest") {
        container.setAttribute("data-type", "interest");
    }
    container.querySelector(".survey-card-topic").innerHTML = question.word;
}

/**
 * Generates survey questions from group nouns that the user has not already responded to.
 *
 * @param {Array<Object>} nouns - The list of nouns (interests and values) from the group.
 * @param {Object} userData - The current user's data.
 */
function generateQuestions(nouns, userData) {
    // Use empty objects as fallbacks if interests or values are undefined or null
    let interests = Object.keys(userData.data().interests || {});
    let values = Object.keys(userData.data().values || {});

    for (let noun of nouns) {
        let word = noun.word;
        if (!(interests?.includes(word) || values?.includes(word) || questions.includes(word))) {
            questions.push(noun);
        }
    }
}

/**
 * Randomly selects a question from the questions list and removes it from the list.
 *
 * @returns {Promise<Object>} The selected question object.
 */
async function nextQuestion() {
    if (questions.length == 0) {
        await getDefaultQuestions(); // Load default questions if the list is empty.
    }
    let index = Math.floor(Math.random() * questions.length);
    let question = questions[index];
    questions.splice(index, 1);
    return question;
}

/**
 * Loads default questions from a JSON file and populates the questions array.
 *
 * @returns {Promise<void>}
 */
async function getDefaultQuestions() {
    let hobbies = await fetch("../files/hobbies.json").then((result) => result.json());
    Object.values(hobbies).forEach((hobby) => {
        questions.push({ word: hobby, type: "interest" });
    });
}

/**
 * Sets the percentage value of the progress bar.
 * Updates the user's progress in Firestore.
 *
 * @param {number} percentage - The progress percentage to set.
 * @param {Object|null} userData - The current user's data (optional).
 * @returns {Promise<void>}
 */
async function setProgressBar(percentage, userData = null) {
    if (!userData) {
        userData = await getUserData();
    }
    percentage = Math.min(Math.max(0, percentage), 100); // Ensure percentage is between 0 and 100.
    let remainingCount = document.querySelector("#remaining-questions");
    remainingCount.innerHTML = Math.floor((100 - percentage) / questionProgressValue);
    let bar = document.querySelector(".match-progress-bar-fill");
    bar.style.width = percentage + "%";
    db.collection("users").doc(userData.id).set({ matchProgress: percentage }, { merge: true }); // Update Firestore.
    if (percentage == 100 && nextMatch) {
        console.log("new match");
        revealMatch(); // Reveal the next match when progress reaches 100%.
        setProgressBar(0, userData); // Reset the progress bar.
    }
}

/**
 * Reveals the next match by updating the match card and animating it.
 * Updates the user's current matches in Firestore.
 *
 * @returns {Promise<void>}
 */
async function revealMatch() {
    if (!nextMatch) {
        await getNextMatch();
    }
    console.log("match assigned");
    let newCard = await updateMatchCard(nextMatch);
    console.log("card updated");
    if (newCard) {
        animateMatchCard(newCard);
    }
    let currentUser = await getUser();
    db.collection("users")
        .doc(currentUser.uid)
        .update({
            currentMatches: firebase.firestore.FieldValue.arrayUnion(nextMatch),
        });
    nextMatch = await getNextMatch();
}

/**
 * Updates the match card with the given match.
 *
 * @param {string} match - The UID of the user to populate the match card with.
 * @returns {Promise<HTMLElement|null>} The updated match card element, or null if not found.
 */
async function updateMatchCard(match) {
    if (!matchCardHTML) {
        await getMatchcardHTML();
    }
    const matchCardContainer = document.querySelector(".match-card-container");
    if (matchCardContainer) {
        let content = document.querySelector(".match-card-content");
        content.style.opacity = 0;
        let card = await loadMatchCard(".match-card-container", match, matchCardHTML);
        console.log("match card loaded");
        Array.from(document.querySelector(".match-card-container").children).forEach((child) => {
            if (child != card) {
                child.remove();
            }
        });

        content = document.querySelector(".match-card-content");
        content.style.opacity = 0;
        setTimeout(() => {
            content.style.opacity = 100;
        }, 200);
        return document.querySelector(".match-card");
    } else {
        console.error("Error: .match-card-container not found!");
        return null;
    }
}

/**
 * Animates the match card with a fade-in and scale effect.
 *
 * @param {HTMLElement} card - The match card element to animate.
 */
function animateMatchCard(card) {
    card.style.opacity = "0";
    card.style.transform = "scale(0.1)";
    setTimeout(() => {
        card.style.transform = "scale(1.1)";
    }, 10);
    setTimeout(() => {
        card.style.opacity = "";
    }, 50);
    setTimeout(() => {
        card.style.transform = "scale(1)";
    }, 200);
}

/**
 * Retrieves the next match for the user based on compatibility.
 *
 * @returns {Promise<string|null>} The UID of the next match, or null if no match is found.
 */
async function getNextMatch() {
    let userData = await getUserData();
    if (!userData || !userData.exists) {
        console.error("Error: User document does not exist.");
        return null;
    }

    let currentMatches = userData.data().currentMatches || [];
    let activeGroup = await getCurrentGroup();
    activeGroup = activeGroup.id;
    if (!activeGroup) {
        console.error("Error: activeGroup is missing in user data.");
        return null;
    }

    let compatabilityList = await getCompatibilityList(userData.id, activeGroup);
    compatabilityList.sort((a, b) => b.percent - a.percent); // Sort matches by compatibility percentage.

    for (let match of compatabilityList) {
        if (!currentMatches.includes(match.user2)) {
            return match.user2; // Return the first unmatched user.
        }
    }
    return null;
}

/**
 * Increments the progress bar by a specified amount.
 *
 * @param {number} amount - The amount to increment the progress bar by.
 * @param {Object|null} userData - The current user's data (optional).
 * @returns {Promise<void>}
 */
async function incrementProgressBar(amount, userData = null) {
    let current = await getMatchProgress(userData);
    setProgressBar(current + amount);
}

/**
 * Retrieves the user's current progress towards the next match.
 *
 * @param {Object|null} userData - The current user's data (optional).
 * @returns {Promise<number>} The user's current progress percentage.
 */
async function getMatchProgress(userData = null) {
    if (!userData) {
        userData = await getUserData();
    }
    let progressPercent = userData.data().matchProgress;
    if (!progressPercent) {
        progressPercent = 0;
        await db.collection("users").doc(userData.id).set({ matchProgress: 0 }, { merge: true }); // Initialize progress in Firestore.
    }
    return progressPercent;
}

/**
 * Fetches the HTML template for match cards.
 *
 * @returns {Promise<string>} The HTML template for match cards.
 */
async function getMatchcardHTML() {
    const response = await fetch("./components/match_card.html");
    if (!response.ok) {
        throw new Error(`Failed to load match_card.html: ${response.statusText}`);
    }
    matchCardHTML = await response.text();
}
