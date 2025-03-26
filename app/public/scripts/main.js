import { loadContent, loadHeader, loadMatchCard } from "../scripts/loadContent.js";
import { getNouns, getCompatibilityList } from "../scripts/groupManager.js";
import { db, getCurrentGroup, getUser, getUserData } from "../scripts/app.js";

let questions = [];
const questionProgressValue = 20;
let nextMatch = null;
let matchCardHTML = null;

initialize();

// This function initializes the page by loading HTML content into specified elements
// and setting up event listeners for survey responses.
async function initialize() {
    loadHeader(
        false, // show back button
        true, // show group
        true, // show profile image
        false //   show login/logout button
    );
    // loadContent(".match-card-container", "./components/match_card.html");

    let userData = await getUserData();
    let group = await getCurrentGroup();
    let nouns = await getNouns(group.id);

    let progressPercent = await getMatchProgress(userData);
    setProgressBar(progressPercent);

    generateQuestions(nouns, userData);

    await loadContent(".survey-card-container", "./components/survey_card.html");

    document.querySelectorAll(".survey-card-container").forEach((element) => {
        setCardQuestion(element, nextQuestion());
    });
    // Ensure event listeners are attached after content is loaded
    document.querySelectorAll(".survey-response").forEach((element) => {
        element.addEventListener("click", async () => {
            const surveyCardGallery = document.querySelector(".survey-card-gallery");
            const surveyCard = element.closest(".survey-card-container");

            // Check if the clicked element is the first child of the survey card gallery
            if (surveyCardGallery.firstElementChild === surveyCard) {
                let dataValue = element.getAttribute("data-value");
                let surveyTopic = surveyCard.querySelector(".survey-card-topic").textContent;

                let dataType = surveyCard.dataset.type; // Get the data type (e.g., "interest" or "value")

                // Update the Firestore map field
                db.collection("users")
                    .doc(userData.id)
                    .update({
                        [`${dataType}s.${surveyTopic}`]: parseInt(dataValue),
                    });

                incrementProgressBar(questionProgressValue);
                // Send the card to the bottom of the survey cards
                surveyCardGallery.appendChild(surveyCard);

                // Set opacity to zero
                surveyCard.style.opacity = "0";
                setCardQuestion(surveyCard, nextQuestion());
                // After a short delay, set opacity back to normal
                // CSS adds a transition effect
                setTimeout(() => {
                    surveyCard.style.opacity = "";
                }, 100);
            }
        });
    });

    const response = await fetch("./components/match_card.html");
    if (!response.ok) {
        throw new Error(`Failed to load match_card.html: ${response.statusText}`);
    }

    //update match card to most recent match
    matchCardHTML = await getMatchcardHTML();
    let currentMatches = userData.data().currentMatches;
    if (currentMatches && currentMatches.length >= 1) {
        let recentMatch = currentMatches[currentMatches.length - 1];
        updateMatchCard(recentMatch);
    }
    nextMatch = await getNextMatch();
}

//Populates a surveyCard DOM element with the content of a given question
function setCardQuestion(container, question) {
    if (question.type === "value") {
        container.setAttribute("data-type", "value");
        container.querySelector(".survey-card-question").innerHTML = "how much do you care about";
    } else if (question.type === "interest") {
        container.setAttribute("data-type", "interest");
    }
    container.querySelector(".survey-card-topic").innerHTML = question.word;
}

//populates the questions array with any nouns from the group that
//the user has not already responded to.
function generateQuestions(nouns, userData) {
    let interests = Object.keys(userData.data().interests);
    let values = Object.keys(userData.data().values);
    for (let noun of nouns) {
        let word = noun.word;
        if (!(interests.includes(word) || values.includes(word) || questions.includes(word))) {
            questions.push(noun);
        }
    }
}

//Randomly selects a question from the questions list, and removes it from the list.
function nextQuestion() {
    let index = Math.floor(Math.random() * questions.length);
    let question = questions[index];
    questions.splice(index, 1);
    return question;
}

//set the percentage value of the progress bar.
async function setProgressBar(percentage, userData = null) {
    if (!userData) {
        userData = await getUserData();
    }
    //bounds percentage from 0 to 100
    percentage = Math.min(Math.max(0, percentage), 100);
    let remainingCount = document.querySelector("#remaining-questions");
    remainingCount.innerHTML = Math.floor((100 - percentage) / questionProgressValue);
    let bar = document.querySelector(".match-progress-bar-fill");
    bar.style.width = percentage + "%";
    db.collection("users").doc(userData.id).set({ matchProgress: percentage }, { merge: true });
    if (percentage == 100) {
        revealMatch();
        setProgressBar(0, userData);
    }
}

async function revealMatch() {
    if (!nextMatch) {
        await getNextMatch();
    }
    let newCard = await updateMatchCard(nextMatch);
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

//deletes the previous match card and loads a new one
//param match: uid of user to populate match card with
async function updateMatchCard(match) {
    if (!matchCardHTML) {
        await getMatchcardHTML();
    }
    const matchCardContainer = document.querySelector(".match-card-container");
    if (matchCardContainer) {
        matchCardContainer.innerHTML = "";
        await loadMatchCard(".match-card-container", match, matchCardHTML);
        return document.querySelector(".match-card");
    } else {
        console.error("Error: .match-card-container not found!");
        return null;
    }
}

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
    compatabilityList.sort((a, b) => b.percent - a.percent);

    for (let match of compatabilityList) {
        // console.log("Considering user: " + match.user2);
        if (!currentMatches.includes(match.user2)) {
            return match.user2;
        }
    }

    console.warn("No suitable match found.");
    return null;
}

//increases the percentage of the progress bar.
async function incrementProgressBar(amount, userData = null) {
    let current = await getMatchProgress(userData);
    setProgressBar(current + amount);
}

//gets the current progress towards the next match.
async function getMatchProgress(userData = null) {
    if (!userData) {
        userData = await getUserData();
    }
    let progressPercent = userData.data().matchProgress;
    if (!progressPercent) {
        progressPercent = 0;
        await db.collection("users").doc(userData.id).set({ matchProgress: 0 }, { merge: true });
    }
    return progressPercent;
}

async function getMatchcardHTML() {
    const response = await fetch("./components/match_card.html");
    if (!response.ok) {
        throw new Error(`Failed to load match_card.html: ${response.statusText}`);
    }
    matchCardHTML = await response.text();
}
