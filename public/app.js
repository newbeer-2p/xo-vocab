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
            $("#profile-name").html(`Hello, ${userProfile.name}`)
        })
    }
})