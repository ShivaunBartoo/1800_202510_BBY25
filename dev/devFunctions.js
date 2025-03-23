import { db } from "../app/public/scripts/app.js";

// IMPORTANT: DO NOT USE THIS CODE IN PRODUCTION.
// This code is for testing purposes only.

// these functions handles the creation and deletion of test users.
// and mass-manipulation of groups.

// allows these functions to be called from the Chrome console.
window.addTestUsers = addTestUsers;
window.deleteTestUsers = deleteTestUsers;
window.addAllToGroup = addAllToGroup;
console.log("dev functions loaded");
console.log("OVWSdIxoOVFbOTcOjRRN");
// adds all users in the 'users' collection to the group with the specified groupID.
function addAllToGroup(groupID) {
    let group = db.collection("groups").doc(groupID);
    db.collection("users")
        .get()
        .then((users) => {
            users.forEach((user) => {
                group.update({
                    users: firebase.firestore.FieldValue.arrayUnion(user.id),
                });
            });
        });
}
//paste in chrome console to add all users to default group:
//  addAllToGroup("OVWSdIxoOVFbOTcOjRRN");

// populates the 'users' collection with test users from testUsers.json.
function addTestUsers() {
    fetch("../app/files/testUsers.json")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Cannot find testUsers.json");
            }
            return response.json();
        })
        .then((testUsers) => {
            testUsers.forEach((user) => {
                const testUser = db.collection("users").doc();
                testUser.set({
                    name: user.name,
                    bio: user.bio,
                    email: user.email,
                    hasProfile: user.hasProfile,
                    contactMethod: user.contactMethod,
                    contactInfo: user.contactInfo,
                    email: user.email,
                    interests: user.interests,
                    profilePhoto: user.profilePhoto,
                    values: user.values,
                    testUser: true,
                });
            });
        });
}

// deletes all test users from the 'users' collection.
async function deleteTestUsers() {
    let groups = await db.collection("groups").get();
    db.collection("users")
        .where("testUser", "==", true)
        .get()
        .then((users) => {
            users.forEach((user) => {
                user.ref.delete();
                groups.forEach((group) => {
                    group.ref.update({
                        users: firebase.firestore.FieldValue.arrayRemove(user.id),
                    });
                });
            });
        });
}
