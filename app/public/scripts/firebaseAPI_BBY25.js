//----------------------------------------
//  Your web app's Firebase configuration
//----------------------------------------
var firebaseConfig = {
    apiKey: "AIzaSyARBCTTJO4ke548pHGNCzCudFqmEm7suHw",

    authDomain: "bby25-likemind.firebaseapp.com",

    projectId: "bby25-likemind",

    storageBucket: "bby25-likemind.firebasestorage.app",

    messagingSenderId: "286236329435",

    appId: "1:286236329435:web:a44658366321632dcf13fe",
};

//--------------------------------------------
// initialize the Firebase app
// initialize Firestore database if using it
//--------------------------------------------
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
