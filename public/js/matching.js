const refRooms = firebase.database().ref("Rooms")

$("#btn-find").click(findingMatch)

const findMatchModal = document.querySelector("#findMatchModal")

let userId = prompt("Please enter your id") ?? 1;
currentUser = {
    uid: userId,
    username: userId,
    email: `${userId}@gmail.com`,
    level: 1,
    exp: 40,
    win: 20,
    lose: 11
}

setUpProfile()

function setUpProfile(){
    // const currentUser = firebase.auth().currentUser
    $("#profile-name").html(`Hello, ${currentUser.uid}`)
    $("#profile-username").html(currentUser.uid)
    $("#profile-email").html(currentUser.email)
    $("#profile-win").html(`Win : ${currentUser.win}`)
    $("#profile-lose").html(`Lose : ${currentUser.lose}`)
    $("#profile-level").html(`Level : ${currentUser.level}`)
    $("#profile-next-to").html(`Next to level ${currentUser.level+1}`)
    $("#profile-exp-percent").html(`${currentUser.exp} / 50`)
    $("#profile-exp-progress-bar").attr({
        style: `--exp-percent: calc(${(currentUser.exp)} / 50 * 100%)`
    })

}

function findUserInfo(){
    // const currentUser = firebase.auth().currentUser
}

function findingMatch(){
    // const currentUser = firebase.auth().currentUser
    // const currentUser = {"uid": "2123"}
    const category = $("#inputCategory").val()

    if (!currentUser){
        alert("Please Login!")
        return
    }

    if (category){

        refRooms.once("value", data => {
            data = data.val()

            if (!data){
                refRooms.push({
                    "user-x-id": currentUser.uid,
                    category: category
                })
            }
            else{
                let joined = false
                for (const roomID in data){
                    const room = data[roomID]
                    if (room["user-x-id"] == currentUser.uid || room["user-o-id"] == currentUser.uid){
                        joined = true
                        return
                    }

                    if (room.category == category){
                        if (!room["user-x-id"]){
                            refRooms.child(roomID).update({
                                "user-x-id": currentUser.uid
                            })
                            joined = true
                        }
                        else if (!room["user-o-id"]){
                            refRooms.child(roomID).update({
                                "user-o-id": currentUser.uid
                            })
                            joined = true
                        }
                    }

                    if (joined){
                        return
                    }
                }

                if (!joined){
                    refRooms.push({
                        "user-x-id": currentUser.uid,
                        category: category
                    })
                }
            }
        })
    }
    else{
        alert("Choose Category!")
    }
}

function searchRoom(){
    // const currentUser = firebase.auth().currentUser
    // const currentUser = {"uid": "2123"}
    let found;
    refRooms.once("value", (data) => {
        data = data.val()
        for (const d in data){
            const objData = data[d]
            if (currentUser.uid === objData["user-x-id"] || currentUser.uid === objData["user-o-id"]){
                found = objData
                found["id"] = d
                return
            }
        }
        if (found){
            return
        }
    })
    return found
}


const countTime = setInterval(() => {
    const roomInfo = searchRoom()

    if (roomInfo){
        if (roomInfo.status === "found"){
            return
        }

        if (roomInfo.time){
            refRooms.child(roomInfo.id).update({
                time: roomInfo.time + 1
            })
        }
        else{
            refRooms.child(roomInfo.id).update({
                time: 1
            })
        }
    }
}, 1000)

$("#btn-cancel-join").click(() => {
    // const currentUser = firebase.auth().currentUser
    // const currentUser = {"uid": "2123"}

    refRooms.once("value", data => {
        data = data.val()
        for (const d in data){
            const objData = data[d]
            if (currentUser.uid === objData["user-x-id"]){
                refRooms.child(d).child("user-x-id").remove()
                updateFindMatchContent("none")
                return
            }
            else if (currentUser.uid === objData["user-o-id"]) {
                refRooms.child(d).child("user-o-id").remove()
                updateFindMatchContent("none")
                return
            }
        }
    })
})

function updateFindMatchContent(cmd, cate="", time=1, id1="", id2=""){
    if (cmd === "finding"){
        document.querySelectorAll(".join-default").forEach((el) => {$(el).hide()})
        document.querySelectorAll(".join-finding").forEach((el) => {$(el).show()})
        $("#inputCategory").val(cate)
        $("#inputCategory").attr({disabled: "disabled"})
        $("#btn-join").html(`[${cate}] Waiting for Player... (${time})`)
        $(".modal-text").html(`Waiting for Player... (${time})`)
    }
    else if (cmd === "found") {
        document.querySelectorAll(".join-default").forEach((el) => {$(el).hide()})
        document.querySelectorAll(".join-finding").forEach((el) => {$(el).show()})
        $("#inputCategory").val(cate)
        $("#inputCategory").attr({disabled: "disabled"})
        $("#btn-join").html(`Found!!!`)
        $(".modal-text").html(`${id1} vs ${id2}`)
    }
    else {
        document.querySelectorAll(".join-default").forEach((el) => {$(el).show()})
        document.querySelectorAll(".join-finding").forEach((el) => {$(el).hide()})
        $("#inputCategory").removeAttr("disabled")
        $("#btn-join").html("Join Game")
    }
}

refRooms.on("value", (data) => {
    data = data.val()
    // const currentUser = firebase.auth().currentUser
    // const currentUser = {"uid": "2123"}
    updateFindMatchContent("none")
    for (const d in data){
        const objData = data[d]

        if (!objData["user-x-id"] && !objData["user-o-id"]){
            refRooms.child(d).remove()
        }

        if (objData["user-x-id"] && objData["user-o-id"]){
            refRooms.child(d).update({
                status: "found"
            })
            updateFindMatchContent("found", objData.category, 0, objData["user-x-id"], objData["user-o-id"])
            // clearInterval(countTime)
            return
        }
        else{
            refRooms.child(d).child("status").remove()
        }

        if (currentUser.uid === objData["user-x-id"] || currentUser.uid === objData["user-o-id"]){
            updateFindMatchContent("finding", objData.category, objData.time ?? 0)
            return
        }
        else{
            updateFindMatchContent("none")
        }
    }
})