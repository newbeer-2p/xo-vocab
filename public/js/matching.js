const refRooms = firebase.database().ref("Rooms")

$("#btn-find").click(findingMatch)

const findMatchModal = document.querySelector("#findMatchModal")

firebase.auth().onAuthStateChanged((user) => {
    console.log('User: ', user);
    if (user){
        setUpProfile(user)
    }
})


function setUpProfile(user){

    let userProfile = {}

    refUsers.child(user.uid).once("value", (data) => {
        userProfile = data.val()

        $("#profile-name").html(`Hello, ${userProfile.name}`)
        $("#profile-username").html(userProfile.name)
        $("#profile-email").html(userProfile.email)
        $("#profile-win").html(`Win : ${userProfile.win}`)
        $("#profile-lose").html(`Lose : ${userProfile.lose}`)
        $("#profile-level").html(`Level : ${userProfile.level}`)
        $("#profile-next-to").html(`Next to level ${userProfile.level+1}`)
        $("#profile-exp-percent").html(`${userProfile.exp} / 50`)
        $("#profile-exp-progress-bar").attr({
            style: `--exp-percent: calc(${(userProfile.exp)} / 50 * 100%)`
        })
    })

}

function findingMatch(){
    const currentUser = firebase.auth().currentUser
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
    const currentUser = firebase.auth().currentUser

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
    const currentUser = firebase.auth().currentUser

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

        refUsers.child(id1).once("value", (data1) => {
            const user1 = data1.val()
            refUsers.child(id2).once("value", (data2) => {
                const user2 = data2.val()
                $(".modal-text").html(`${user1.name}<br>vs<br>${user2.name}`)
            })
        })
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
    const currentUser = firebase.auth().currentUser
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