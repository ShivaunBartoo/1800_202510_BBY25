/**
 * This script manages the functionality for the profile setup page (profileSetup.html).
 * It allows users to create or update their profile by filling out a multi-page form.
 * The form collects user information such as bio, contact details, interests, and values.
 *
 * Firestore is used to store the user's profile data, including their interests, values, and profile photo.
 * This script is used exclusively on the profileSetup.html page.
 */

import { auth, db } from "./app.js";
import { loadHeader } from "./loadContent.js";

let currentPage = 0; // Tracks the current page of the form.
let pages = []; // Stores all form pages.
let navButtons = []; // Stores navigation buttons for the form.

initialize();

/**
 * Initializes the profile setup page.
 * Loads the header, sets up navigation between form pages, handles input restrictions,
 * and sets up event listeners for form submission and profile photo upload.
 */
function initialize() {
    loadHeader(
        false, // Do not show the back button
        false, // Do not show the group button
        false, // Do not show the profile image
        false // Do not show the login/logout button
    );
    setupFormNavigation();
    setupInputRestrictions();
    setupProfilePhotoUpload();
    setupFormSubmission();
    addRequiredFieldIndicators();
    addInterests();
    // bubbleListeners();
}

/**
 * Sets up navigation between form pages and handles navigation button events.
 */
function setupFormNavigation() {
    pages = Array.from(document.querySelectorAll(".form-page")); // Get all form pages.
    navButtons = Array.from(document.querySelectorAll(".nav-button")); // Get all navigation buttons.

    // Set up the initial page and hide the others.
    pages.forEach((page, index) => {
        if (index !== currentPage) {
            page.style.opacity = "0"; // Hide the page.
            page.style.pointerEvents = "none"; // Disable interaction.
        } else {
            page.style.opacity = "1"; // Show the current page.
            page.style.pointerEvents = "auto"; // Enable interaction.
        }

        // Add event listeners to the navigation buttons.
        const nextButton = page.querySelector(".next-button");
        if (nextButton) {
            // Initially disable the next button
            nextButton.disabled = !areRequiredFieldsFilled(page);

            // Check required fields when inputs change
            const inputs = page.querySelectorAll("input, textarea");
            inputs.forEach((input) => {
                input.addEventListener("input", () => {
                    // Update next button state
                    nextButton.disabled = !areRequiredFieldsFilled(page);

                    // Update forward nav buttons state
                    updateNavButtonsState();
                });
            });

            nextButton.addEventListener("click", () => {
                if (!areRequiredFieldsFilled(page)) return;
                setPage(currentPage + 1); // Navigate to the next page.
            });
        }

        const prevButton = page.querySelector(".prev-button");
        if (prevButton) {
            prevButton.addEventListener("click", () => {
                setPage(currentPage - 1); // Navigate to the previous page.
            });
        }
    });

    // Set up event listeners for the navigation buttons.
    navButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            // Only allow navigation if all required fields on current and previous pages are filled
            if (canNavigateToPage(index)) {
                setPage(index); // Navigate to the specified page.
            }
        });
    });

    // Initial update of nav button states
    updateNavButtonsState();
}

/**
 * Checks if navigation to a specific page is allowed based on required fields.
 *
 * @param {number} targetPageIndex - The index of the page to navigate to.
 * @returns {boolean} - True if navigation is allowed, false otherwise.
 */
function canNavigateToPage(targetPageIndex) {
    // Always allow navigation to previous pages
    if (targetPageIndex <= currentPage) {
        return true;
    }

    // Check if all required fields on the current page and all previous pages are filled
    for (let i = 0; i <= currentPage; i++) {
        if (!areRequiredFieldsFilled(pages[i])) {
            return false;
        }
    }

    return true;
}

/**
 * Updates the state (enabled/disabled) of all navigation buttons.
 */
function updateNavButtonsState() {
    navButtons.forEach((button, index) => {
        // Apply classes or styles to indicate enabled/disabled state
        if (canNavigateToPage(index)) {
            button.classList.remove("disabled-nav");
            button.style.opacity = "1";
            button.style.cursor = "pointer";
        } else {
            button.classList.add("disabled-nav");
            button.style.opacity = "0.5";
            button.style.cursor = "not-allowed";
        }
    });
}

/**
 * Sets the current page of the form and updates the navigation buttons.
 *
 * @param {number} num - The page number to navigate to.
 */
function setPage(num) {
    if (num < 0 || num >= pages.length) {
        console.error("Invalid page number:", num);
        return;
    }

    // Check if we can navigate to this page
    if (num > currentPage && !canNavigateToPage(num)) {
        console.error("Cannot navigate to page", num, "due to unfilled required fields");
        return;
    }

    pages.forEach((page, index) => {
        if (index === num) {
            page.style.opacity = "1"; // Show the current page.
            page.style.pointerEvents = "auto"; // Enable interaction.
            navButtons[index].innerText = "radio_button_checked"; // Highlight the current button.
        } else {
            page.style.opacity = "0"; // Hide other pages.
            page.style.pointerEvents = "none"; // Disable interaction.
            navButtons[index].innerText = "radio_button_unchecked"; // Unhighlight other buttons.
        }
    });
    currentPage = num; // Update the current page index.

    // Update navigation button states after page change
    updateNavButtonsState();
}

/**
 * Checks if all required fields in a form page are filled.
 *
 * @param {Element} page - The form page to check.
 * @returns {boolean} - True if all required fields are filled, false otherwise.
 */
function areRequiredFieldsFilled(page) {
    const requiredFields = page.querySelectorAll("[required]");
    for (const field of requiredFields) {
        if (!field.value.trim()) {
            return false;
        }
    }
    return true;
}

/**
 * Restricts input fields to allow only letters and spaces.
 */
function setupInputRestrictions() {
    document.querySelectorAll(".noun-input").forEach((input) => {
        input.addEventListener("input", function () {
            this.value = this.value.replace(/[^a-zA-Z\s]/g, ""); // Allow only letters and spaces.
        });
    });
}

/**
 * Sets up the profile photo upload functionality and displays the selected photo.
 */
function setupProfilePhotoUpload() {
    document.getElementById("upload-button").addEventListener("click", function () {
        document.getElementById("profile-photo-input").click(); // Trigger the file input click event.
    });

    document.getElementById("profile-photo-input").addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            const fileSizeInBytes = file.size;
            if (fileSizeInBytes > 1024 * 1024) {
                alert("File is too large. Please select an image smaller than 1MB.");
                return;
            }
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = document.getElementById("profile-photo");
                img.src = e.target.result; // Display the selected image.
            };
            reader.readAsDataURL(file);
        }
    });
}

/**
 * Handles form submission, collects form data, and saves it to Firestore.
 */
function setupFormSubmission() {
    document.querySelector(".paged-form").addEventListener("submit", async function (event) {
        event.preventDefault();
        if (canNavigateToPage(currentPage + 1)) {
            const user = auth.currentUser;
            if (user) {
                const int1 = document.getElementById("interest1").value;
                const int2 = document.getElementById("interest2").value;
                const int3 = document.getElementById("interest3").value;
                const val1 = document.getElementById("value1").value;
                
                // Collect form data.
                const formData = {
                    bio: document.getElementById("bio").value || "",
                    contactMethod: document.getElementById("contact1").value || "",
                    contactInfo: document.getElementById("contact2").value || "",
                    profilePhoto: document.getElementById("profile-photo").src || "",
                    hasProfile: true,
                    interests: {
                        [int1.toLowerCase()]: 2,
                        [int2.toLowerCase()]: 2,
                        [int3.toLowerCase()]: 2,
                    },
                };

                //only add values key if the field is populated.
                if (val1.trim()) {
                    formData.values = {
                        [val1.toLowerCase()]: 2,
                    };
                }

                //Get generic interests and values from second form page.

                getAllClicked('interest').forEach((interest) => {
                    formData.interests[interest.toLowerCase()] = 2;
                });

                getAllClicked('value').forEach((value) => {
                    formData.values[value.toLowerCase()] = 2;
                })

                // Save form data to Firestore.
                try {
                    await db.collection("users").doc(user.uid).set(formData, { merge: true });
                    console.log("Form data saved successfully!");
                    window.location.href = "./main.html"; // Redirect to the main page.
                } catch (error) {
                    console.error("Error saving form data:", error);
                }
            } else {
                console.error("User is not logged in.");
            }
        }
    });
}

/**
 * Dynamically adds a red asterisk (*) beside the labels of required fields.
 */
function addRequiredFieldIndicators() {
    const requiredInputs = document.querySelectorAll("input[required], textarea[required]");

    requiredInputs.forEach((input) => {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (label) {
            const requiredIndicator = document.createElement("span");
            requiredIndicator.textContent = " *";
            requiredIndicator.style.color = "red";
            label.appendChild(requiredIndicator);
        }
    });
}

/**
 * Checks if all required fields in a form page are filled.
 *
 * @param {String} interest - The name of the txt file
 * @returns {Object} - Array of all lines of the txt file
 */
async function getInterestList(interest) { 
    return fetch(`../files/${interest}.txt`)
    .then((file) => file.text())
    .then((text) => {
        return text.split('\r\n');
    })
    .catch((err) => console.log(err));
}


/**
 * Adds the generic interests to the page from their respective txt files
 */
async function addInterests() {
    const games = await getInterestList("games");
    const hobbies = await getInterestList('hobbies');
    const music = await getInterestList('music');
    const politics = await getInterestList('politics');
    const socialval = await getInterestList('socialval');
    let gameList = document.querySelector(".game-container");
    for (let game in games) {
        gameList.innerHTML += `<span class="noun-bubble" data-value='unclicked' data-noun='interest'>${games[game]}</span>`;
    }
    for(let hobby in hobbies) {
        document.querySelector('.hobby-container').innerHTML += `<span class="noun-bubble" data-value='unclicked' data-noun='interest'>${hobbies[hobby]}</span>`;
    }
    for(let i in music) {
        document.querySelector('.music-container').innerHTML += `<span class="noun-bubble" data-value='unclicked' data-noun='interest'>${music[i]}</span>`;
    }
    for(let i in politics) {
        document.querySelector('.politics-container').innerHTML += `<span class="noun-bubble" data-value='unclicked' data-noun='value'>${politics[i]}</span>`;
    }
    for(let i in socialval) {
        document.querySelector('.social-container').innerHTML += `<span class="noun-bubble" data-value='unclicked' data-noun='value'>${socialval[i]}</span>`;
    }

    bubbleListeners()
}

/**
 * Adds event listeners to all of the bubbles after they've been added to the page.
 */
function bubbleListeners() {
    document.querySelectorAll('.noun-bubble').forEach((bubble) => {
        bubble.addEventListener('click', (event) => {
            let value = event.target.dataset.value;
            if (value == "unclicked") {
                event.target.setAttribute("data-value", "clicked");
            } else {
                event.target.setAttribute('data-value', 'unclicked');
            }
        });
    });
}

/**
 * Gets all of the clicked bubbles of the type.
 * @param {String} type - The type of noun to get(interest or value)
 * @returns {Object} - Array of all the clicked bubbles.
 */
function getAllClicked(type) {
    let b = []
    document.querySelectorAll('[data-value]').forEach((bubble) => {
        let val = bubble.dataset.value;
        let noun = bubble.dataset.noun;
        if (val == 'clicked' && noun == type) {
            b.push(bubble.innerHTML);
        }
    })
    return b
}
