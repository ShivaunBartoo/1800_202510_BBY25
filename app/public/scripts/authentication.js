import "https://www.gstatic.com/firebasejs/ui/4.8.1/firebase-ui-auth.js";

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());

var uiConfig = {
    callbacks: {
        signInSuccessWithAuthResult: function (authResult, redirectUrl) {
            // User successfully signed in.
            // Return type determines whether we continue the redirect automatically
            // or whether we leave that to developer to handle.
            var user = authResult.user; // get the user object from the Firebase authentication database
            if (authResult.additionalUserInfo.isNewUser) {
                //if new user
                db.collection("users")
                    .doc(user.uid)
                    .set({
                        //write to firestore. We are using the UID for the ID in users collection
                        name: user.displayName, //"users" collection
                        email: user.email, //with authenticated user's ID (user.uid)
                        hasProfile: false,
                    })
                    .then(function () {
                        console.log("New user added to firestore");
                        window.location.href("./profile_setup.html");
                    })
                    .catch(function (error) {
                        console.log("Error adding new user: " + error);
                    });
            } else {
                return true;
            }
            return false;
        },
        uiShown: function () {
            // The widget is rendered.
            // Hide the loader.
            document.getElementById("loader").style.display = "none";
        },
        uiShown: function () {
            // The widget is rendered.
            // Hide the loader.
            document.getElementById("loader").style.display = "none";
            // Insert the custom message after the UI is shown
            insertCustomMessage();
        },
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: "popup",
    signInSuccessUrl: "main.html",
    signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        // firebase.auth.GithubAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        // firebase.auth.PhoneAuthProvider.PROVIDER_ID
    ],
    // Terms of service url.
    tosUrl: "<your-tos-url>",
    // Privacy policy url.
    privacyPolicyUrl: "<your-privacy-policy-url>",
};

ui.start("#firebaseui-auth-container", uiConfig);

// Function to insert a custom message based on which button was clicked from index.html
function insertCustomMessage() {
    const mode = new URLSearchParams(window.location.search).get("mode");
    let uiTitle = document.querySelector(".firebaseui-title");
    if (mode === "signup") {
        uiTitle.innerText = "Sign up with email";
    } else {
        uiTitle.innerText = "Sign in with email";
    }
}
