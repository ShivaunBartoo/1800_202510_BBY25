import { loadContent } from "../scripts/loadContent.js";

initialize();

// This function initializes the page by loading HTML content into specified elements
// and setting up event listeners for survey responses.
async function initialize() {
    await loadContent(".header-authenticated", "./components/header_authenticated.html");
    await loadContent(".match-card-container", "./components/match_card.html");
    await loadContent(".survey-card-container", "./components/survey_card.html");

    // Ensure event listeners are attached after content is loaded
    document.querySelectorAll(".survey-response").forEach((element) => {
        element.addEventListener("click", () => {
            const surveyCardGallery = document.querySelector(".survey-card-gallery");
            const surveyCard = element.closest(".survey-card-container");

            // Check if the clicked element is the first child of the survey card gallery
            if (surveyCardGallery.firstElementChild === surveyCard) {
                let dataValue = element.getAttribute("data-value");
                let surveyTopicElement = surveyCard.querySelector(".survey-card-topic");
                surveyTopicElement.textContent = "Food"; // Example topic, replace with actual logic
                console.log("Survey topic:" + surveyTopicElement.textContent);
                console.log("Survey response clicked:" + dataValue);
                surveyCardGallery.appendChild(surveyCard);

                // Set opacity to zero
                surveyCard.style.opacity = "0";

                // After a short delay, set opacity back to normal 
                // CSS adds a transition effect 
                setTimeout(() => {
                    surveyCard.style.opacity = "";
                }, 100);
            }
        });
    });
}
