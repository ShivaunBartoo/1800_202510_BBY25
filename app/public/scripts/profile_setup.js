import { auth, db } from "../scripts/app.js";

let currentPage = 0;
let pages = [];
let navButtons = [];

initialize();

// This function initializes the page by loading HTML content into specified elements
// and setting up event listeners for navigation buttons and form submission.
function initialize() {
    pages = Array.from(document.querySelectorAll(".form-page"));
    navButtons = Array.from(document.querySelectorAll(".nav-button"));

    // Set up the initial page and hide the others.
    pages.forEach((page, index) => {
        if (index !== currentPage) {
            page.style.opacity = "0";
            page.style.pointerEvents = "none";
        } else {
            page.style.opacity = "1";
            page.style.pointerEvents = "auto";
        }
        // Add event listeners to the navigation buttons
        const nextButton = page.querySelector(".next-button");
        if (nextButton) {
            nextButton.addEventListener("click", () => {
                setPage(currentPage + 1);
            });
        }
        const prevButton = page.querySelector(".prev-button");
        if (prevButton) {
            prevButton.addEventListener("click", () => {
                setPage(currentPage - 1);
            });
        }
    });

    // Set up event listeners for the navigation buttons
    navButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            setPage(index);
        });
    });

    // Add event listeners to the text inputs to restrict input to letters and spaces only
    document.querySelectorAll(".noun-input").forEach((input) => {
        input.addEventListener("input", function (event) {
            // Copilot used to generate this regex
            this.value = this.value.replace(/[^a-zA-Z\s]/g, ""); // Allow only letters and spaces
        });
    });

    // This is a bit of a hack. The way that the input type="file" is styled wasn't working with
    // the layout, so I added a button that triggers the click event of the input type="file"
    // when clicked. This way, the user can select a file without seeing the ugly input type="file" element.
    document.getElementById("upload-button").addEventListener("click", function () {
        document.getElementById("profile-photo-input").click();
    });

    // Profile photo upload
    // Currently this is not fully functional as it does not upload the image to Firebase Storage.
    // Patrick suggested using Cloudinary to host the images and to save the ID of the image in Firestore.
    document.getElementById("profile-photo-input").addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = document.getElementById("profile-photo");
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Add event listener to the form that saves the form data to Firestore when a submit button is clicked
    document.querySelector(".paged-form").addEventListener("submit", async function (event) {
        event.preventDefault();
        const user = auth.currentUser;
        if (user) {
            const int1 = document.getElementById("interest1").value;
            const int2 = document.getElementById("interest2").value;
            const int3 = document.getElementById("interest3").value;
            const val1 = document.getElementById("value1").value;
            const interests = {};
            const values = {};
            interests[int1] = 5;
            interests[int2] = 5;
            interests[int3] = 5;
            values[val1] = 5;
            // Get form data
            const formData = {
                bio: document.getElementById("bio").value,
                contactMethod: document.getElementById("contact1").value,
                contactInfo: document.getElementById("contact2").value,
                profilePhoto: document.getElementById("profile-photo").src,
                hasProfile: true,
                interests: {
                    [int1.toLowerCase()]: 5,
                    [int2.toLowerCase()]: 5,
                    [int3.toLowerCase()]: 5,
                },
                values: {
                    [val1.toLowerCase()]: 5,
                },
            };
            // Save form data to Firestore
            try {
                await db.collection("users").doc(user.uid).set(formData, { merge: true });
                console.log("Form data saved successfully!");
                window.location.href = "./main.html";
            } catch (error) {
                console.error("Error saving form data:", error);
            }
        } else {
            console.error("User is not logged in.");
        }
    });
}

// This function sets the current page to the specified number and updates the navigation buttons accordingly.
// It also handles the visibility and interactivity of the pages based on the current page number.
function setPage(num) {
    if (num < 0 || num >= pages.length) {
        console.error("Invalid page number:", num);
        return;
    }
    pages.forEach((page, index) => {
        if (index === num) {
            page.style.opacity = "1";
            page.style.pointerEvents = "auto";
            navButtons[index].innerText = "radio_button_checked";
        } else {
            page.style.opacity = "0";
            page.style.pointerEvents = "none";
            navButtons[index].innerText = "radio_button_unchecked";
        }
    });
    currentPage = num;
}
