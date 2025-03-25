import { auth, db } from "./app.js";
import { createGroup, addToGroup } from "./groupManager.js"
document.getElementById('createGroup').addEventListener("submit", async(event) => {
  event.preventDefault();
  const user = auth.currentUser;
  if (user) {
    const groupName = document.getElementById('groupName').value;
    console.log(user.uid)
    console.log(groupName)
    createGroup(groupName, user.uid)
  } else {
    console.log("User is not logged in");
  }

  location.href='./profile_setup.html';
});

document.getElementById('joinGroup').addEventListener("submit", async (event) => {
  event.preventDefault();
  const user = auth.currentUser;
  if (user) {

    const groupID = document.getElementById('groupCode').value;
    console.log(groupID)
    addToGroup(groupID, user.uid);
  } else {
    console.log("User is not logged in");
  }

  location.href='./profile_setup.html';
});