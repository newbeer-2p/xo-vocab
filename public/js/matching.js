const refRooms = firebase.database().ref("Rooms")

$("#btn-find").click(findingMatch)

const findMatchModal = document.querySelector("#findMatchModal")

firebase.auth().onAuthStateChanged((user) => {
    if (user){
        setUpProfile(user)
    }
})


function setUpProfile(user){

    let userProfile = {}

    refUsers.child(user.uid).once("value", (data) => {
        userProfile = data.val()
        userEXP = userProfile.exp % 50;
        userLevel = Math.ceil(userProfile.exp / 50);
        $("#profile-img img").attr("src", `./img/profiles/${userProfile.img}.png`)
        $("#profile-username").html(userProfile.name)
        $("#profile-email").html(userProfile.email)
        $("#profile-win").html(`Win : ${userProfile.win}`)
        $("#profile-lose").html(`Lose : ${userProfile.lose}`)
        $("#profile-level").html(`Level : ${userLevel}`)
        $("#profile-next-to").html(`Next to level ${userLevel+1}`)
        $("#profile-exp-percent").html(`${userEXP} / 50`)
        $("#profile-exp-progress-bar").attr({
            style: `--exp-percent: calc(${(userEXP)}  / 50 * 100%)`
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

function updateFindMatchContent(cmd, room={}){
    if (cmd === "finding"){
        document.querySelectorAll(".join-default").forEach((el) => {$(el).hide()})
        document.querySelectorAll(".join-finding").forEach((el) => {$(el).show()})
        $("#inputCategory").val(room.category)
        $("#inputCategory").attr({disabled: "disabled"})
        $("#btn-join").html(`[${room.category}] Waiting for Player... (${room.time ?? 0})`)
        $(".modal-text").html(`Waiting for Player... (${room.time ?? 0})`)
    }
    else if (cmd === "found") {
        const currentUser = firebase.auth().currentUser
        if (currentUser.uid == room["user-x-id"] || currentUser.uid == room["user-o-id"]){
            document.querySelectorAll(".join-default").forEach((el) => {$(el).hide()})
            document.querySelectorAll(".join-finding").forEach((el) => {$(el).show()})
            $("#btn-cancel-join").hide()
            $("#inputCategory").val(room.category)
            $("#inputCategory").attr({disabled: "disabled"})
            $("#btn-join").html(`Starting in... 5`)
    
            refUsers.child(room["user-x-id"]).once("value", (data1) => {
                const user1 = data1.val()
                refUsers.child(room["user-o-id"]).once("value", (data2) => {
                    const user2 = data2.val()
                    $(".modal-text").html(`${user1.name} vs ${user2.name}<br><span id="countStart">Starting in... 5</span>`)
                    
                    if (!room["tables"]){
                        refRooms.child(room.uid).update({
                            turn: "X",
                            time: 59
                        })
                        randomVocab(room, user1, user2)
                    }
                })
            })
    
            let count = 5;
    
            const countGoToRoom = setInterval(() => {
                count--;
                $("#countStart").html(`Starting in... ${count}`)
                $("#btn-join").html(`Starting in... ${count}`)
                if (count == 0){
                    clearInterval(countGoToRoom)
                    window.location.href = "./game.html"
                }
            }, 1000)
        }
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

        if (!objData.status && objData["user-x-id"] && objData["user-o-id"]){
            if (!objData.status){
                refRooms.child(d).update({
                    status: "found"
                })
            }
            updateFindMatchContent("found", objData)
            return
        }

        if (!objData.uid){
            refRooms.child(d).update({
                uid: d
            })
        }

        if (!objData.status && (currentUser.uid === objData["user-x-id"] || currentUser.uid === objData["user-o-id"])){
            updateFindMatchContent("finding", objData)
            return
        }
        else if (objData.status == "found" || objData.status == "start"){
            updateFindMatchContent("found", objData)
        }
        else{
            updateFindMatchContent("none")
        }
    }
})

function randomVocab(room, user1, user2){
    let rdmVocab = [];
    let user1Level = Math.ceil(user1.exp / 50);
    let user2Level = Math.ceil(user2.exp / 50);
    const minLevel = Math.min(Math.floor(user1Level / 10), Math.floor(user2Level / 10))
    
    $.getJSON("data/vocabulary.json", function(result){
        const vocabs = result[room.category]
        while (rdmVocab.length != 9){
            let rdm = Math.floor((Math.random() * (vocabs.length - 1)));
            if (!rdmVocab.includes(vocabs[rdm]) && parseInt(vocabs[rdm].level) <= minLevel+1){
                rdmVocab.push(vocabs[rdm])
            }
        }
        if (rdmVocab) {
            refRooms.child(room.uid).child("tables").update({
                "row-1-col-1": rdmVocab[0],
                "row-1-col-2": rdmVocab[1],
                "row-1-col-3": rdmVocab[2],
                "row-2-col-1": rdmVocab[3],
                "row-2-col-2": rdmVocab[4],
                "row-2-col-3": rdmVocab[5],
                "row-3-col-1": rdmVocab[6],
                "row-3-col-2": rdmVocab[7],
                "row-3-col-3": rdmVocab[8]
            })
        }
    });
    
}

$("#btnLead").click(toggleLeaderboard)
$("#btncloseLead").click(toggleLeaderboard)

function toggleLeaderboard(){
    $("#leaderboard-box").toggle()
}