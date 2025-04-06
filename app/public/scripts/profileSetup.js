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
 * Loads the header, sets up navigation between form pages, and handles form submission.
 */
function initialize() {
    // Load the header without a back button or group button.
    loadHeader(false, false, false, false);

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
            nextButton.addEventListener("click", () => {
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
            setPage(index); // Navigate to the specified page.
        });
    });

    // Add event listeners to restrict input to letters and spaces only.
    document.querySelectorAll(".noun-input").forEach((input) => {
        input.addEventListener("input", function () {
            this.value = this.value.replace(/[^a-zA-Z\s]/g, ""); // Allow only letters and spaces.
        });
    });

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
            reader.onload = function (e) {
                const img = document.getElementById("profile-photo");
                img.src = e.target.result; // Display the selected image.
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle form submission and save data to Firestore.
    document.querySelector(".paged-form").addEventListener("submit", async function (event) {
        event.preventDefault();
        const user = auth.currentUser;
        if (user) {
            const int1 = document.getElementById("interest1").value;
            const int2 = document.getElementById("interest2").value;
            const int3 = document.getElementById("interest3").value;
            const val1 = document.getElementById("value1").value;

            // Collect form data.
            const formData = {
                bio: document.getElementById("bio").value,
                contactMethod: document.getElementById("contact1").value,
                contactInfo: document.getElementById("contact2").value,
                profilePhoto: document.getElementById("profile-photo").src,
                hasProfile: true,
                interests: {
                    [int1.toLowerCase()]: 2,
                    [int2.toLowerCase()]: 2,
                    [int3.toLowerCase()]: 2,
                },
                values: {
                    [val1.toLowerCase()]: 2,
                },
            };

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
}
