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

function writePeople(max, json) {
  var people = db.collection("users");
  for(i=1; i<=max;i++)
  {
    const hobbies = [];
    for(j=0; j<=randInt(5); j++) {
      hobbies.push(json[randInt(117)]);
    }
    people.add({
      firstName: "fName " + i,
      lastName: "lName " + i,
      hobbies: hobbies,
    })
  }
}

function testing() {
  db.collection("groups").get()
  .then(doc => {
    doc.forEach(eachGroup => {
      var groupUsers = db.collection("groups/"+eachGroup.id+"/users");
      // groupUsers.add({
      //   users: [],
      // })
    })
    // aDoc = doc.doc();
  });
}

function reSeed() {
  fetcher();
  writeGroups(5);
}