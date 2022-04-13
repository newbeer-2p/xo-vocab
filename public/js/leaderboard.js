refUsers.orderByChild("win").limitToFirst(10).on("child_added", (snap) => {
    console.log(snap.val());
});


refUsers.orderByChild("win").limitToFirst(5).once('value', function(snapshot) {
    var tr;
    var rank = 1;

    snapshot.forEach((snap) => {
        tr = $('<ul/>');
        tr.append("<li><p>" + rank + "</p></li>");
        tr.append("<li><p>" + snap.val().email.toLocaleString() + "</p></li>");
        tr.append("<li><p>" + snap.val().win.toLocaleString() + "</p></li>");
        $('table').append(tr);
        rank = rank + 1;
});
})