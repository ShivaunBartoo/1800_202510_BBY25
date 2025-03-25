import { db } from "./app.js";

function randInt(max) {
    return Math.floor(Math.random() * max);
}

window.getCompatibilityList = getCompatibilityList;
window.getNouns = getNouns;
window.testViewGroupUsers = testViewGroupUsers;
window.testGroupMemberPromise = testGroupMemberPromise;
//Using a group ID and userID, adds the userID to the groups user array and add the groupID to the user.
export function addToGroup(groupID, userID) {
    const group = db.collection("groups").doc(groupID);
    const user = db.collection("users").doc(userID);

    //firestores way of appending data to array values.
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

// Creates a group, names it, then adds the creator to that group.
export async function createGroup(groupName, userID) {
    let groups = db.collection("groups");
    try {
        let group = await groups.add({
            groupName: groupName,
        });
        addToGroup(group.id, userID);
    } catch (err) {
        console.error(err);
    }
}

// returns a promise of group user ids in the specified group.
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

export function getGroupMembersPromise(groupMemberIDs) {
    return new Promise((res, rej) => {
        // console.log(groupMemberIDs);
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
export async function getNouns(groupID) {
    return getGroupMemberIDs(groupID)
        .then((idList) => getGroupMembersPromise(idList))
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

//returns a list of the users compatibility between them and the rest of the group before answering questions
export async function getCompatibilityList(currentUserID, currentGroupID) {
    let currentUser = await db.collection("users").doc(currentUserID).get();
    let compat = {};
    let users = await getGroupMembers(currentGroupID);
    users.forEach((user) => {
        //this makes sure that the user doesn't get the compatabilit they have for themself.
        if (user.id != currentUser.id) {
            let percent = getCompatibility(currentUser.data(), user.data());
            compat[[currentUserID, user.id]] = percent;
        }
    });
    return compat;
}

export function getCompatibility(userData1, userData2) {
    let map1 = { ...userData1.interests, ...userData1.values };
    let map2 = { ...userData2.interests, ...userData2.values };
    //the difference in scores between the current user and the other user.
    let difference = 0;
    //the max possible difference in scores.
    let max = 0;
    for (const key in map2) {
        max += 5;
        if (key in map1) {
            //the difference between the 2 interests, order does not matter here
            difference += Math.abs(map1[key] - map2[key]);
        } else {
            difference += 2.5;
        }
    }

    //the percentage of how close they are to max incompatibility.
    const percent = (difference / max) * 100;
    return 100 - percent;
}

export async function getCommonInterests(userData1, userData2, minScore = 2) {
    let commonList = [];
    let addToList = (map1, map2, wordType) => {
        for (const key in map2) {
            if (key in map1) {
                if (map1[key] >= minScore && map2[key] >= minScore) {
                    console.log("found: " + key);
                    commonList.push({ word: key, type: wordType });
                }
            }
        }
    };
    addToList(userData1.interests, userData2.interests, "interest");
    addToList(userData1.values, userData2.values, "value");
    return commonList;
}

// returns a promise of group users in the specified group.
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

//All functions after this point are for my testing, you shouldn't need them, but feel free to look anyways
function testAddToGroup() {
    db.collection("groups")
        .get()
        .then((doc) => {
            doc.forEach((eachGroup) => {
                let id = eachGroup.id;
                addToGroup(id, "test4", true);
            });
        });
}

async function testViewGroupUsers() {
    const result = await getGroupMemberIDs("OVWSdIxoOVFbOTcOjRRN");
    console.log(await result);
}

async function testGroupMemberPromise(groupID) {
    const a = await getGroupMemberIDs("OVWSdIxoOVFbOTcOjRRN");
    const b = await getGroupMembersPromise(a);
    console.log(await b);
}
