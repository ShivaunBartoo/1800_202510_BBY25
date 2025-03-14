// const fs = require('fs');

function randInt(max) {
  return Math.floor(Math.random() * max);
}

function writeGroups(max) {
  var groups = db.collection("groups");
  for(i = 1; i<= max; i++){
    groups.add({
      groupName: i
      
    })
  }
}

function fetcher() {
  fetch("./hobbies.json")
    .then(response => response.json())
    .then(jsonResponse => writePeople(12, jsonResponse))
    .catch(err => console.log("Ruh roh"));
}

function writeHobbies(json) {
  db.collection("testUsers").get()
  .then(doc => {

  });

}

function writePeople(max, json) {
  var people = db.collection("testUsers");
  for(i=1; i<=max;i++)
  {
    const hobbies = {};
    for(j=0; j<=randInt(5); j++) {
      hobbies[json[randInt(117)]] = randInt(5);
    }
    people.add({
      bio: "testBio" + i,
      contactInfo: i,
      contactMethod: "method" + i,
      profilePhoto: "http://127.0.0.1:5500/app/public/images/user.png",
      hasProfile: true,
      name: 'fName ' + 'lastName ' + i, 
    })
  }
}

function testing() {
  db.collection("groups").get()
  .then(doc => {
    doc.forEach(eachGroup => {
      var groupUsers = db.collection("groups/"+eachGroup.id+"/users");
      groupUsers.add({
        users: [],
      })
    })
    // aDoc = doc.doc();
  });
}

function reSeed() {
  fetcher();
  writeGroups(5);
}