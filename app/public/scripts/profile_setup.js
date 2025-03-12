let currentPage = 0;
let pages = [];
let navButtons = [];

initialize();

function initialize() {
    pages = Array.from(document.querySelectorAll(".form-page"));
    navButtons = Array.from(document.querySelectorAll(".nav-button"));

    pages.forEach((page, index) => {
        if (index !== currentPage) {
            page.style.opacity = "0";
            page.style.pointerEvents = "none";
        } else {
            page.style.opacity = "1";
            page.style.pointerEvents = "auto";
        }
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

    navButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            setPage(index);
        });
    });

    document.querySelectorAll(".noun-input").forEach((input) => {
        input.addEventListener("input", function (event) {
            this.value = this.value.replace(/[^a-zA-Z\s]/g, ""); // Allow only letters and spaces
        });
    });

    // Profile photo upload
    document.getElementById("upload-button").addEventListener("click", function () {
        document.getElementById("profile-photo-input").click();
    });

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

    // Form submission
    document.querySelector(".paged-form").addEventListener("submit", async function (event) {
        event.preventDefault();
        const user = auth.currentUser;
        if (user) {
            const formData = {
                bio: document.getElementById("bio").value,
                interest1: document.getElementById("interest1").value,
                interest2: document.getElementById("interest2").value,
                interest3: document.getElementById("interest3").value,
                value1: document.getElementById("value1").value,
                contactMethod: document.getElementById("contact1").value,
                contactInfo: document.getElementById("contact2").value,
                profilePhoto: document.getElementById("profile-photo").src,
            };
            try {
                await db.collection("users").doc(user.uid).set(formData, { merge: true });
                console.log("Form data saved successfully!");
                // Redirect or show success message
            } catch (error) {
                console.error("Error saving form data:", error);
            }
        } else {
            console.error("User is not logged in.");
        }
    });
}

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
