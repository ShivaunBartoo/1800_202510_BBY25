/**
 * This script contains development-only functions for testing and debugging purposes.
 * It includes functionality for creating and deleting test users, adding users to groups,
 * and manipulating user data in bulk. These functions are not intended for production use.
 */

import { db, auth } from "../app/public/scripts/app.js";

// IMPORTANT: DO NOT USE THIS CODE IN PRODUCTION.
// This code is for testing purposes only.

// Allows these functions to be called from the Chrome console.
window.addTestUsers = addTestUsers;
window.deleteTestUsers = deleteTestUsers;
window.addAllToGroup = addAllToGroup;
window.regenerateTestUsers = regenerateTestUsers;
window.clearUserInterestsAndValues = clearUserInterestsAndValues;

console.log("dev functions loaded");
console.log("OVWSdIxoOVFbOTcOjRRN");

/**
 * Deletes all test users and regenerates them by adding them to the specified group.
 *
 * @returns {Promise<void>}
 */
async function regenerateTestUsers() {
    await deleteTestUsers();
    await addTestUsers();
    await addAllToGroup("OVWSdIxoOVFbOTcOjRRN");
}

/**
 * Adds all users in the 'users' collection to the specified group.
 *
 * @param {string} groupID - The ID of the group to add users to.
 * @returns {Promise<void>}
 */
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

/**
 * Populates the 'users' collection with test users from testUsers.json.
 *
 * @returns {Promise<void>}
 */
async function addTestUsers() {
    let index = 1;
    try {
        const response = await fetch("./testUsers.json");
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

/**
 * Retrieves an image from a dataset of AI-generated faces.
 * The dataset is stored in imagesBase64.json.
 *
 * @param {number} num - The index of the image to retrieve.
 * @returns {Promise<string|null>} The base64-encoded image string or null if not found.
 */
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
    return imageData[`image${num}`] || null;
}

/**
 * Deletes all test users from the 'users' collection.
 * Test users are identified by the 'testUser: true' field in their Firestore documents.
 *
 * @returns {Promise<void>}
 */
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

/**
 * Clears all interests and values for the current user, except for the first entry in each category.
 *
 * @returns {Promise<void>}
 */
async function clearUserInterestsAndValues() {
    const user = auth.currentUser;
    const userDoc = await db.collection("users").doc(user.uid).get();
    const userData = userDoc.data();

    const interests = userData.interests;
    const values = userData.values;

    await db
        .collection("users")
        .doc(user.uid)
        .update({
            interests: { [Object.keys(interests)[0]]: interests[Object.keys(interests)[0]] },
            values: { [Object.keys(values)[0]]: values[Object.keys(values)[0]] },
        });

    console.log("Successfully cleared interests and values except for the first entry.");
}
