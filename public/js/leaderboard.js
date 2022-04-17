//refUsers.orderByChild("win").limitToFirst(10).on("child_added", (snap) => {
//    console.log(snap.val());
//});
refUsers.orderByChild("win").on("value", (data) => {
    const newData = sortObjectReverse(data)
})

function sortObjectReverse(obj){
    let toArray = [];
    obj.forEach((o) => {
        let newArray = []
        newArray.push(o.val())
        for (const ar of toArray){

            newArray.push(ar)
        }
        toArray = newArray
    })

    return toArray
}

refUsers.orderByChild("win").limitToLast(10).once('value', function(snapshot) {
    var tr;
    var rank = 10;

    snapshot.forEach((snap) => {
        tr = $('<ul/>');
        tr.append("<li class='list-rank'><p>" + rank + "</p></li>");
        tr.append("<li class='list-player'><p>" + snap.val().name.toLocaleString() + "</p></li>");
        tr.append("<li class='list-win'><p>" + snap.val().win.toLocaleString() + "</p></li>");
        $('table').append(tr);
        rank = rank - 1;
});
})