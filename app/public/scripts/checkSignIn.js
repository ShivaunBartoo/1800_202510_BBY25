function accountPage() {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      console.log(user.uid);
      const x = getPerson(user.uid);
      console.log(x);
    }
    else {
      console.log("loser");
    }
  });
}


function getPerson(person) {
  console.log(person);
  db.collection("users").get()
  .then(users => {
    users.forEach(eachUser => {
      if (person == eachUser.id)
        {
          const UD = eachUser.data()
          document.getElementById("bigName").innerText = UD.name;
          document.getElementById("name").innerText = UD.name;
          document.getElementById("email").innerText = UD.email;
          document.getElementById("contact-info").innerText = UD.contactInfo;
          document.getElementById("contact-method").innerText = UD.contactMethod;
          return eachUser.data();
        }
      })
    })
}

accountPage();



