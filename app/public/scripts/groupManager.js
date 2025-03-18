import { db } from "./app.js";

function randInt(max) {
  return Math.floor(Math.random() * max);
}

//Using a group ID and userID, adds the userID to the groups user array.
export function addToGroup(groupID, userID, test) {
  //test is a boolean, this can be removed when we no longer need test users. 
  if (test) {
    const collection = 'testUsers';
  }
  else{
    const collection = 'users';
  }
  const group = db.collection("groups").doc(groupID);
  const user = db.collection(collection).doc(userID);

  //firestores way of appending data to array values. 
  group.update({
    users: firebase.firestore.FieldValue.arrayUnion(userID)
  });
}

// returns a promise of group users in the specified group. 
export function viewGroupPromise(groupID) {
  return new Promise((res, rej) => {
    const group = db.collection('groups').doc(groupID);
    group.get().then((doc) => {
      if(doc.exists) {
        res(doc.data().users);
      }
      else{
        rej("Document does not exist, or something broke.")
      }
    });
  })
}

//Using groupID and userID, adds the groupID to the users group array. 
function addToPerson() {

}

//All functions after this point are for my testing, you shouldn't need them, but feel free to look anyways
function testAddToGroup() {
  db.collection("groups").get()
  .then(doc => {
    doc.forEach(eachGroup => {
      let id= eachGroup.id;
      addToGroup(id, 'test4', true);
    })
  });
}

async function testViewGroupUsers() {
  const result = await viewGroupPromise("OVWSdIxoOVFbOTcOjRRN");
  console.log(await result);
}

// testViewGroupUsers();