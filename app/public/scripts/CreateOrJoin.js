import { auth, db } from "./app.js";
import { createGroup, addToGroup, getGroup } from "./groupManager.js";
import { loadHeader } from "./loadContent.js";

const defaultGroupCode = "OVWSdIxoOVFbOTcOjRRN";
initialize();

function initialize() {
    loadHeader(false, false, false, false);

    document.getElementById("createGroup").addEventListener("submit", async (event) => {
        event.preventDefault();
        const user = auth.currentUser;
        if (user) {
            const groupName = document.getElementById("groupName").value;
            if (groupName) {
                let group = await createGroup(groupName, user.uid);

                await db.collection("users").doc(user.uid).update({
                    activeGroup: group.id,
                });
                location.href = "./profile_setup.html";
            } else {
                let warning = document.querySelector("#blank-name");
                warning.style.display = "block";
                document.getElementById("groupName").value = "";
            }
        } else {
            console.log("User is not logged in");
        }
    });

    document.querySelectorAll(".choice-switcher").forEach((element) => {
        element.addEventListener("click", () => {
            const joinGroup = document.querySelector("#joinGroup");
            const createGroup = document.querySelector("#createGroup");
            if (joinGroup.style.display === "none") {
                joinGroup.style.display = "flex";
                createGroup.style.display = "none";
            } else {
                joinGroup.style.display = "none";
                createGroup.style.display = "flex";
            }
        });
    });

    document.querySelectorAll("input[type='text']").forEach((input) => {
        input.addEventListener("click", () => {
            document.querySelectorAll(".warning").forEach((warning) => {
                warning.style.display = "none";
            });
        });
    });

    document.getElementById("joinGroup").addEventListener("submit", async (event) => {
        event.preventDefault();
        const user = auth.currentUser;
        if (user) {
            let groupID = document.getElementById("groupCode").value;
            if (!groupID) {
                groupID = defaultGroupCode;
            }
            console.log(groupID);
            let group = await getGroup(groupID);
            if (group.exists) {
                addToGroup(groupID, user.uid);
                await db.collection("users").doc(user.uid).update({
                    activeGroup: groupID,
                });
                location.href = "./profile_setup.html";
            } else {
                let warning = document.querySelector("#bad-group-code");
                warning.style.display = "block";
                document.getElementById("groupCode").value = "";

                console.log("invalid group code.");
            }
        } else {
            console.log("User is not logged in");
        }
    });
}
