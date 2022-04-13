const firebaseConfig = {
    apiKey: "AIzaSyDSKAKXxbMpBJATfwp85PukyUWVufJ06HE",
    authDomain: "xo-vocab.firebaseapp.com",
    databaseURL: "https://xo-vocab-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "xo-vocab",
    storageBucket: "xo-vocab.appspot.com",
    messagingSenderId: "1037749967870",
    appId: "1:1037749967870:web:45d790ea5953b79d523eaf",
    measurementId: "G-QRQC73DHR0"
};
firebase.initializeApp(firebaseConfig);

const refUsers = firebase.database().ref("UserList")

const btnLogout = document.querySelector("#btnLogout");
btnLogout.addEventListener('click', () => {
    firebase.auth().signOut()
    console.log('Logout completed.');
    window.location.href = "./"
})

firebase.auth().onAuthStateChanged((user) => {
    console.log('User: ', user);
    if (user){
        refUsers.child(user.uid).once("value", (data) => {
            const userProfile = data.val()
            $("#profile-name span").html(userProfile.name)
            console.log(window.location.href);
        })

        refOnline.once("value", (data) => {
            data = data.val()
            
            if (!data || !data[user.uid]){
                refOnline.child(user.uid).update({
                    status: "online"
                })
            }
        })

        $(".logged-out").each((i, el) => {
            $(el).hide()
        })
        $(".logged-in").each((i, el) => {
            $(el).show()
        })
    }
    else{
        $(".logged-out").each((i, el) => {
            $(el).show()
        })
        $(".logged-in").each((i, el) => {
            $(el).hide()
        })
    }
})

const refOnline = firebase.database().ref("onlines")

window.onbeforeunload = (event) => {
    const currentUser = firebase.auth().currentUser
    refOnline.once("value", (data) => {
        data = data.val()
        if (data[currentUser.uid]){
            refOnline.child(currentUser.uid).remove()
        }
    })
}

refOnline.on("value", (data) => {
    $("#user-online span").html(data.numChildren())
})