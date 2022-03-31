const refRooms = firebase.database().ref("Rooms")

$("#btn-find").click(findingMatch)

const findMatchModal = document.querySelector("#findMatchModal")

function findingMatch(){
    // const currentUser = firebase.auth().currentUser
    const currentUser = {"uid": "2123"}
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
