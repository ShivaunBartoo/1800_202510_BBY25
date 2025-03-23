import { db } from "../app/public/scripts/app.js";

// IMPORTANT: DO NOT USE THIS CODE IN PRODUCTION.
// This code is for testing purposes only.

// these functions handles the creation and deletion of test users.
// and mass-manipulation of groups.

// allows these functions to be called from the Chrome console.
window.addTestUsers = addTestUsers;
window.deleteTestUsers = deleteTestUsers;
window.addAllToGroup = addAllToGroup;
window.regenerateTestUsers = regenerateTestUsers;
console.log("dev functions loaded");

async function regenerateTestUsers() {
    await deleteTestUsers();
    await addTestUsers();
    await addAllToGroup("OVWSdIxoOVFbOTcOjRRN");
}

// adds all users in the 'users' collection to the group with the specified groupID.
//paste in chrome console to add all users to default group:
//  addAllToGroup("OVWSdIxoOVFbOTcOjRRN");
async function addAllToGroup(groupID) {
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
    console.log("users added to group successfully.");
}

// populates the 'users' collection with test users from testUsers.json.
async function addTestUsers() {
    let index = 1;
    try {
        const response = await fetch("../app/files/testUsers.json");
        if (!response.ok) {
            throw new Error("Cannot read testUsers.json");
        }
        const testUsers = await response.json();
        for (const user of testUsers) {
            console.log("generating user: " + user.name);
            const profilePhoto = await getProfileImage(index++);
            const testUser = db.collection("users").doc();
            await testUser.set({
                name: user.name,
                bio: user.bio,
                email: user.email,
                hasProfile: user.hasProfile,
                contactMethod: user.contactMethod,
                contactInfo: user.contactInfo,
                interests: user.interests,
                profilePhoto: profilePhoto,
                values: user.values,
                testUser: true,
            });
        }
        console.log("Test users added successfully.");
    } catch (error) {
        console.error("Error adding test users:", error);
    }
}

//gets an image from a dataset of ai-generated faces from https://thispersondoesnotexist.com/
let imageData = null;
async function getProfileImage(num) {
    if (!imageData) {
        try {
            const response = await fetch("imagesBase64.json");
            if (!response.ok) {
                throw new Error("Failed to fetch image.");
            }
            imageData = await response.json();
        } catch (error) {
            console.error(`Error loading image data: ${error}`);
        }
    }
    console.log(`getting image: image${num}`);
    return imageData[`image${num}`] || null;
}

// deletes all test users from the 'users' collection.
// (test users have the testUser: true field in their db)
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
    console.log("test users deleted successfully.");
}
