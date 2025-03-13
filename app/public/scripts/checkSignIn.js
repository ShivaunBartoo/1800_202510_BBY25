function accountPage() {
  firebase.auth().onAuthStateChanged(user => {
    if(user) {
      document.getElementById("name").innerText = user.name;
      document.getElementById("email").innerText = user.email;
    }

    else {
      console.log("No one is signed in");
    }
  });
}

