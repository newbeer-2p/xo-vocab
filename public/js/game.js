const refRooms = firebase.database().ref("Rooms")
let roomInfo = {}

refRooms.on("value", data => {
    data = data.val()
    const currentUser = firebase.auth().currentUser
    for (const d in data){
        const rInfo = data[d]
        if (rInfo["user-x-id"] === currentUser.uid || rInfo["user-o-id"] === currentUser.uid){
            roomInfo = rInfo
            setUpGame(rInfo)
            checkWinner(rInfo)
        }
    }
})

function setUpGame(room){
    for (const player of ["x", "o"]){
        refUsers.child(room[`user-${player}-id`]).once("value", data => {
            const user = data.val()
            $(`#game-info-user-${player} .game-user-img img`).attr({
                src: `./img/profiles/${user.img}.png`
            })
            $(`#game-info-user-${player} .game-user-name`).html(user.name)
            $(`#game-info-user-${player} .game-user-level`).html(`Level : ${user.level}`)

            if (!room.winner && room.turn.toLowerCase() === player){
                $("#game-info-turn span").html(user.name)
            }

        })
    }
    
    $(`#game-info-category`).html(`Category : ${room.category}`)

    if (room.winner === "draw"){
        $(`#game-info-player`).html("")
        $("#game-info-turn").html(`<span> DRAW </span>`)
    }
    else if (room.winner){
        $(`#game-info-player`).html("")
        refUsers.child(room[`user-${room.winner.toLowerCase()}-id`]).once("value", (data) => {
            const user = data.val()
            $("#game-info-turn").html(`Winner is <span>${user.name}</span>`)
        })
    }
    else{
        $(`#game-info-player span`).html(room.turn)
    }
    

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
            alert("No!")
            return
        }

        if (roomInfo.winner){
            return
        }

        const pos = el.parentNode.parentNode.id

        if (roomInfo["tables"][pos].own){
            alert("No!")
            return
        }

        $("#vocabModalLabel").val(pos)
        $("#vocabModalLabel").html(pos)
        const img = document.getElementById('imganswer')
        img.src = el.src
        var ansfill = document.getElementById('ansfill')
        var getget = el.src.substr(33)
        var getget1 = getget.substr(0, getget.indexOf("."))
        test = getget1
        console.log(ansfill.hasChildNodes())
        if(ansfill.hasChildNodes()){
            ansfill.innerHTML = "";
            
        }
        for(let i = 0; i<getget.indexOf(".");i++){
            var p = document.createElement('p')
            p.innerHTML = "_"
            ansfill.appendChild(p)
        }
        $("#vocabModal").modal("show")
    })
})
var test = ""
$("#btn-answer").click(() => {
    console.log(test)
    // Test Tic Tac Toe
    refRooms.child(roomInfo.uid).child("tables").child($('#vocabModalLabel').val()).update({
        own : roomInfo.turn
    })
    refRooms.child(roomInfo.uid).update({
        turn: roomInfo.turn === "X" ? "O" : "X" 
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

$("#btn-exit").click(() => {
    refRooms.child(roomInfo.uid).remove()
    window.location.href = './lobby.html'
})