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
        })
    }

    $(`#game-info-category`).html(`[ ${room.category} ]`)
}

document.querySelectorAll(".game-item div").forEach(el => {
    $(el).click(() => {
        if (event.target !== el){
            return;
        }

        alert(event.target.parentNode.id)
    })
})

function checkWinner(){
    ref.child("game-1").once("value", snapshot => {
        data = snapshot.val()
        currentUser = firebase.auth().currentUser
        turns = ["X", "O"]

        if (data.winner){
            return
        }

        for (const turn of turns){
            win1 = data["tables"]["row-1-col-1"] == turn && data["tables"]["row-1-col-2"] == turn && data["tables"]["row-1-col-3"] == turn 
            win2 = data["tables"]["row-2-col-1"] == turn && data["tables"]["row-2-col-2"] == turn && data["tables"]["row-2-col-3"] == turn 
            win3 = data["tables"]["row-3-col-1"] == turn && data["tables"]["row-3-col-2"] == turn && data["tables"]["row-3-col-3"] == turn 
            win4 = data["tables"]["row-1-col-1"] == turn && data["tables"]["row-2-col-1"] == turn && data["tables"]["row-3-col-1"] == turn 
            win5 = data["tables"]["row-1-col-2"] == turn && data["tables"]["row-2-col-2"] == turn && data["tables"]["row-3-col-2"] == turn 
            win6 = data["tables"]["row-1-col-3"] == turn && data["tables"]["row-2-col-3"] == turn && data["tables"]["row-3-col-3"] == turn 
            win7 = data["tables"]["row-1-col-1"] == turn && data["tables"]["row-2-col-2"] == turn && data["tables"]["row-3-col-3"] == turn 
            win8 = data["tables"]["row-1-col-3"] == turn && data["tables"]["row-2-col-2"] == turn && data["tables"]["row-3-col-1"] == turn 

            if (win1 || win2 || win3 || win4 || win5 || win6 || win7 || win8){
                ref.child("game-1").update({
                    status: "finish",
                    winner: turn
                })
                id = data[`user-${turn.toLowerCase()}-id`]
                refScore.once("value", snapshot => {
                    scores = snapshot.val()
                    if (!scores || !scores[id]){
                        refScore.update({
                            [id]: 1
                        })
                    }
                    else{
                        score = scores[id]
                        refScore.update({
                            [id]: parseInt(score) + 1
                        })
                    }
                })

                return
            }

            if (data["tables"]["row-1-col-1"] && data["tables"]["row-1-col-2"] && data["tables"]["row-1-col-3"] && data["tables"]["row-2-col-1"] && data["tables"]["row-2-col-2"] && data["tables"]["row-3-col-1"] && data["tables"]["row-3-col-2"] && data["tables"]["row-3-col-3"]){
                ref.child("game-1").update({
                    status: "finish",
                    winner: "draw"
                })

                id1 = data[`user-x-id`]
                id2 = data[`user-o-id`]

                refScore.once("value", snapshot => {
                    scores = snapshot.val()
                    if (!scores || !scores[id1]){
                        refScore.update({
                            [id1]: 1
                        })
                    }
                    else{
                        score = scores[id1]
                        refScore.update({
                            [id1]: parseInt(score) + 1
                        })
                    }

                    if (!scores || !scores[id2]){
                        refScore.update({
                            [id2]: 1
                        })
                    }
                    else{
                        score = scores[id2]
                        refScore.update({
                            [id2]: parseInt(score) + 1
                        })
                    }
                    return
                })
            }
        }
    })
}