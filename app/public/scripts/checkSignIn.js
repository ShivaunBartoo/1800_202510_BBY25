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
          console.log(eachUser.data());
          return eachUser.data();
        }
      })
    })
}

accountPage();



