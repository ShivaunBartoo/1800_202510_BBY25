import { db } from "./app.js";

function randInt(max) {
    return Math.floor(Math.random() * max);
}

window.getCompatibility = getCompatibility;
window.getNouns = getNouns;
window.testViewGroupUsers = testViewGroupUsers;
window.testGroupMemberPromise = testGroupMemberPromise;
//Using a group ID and userID, adds the userID to the groups user array.
export function addToGroup(groupID, userID) {
    const group = db.collection("groups").doc(groupID);
    const user = db.collection(collection).doc(userID);

    //firestores way of appending data to array values.
    group.update({
        users: firebase.firestore.FieldValue.arrayUnion(userID),
    });
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

export async function getCompatibility(currentUserID, currentGroupID) {
    let users = await getGroupMembers(currentGroupID);
    let currentUser = await db.collection("users").doc(currentUserID).get();
    let compat = {};
    users.forEach((user) => {
        // console.log(user.data().interests);
        let currentUserInterests = currentUser.data().interests;
        console.log(currentUserInterests);
        for (key in currentUserInterests) {
            console.log(key);
        }
        // let userInterests = user.data().interests;
        // let difference = 0;
        // let max = 0;
        // for(key in currentUserInterests) {
        //     max += 5;
        //     if(key in userInterests) {
        //         const i = currentUserInterests[key];
        //         const j = userInterests[key]
        //         difference += Math.abs(i-j);
        //     }
        //     const percent = (difference/max)*100;
        //     console.log(percent)
        //     compat[currentUserID+ ", " + user.id] = percent;
        // }
    });

    // console.log(compat)
    //get list of users from group
    //go through each user
    //compares values and interests between the 2, calculates the "compatibility"
    //
    //return a list of users and compatibility in relation to the currentUser
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
