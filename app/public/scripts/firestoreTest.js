import {db } from "./app.js";
// import("./app.js");


function randInt(max) {
  return Math.floor(Math.random() * max);
}

export function writeGroups(max) {
  var groups = db.collection("groups");
  for(let i = 1; i<= max; i++){
    groups.add({
      groupName: i,
      users: [],
    })
  }
}

function fetcher() {
  fetch("../files/hobbies.json")
    .then(response => response.json())
    .then(jsonResponse => writeHobbies(jsonResponse))
    .catch(err => console.log(err));
}

function writeHobbies(json) {
  db.collection("testUsers").get()
  .then(doc => {
    doc.forEach(eachUser => {
      const hobbies = {};
      for(let j=0; j<=randInt(5); j++) {
        hobbies[json[randInt(117)]] = randInt(5);
      }
      var userInterests = db.collection('testUsers').doc(eachUser.id).set({
        hobbies,
        values: {}
        }, {merge:true})
    });
  });

}

function writePeople(max) {
  var people = db.collection("testUsers");
  for(let i=1; i<=max;i++)
  {
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

function reSeed() {
  // console.log("this is working");
  // writePeople(20);
  writeGroups(5);
}

// reSeed();