/**
 * This script manages group-related functionality, including creating groups, adding users to groups,
 * retrieving group members, and calculating compatibility between users.
 *
 * This script is used across multiple pages where group management is required, such as creating or joining groups,
 * viewing group members, and calculating compatibility scores.
 *
 * Firestore is used to store and retrieve group and user data.
 */

import { db } from "./app.js";

/**
 * Adds a user to a group and updates the user's group list in Firestore.
 *
 * @param {string} groupID - The ID of the group to add the user to.
 * @param {string} userID - The ID of the user to add to the group.
 */
export function addToGroup(groupID, userID) {
    const group = db.collection("groups").doc(groupID);
    const user = db.collection("users").doc(userID);
    try {
        group.update({
            users: firebase.firestore.FieldValue.arrayUnion(userID),
        });
    } catch (err) {
        console.log("Group does not exist");
    }
    user.update({
        groups: firebase.firestore.FieldValue.arrayUnion(groupID),
    });
}

/**
 * Retrieves a group document from Firestore.
 *
 * @param {string} groupID - The ID of the group to retrieve.
 * @returns {Promise<Object>} The Firestore document for the group.
 */
export async function getGroup(groupID) {
    return db.collection("groups").doc(groupID).get();
}

/**
 * Creates a new group, names it, and adds the creator to the group.
 *
 * @param {string} groupName - The name of the group to create.
 * @param {string} userID - The ID of the user creating the group.
 * @returns {Promise<Object>} The Firestore document for the newly created group.
 */
export async function createGroup(groupName, userID) {
    let groups = db.collection("groups");
    try {
        let group = await groups.add({
            groupName: groupName,
        });
        await addToGroup(group.id, userID);
        return group;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

/**
 * Retrieves the IDs of all users in a specified group.
 *
 * @param {string} groupID - The ID of the group to retrieve user IDs from.
 * @returns {Promise<Array<string>>} A promise resolving to an array of user IDs.
 */
export function getGroupMemberIDs(groupID) {
    return new Promise((res, rej) => {
        const group = db.collection("groups").doc(groupID);
        group.get().then((doc) => {
            if (doc.exists) {
                res(doc.data().users);
            } else {
                rej("Document does not exist, or something broke.");
            }
        });
    });
}

/**
 * Retrieves user documents for a list of user IDs.
 *
 * @param {Array<string>} groupMemberIDs - An array of user IDs to retrieve.
 * @returns {Promise<Array<Object>>} A promise resolving to an array of user documents.
 */
export function getGroupMembersByID(groupMemberIDs) {
    return new Promise((res, rej) => {
        let users = [];
        db.collection("users")
            .get()
            .then((doc) => {
                doc.forEach((eachUser) => {
                    if (groupMemberIDs.includes(eachUser.id)) {
                        users.push(eachUser);
                    }
                });
                if (users.length > 0) {
                    res(users);
                } else {
                    rej("No users in list, or something broke.");
                }
            });
    });
}

/**
 * Retrieves all nouns (interests and values) from the members of a specified group.
 *
 * @param {string} groupID - The ID of the group to retrieve nouns from.
 * @returns {Promise<Array<Object>>} A promise resolving to an array of nouns.
 */
export async function getNouns(groupID) {
    return getGroupMemberIDs(groupID)
        .then((idList) => getGroupMembersByID(idList))
        .then((usersList) => {
            let nouns = [];
            usersList.forEach((user) => {
                let data = user.data();
                for (const key in data.values) {
                    if (!nouns.some((noun) => noun.word === key)) {
                        nouns.push({ word: key, type: "value" });
                    }
                }
                for (const key in data.interests) {
                    if (!nouns.some((noun) => noun.word === key)) {
                        nouns.push({ word: key, type: "interest" });
                    }
                }
            });
            return nouns;
        })
        .catch((err) => console.log(err));
}

/**
 * Calculates compatibility scores between a user and other members of a group.
 *
 * @param {string} currentUserID - The ID of the user to calculate compatibility for.
 * @param {string} currentGroupID - The ID of the group to calculate compatibility within.
 * @returns {Promise<Array<Object>>} A promise resolving to an array of compatibility scores.
 */
export async function getCompatibilityList(currentUserID, currentGroupID) {
    let currentUser = await db.collection("users").doc(currentUserID).get();
    let compat = [];
    let users = await getGroupMembers(currentGroupID);
    users.forEach((user) => {
        if (user.id != currentUser.id) {
            let percent = getCompatibility(currentUser.data(), user.data());
            compat.push({
                user1: currentUserID,
                user2: user.id,
                percent: percent[0],
                fullOverlap: percent[1],
            });
        }
    });
    return compat;
}

/**
 * Calculates compatibility between two users based on their interests and values.
 *
 * @param {Object} userData1 - The data of the first user.
 * @param {Object} userData2 - The data of the second user.
 * @returns {Array<number>} An array containing the compatibility percentage and full overlap status.
 */
export function getCompatibility(userData1, userData2) {
    let map1 = { ...userData1.interests, ...userData1.values };
    let map2 = { ...userData2.interests, ...userData2.values };

    let fullOverlap = true;
    let difference = 0;
    let max = 0;
    for (const key in map1) {
        max += 4;
        if (key in map2) {
            difference += Math.abs(map1[key] - map2[key]) - 1;
        } else {
            difference += 2;
            fullOverlap = false;
        }
    }

    const percent = (difference / max) * 100;
    return [100 - percent, fullOverlap];
}

/**
 * Retrieves common interests and values between two users.
 *
 * @param {Object} userData1 - The data of the first user.
 * @param {Object} userData2 - The data of the second user.
 * @param {number} [minScore=2] - The minimum score for an interest or value to be considered common.
 * @returns {Promise<Array<Object>>} A promise resolving to an array of common interests and values.
 */
export async function getCommonInterests(userData1, userData2, minScore = 2) {
    let commonList = [];
    let addToList = (map1, map2, wordType) => {
        for (const key in map2) {
            if (key in map1) {
                if (map1[key] >= minScore && map2[key] >= minScore) {
                    commonList.push({ word: key, type: wordType });
                }
            }
        }
    };
    addToList(userData1.interests, userData2.interests, "interest");
    addToList(userData1.values, userData2.values, "value");
    return commonList;
}

/**
 * Retrieves user documents for all members of a specified group.
 *
 * @param {string} groupID - The ID of the group to retrieve members from.
 * @returns {Promise<Array<Object>>} A promise resolving to an array of user documents.
 */
export async function getGroupMembers(groupID) {
    let userIDs = await getGroupMemberIDs(groupID);
    if (!userIDs || userIDs.length === 0) {
        console.log("No users in this group");
        return [];
    }
    let users = [];
    const userDocs = await db.collection("users").get();
    userDocs.forEach((doc) => {
        if (userIDs.includes(doc.id)) {
            users.push(doc);
        }
    });
    return users;
}
