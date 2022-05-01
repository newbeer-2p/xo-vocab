const refRooms = firebase.database().ref("Rooms")
let roomInfo = {}

refRooms.on("value", data => {
    data = data.val()
    const currentUser = firebase.auth().currentUser
    for (const d in data){
        const rInfo = data[d]
        if (rInfo["user-x-id"] === currentUser.uid || rInfo["user-o-id"] === currentUser.uid){
            roomInfo = rInfo
            if (rInfo.status == "found"){
                refRooms.child(rInfo.uid).update({
                    status: "start"
                })
            }
            setUpGame(rInfo)
            checkWinner(rInfo)
        }
    }
})

function setUpGame(room){
    const currentUser = firebase.auth().currentUser
    for (const player of ["x", "o"]){
        refUsers.child(room[`user-${player}-id`]).once("value", data => {
            const user = data.val()
            $(`#game-info-user-${player} .game-user-img img`).attr({
                src: `./img/profiles/${user.img}.png`
            })
            $(`#game-info-user-${player} .game-user-name`).html(user.name)
            $(`#game-info-user-${player} .game-user-level`).html(`Level : ${user.level}`)

            if (!room.winner && room.turn.toLowerCase() === player){
                $("#game-info-turn span").html(room[`user-${room.turn.toLowerCase()}-id`] == currentUser.uid ? "YOU!" : user.name)
            }

        })
    }
    
    $(`#game-info-category`).html(`Category : ${room.category}`)
    $(`#game-info-time span`).html("&nbsp;" + room.time)

    if (room.winner === "draw"){
        $(`#game-info-player`).html("")
        $("#game-info-turn").html(`<span> DRAW </span>`)
        finishGame()
    }
    else if (room.winner){
        $(`#game-info-player`).html("")
        refUsers.child(room[`user-${room.winner.toLowerCase()}-id`]).once("value", (data) => {
            const user = data.val()
            $("#game-info-turn").html(`Winner is <span>${user.name}</span>`)
        })
        finishGame()
    }
    else{
        $(`#game-info-player span`).html(room.turn)
    }
    $("#vocabModalLabel .vocabModal-time").html(`Time : ${room.time}`)
    

    for (const xoBox in room["tables"]){
        const xo = room["tables"][xoBox]

        if (xo.own){
            $(`#${xoBox} img`).attr({
                src: `./img/${xo.own}.png`
            })
        }
        else{
            $(`#${xoBox} img`).attr({
                src: xo.img
            })
        }
    }
}

document.querySelectorAll(".game-item div img").forEach(el => {
    $(el).click(() => {
        if (event.target !== el){
            return;
        }

        const currentUser = firebase.auth().currentUser
        if (currentUser.uid !== roomInfo[`user-${roomInfo.turn.toLowerCase()}-id`]){
            showDialog("Not your turn!")
            return
        }

        if (roomInfo.winner){
            return
        }

        const pos = el.parentNode.parentNode.id

        if (roomInfo["tables"][pos].own){
            showDialog("Change Table!")
            return
        }

        $("#vocabModalLabel").val(pos)
        $("#vocabModalLabel .vocabModal-table").html(pos)
        refRooms.child(roomInfo.uid).child("tables").child($('#vocabModalLabel').val()).once("value", (data) => {
            var datastr = data.val();
            const img = document.getElementById('imganswer')
            img.src = datastr.img
            var ansfill = document.getElementById('ansfill')
            console.log(datastr.img)
            console.log(ansfill.hasChildNodes())
        if(ansfill.hasChildNodes()){
            ansfill.innerHTML = "";
            
        }
        for(let i = 0; i<name_el.length;i++){
            var p = document.createElement('p')
            p.innerHTML = "_"
            ansfill.appendChild(p)
        }
          })    
        $("#vocabModal").modal("show")
    })
})
var test = ""
$("#btn-answer").click(() => {
    console.log(test)
    
    // When click and answer TRUE
    refRooms.child(roomInfo.uid).child("tables").child($('#vocabModalLabel').val()).update({
        own : roomInfo.turn
    })
    refRooms.child(roomInfo.uid).update({
        turn: roomInfo.turn === "X" ? "O" : "X",
        time: 59
    })
    $("#vocabModal").modal("hide")
})

function checkWinner(room){
    refRooms.child(room.uid).once("value", (data) => {
        data = data.val()

        if (data.winner){
            return
        }

        for (const turn of ["X", "O"]){
            win1 = data["tables"]["row-1-col-1"]["own"] == turn && data["tables"]["row-1-col-2"]["own"] == turn && data["tables"]["row-1-col-3"]["own"] == turn 
            win2 = data["tables"]["row-2-col-1"]["own"] == turn && data["tables"]["row-2-col-2"]["own"] == turn && data["tables"]["row-2-col-3"]["own"] == turn 
            win3 = data["tables"]["row-3-col-1"]["own"] == turn && data["tables"]["row-3-col-2"]["own"] == turn && data["tables"]["row-3-col-3"]["own"] == turn 
            win4 = data["tables"]["row-1-col-1"]["own"] == turn && data["tables"]["row-2-col-1"]["own"] == turn && data["tables"]["row-3-col-1"]["own"] == turn 
            win5 = data["tables"]["row-1-col-2"]["own"] == turn && data["tables"]["row-2-col-2"]["own"] == turn && data["tables"]["row-3-col-2"]["own"] == turn 
            win6 = data["tables"]["row-1-col-3"]["own"] == turn && data["tables"]["row-2-col-3"]["own"] == turn && data["tables"]["row-3-col-3"]["own"] == turn 
            win7 = data["tables"]["row-1-col-1"]["own"] == turn && data["tables"]["row-2-col-2"]["own"] == turn && data["tables"]["row-3-col-3"]["own"] == turn 
            win8 = data["tables"]["row-1-col-3"]["own"] == turn && data["tables"]["row-2-col-2"]["own"] == turn && data["tables"]["row-3-col-1"]["own"] == turn 

            if (win1 || win2 || win3 || win4 || win5 || win6 || win7 || win8){
                refRooms.child(room.uid).update({
                    status: "finish",
                    winner: turn
                })
                const idWin = data[`user-${turn.toLowerCase()}-id`]
                const idLose = data[`user-${turn === "X" ? "o" : "x"}-id`]
                refUsers.child(idWin).once("value", (data) => {
                    user = data.val()
                    refUsers.child(idWin).update({
                        win: parseInt(user.win) + 1
                    })
                })
                refUsers.child(idLose).once("value", (data) => {
                    user = data.val()
                    refUsers.child(idLose).update({
                        lose: parseInt(user.lose) + 1
                    })
                })
                return
            }

            if (data["tables"]["row-1-col-1"]["own"] && data["tables"]["row-1-col-2"]["own"] && data["tables"]["row-1-col-3"]["own"] && data["tables"]["row-2-col-1"]["own"] && data["tables"]["row-2-col-2"]["own"] && data["tables"]["row-2-col-3"]["own"] && data["tables"]["row-3-col-1"]["own"] && data["tables"]["row-3-col-2"]["own"] && data["tables"]["row-3-col-3"]["own"]){
                refRooms.child(room.uid).update({
                    status: "finish",
                    winner: "draw"
                })
            }
        }
    })
}

let countTime = setInterval(() => {
    const currentUser = firebase.auth().currentUser
    if (roomInfo.uid){
        refRooms.child(roomInfo.uid).once("value", (data) => {
            data = data.val()
            if (data[`user-${data.turn.toLowerCase()}-id`] == currentUser.uid && data.status == "start")
            if (parseInt(data.time) - 1 >= 0) {
                refRooms.child(roomInfo.uid).update({
                    time: parseInt(data.time) - 1
                })
            }
            else{
                $("#vocabModal").modal("hide")
                refRooms.child(roomInfo.uid).update({
                    time: 59,
                    turn: data.turn == "X" ? "O" : "X"
                })
            }
        })
    }
}, 1000)

$("#btn-exit").click(() => {
    refRooms.child(roomInfo.uid).remove()
    window.location.href = './lobby.html'
})

$("#btn-finish").click(finishGame)

function finishGame(){
    clearInterval(countTime)
    refRooms.child(roomInfo.uid).update({
        status: "finish"
    })
    $("#finishModal").modal({
        backdrop: "static"
    })
    $("#finishModal").modal("show")

    const currentUser = firebase.auth().currentUser
    for (const player of ["x", "o"])
    {
        refUsers.child(roomInfo[`user-${player}-id`]).once("value", (data) => {
            const userProfile = data.val()
            let addExp = 10;
            if (currentUser.uid == roomInfo[`user-${player}-id`]){
                if (roomInfo.winner == "draw"){
                    $("#whoWin").html("Draw 😆")
                    $("#desGameOver").html("Good Job, " + userProfile.name)
                    addExp = 15
                }
                else if (currentUser.uid == roomInfo[`user-${roomInfo.winner.toLowerCase()}-id`]){
                    addExp = 20
                    console.log(userProfile.name);
                    $("#whoWin").html("You Win 😁")
                    $("#desGameOver").html("Congratulations, " + userProfile.name)
                }
                else {
                    $("#whoWin").html("You Lose 😥")
                    $("#desGameOver").html("Nice Try, " + userProfile.name)
                }
                refUsers.child(currentUser.uid).once("value", (data) => {
                    user = data.val()
                    refUsers.child(currentUser.uid).update({
                        exp: parseInt(user.exp) + addExp
                    })
                })
                // แนะนำให้ใส่เพิ่ม exp ตรงนี้
                

                $("#profile-exp-progress-bar").attr({
                    style: `--exp-percent: calc(${(userProfile.exp)} / 50 * 100%)`
                })
                $("#profile-next-to span").html(parseInt(userProfile.level) + 1)
                $("#profile-exp-percent").html(`(+ ${addExp}) <span>${userProfile.exp + addExp}</span> / 50`)
                setTimeout(() => {
                    $("#profile-exp-progress-bar").attr({
                        style: `--exp-percent: calc(${(userProfile.exp + addExp)} / 50 * 100%)`
                    })
                    if (Math.floor((parseInt(userProfile.exp) + addExp) / 50)){
                        setTimeout(() => {
                            levelUp(userProfile)
                        }, 1000)
                    }
                }, 1000)
            }

        })
    }
}

function levelUp(userProfile){
    console.log("Level UP!, " + userProfile.name);
}

function showDialog(message){
    $("#messageModal .modal-body").html(message)
    $("#messageModal").modal("show")
    setTimeout(() => {
        $("#messageModal").modal("hide")
    }, 1000)
}