const signupForm = document.querySelector("#signup-form");
const signupForm1 = document.querySelector("#signup-form_1");
signupForm.addEventListener("submit", createUser);

const signupFeedback = document.querySelector("#feedback-msg-signup");
const singupModal = new bootstrap.Modal(document.querySelector("#modal-signup"));

function createUser(event) {
    event.preventDefault();
    const name = signupForm['input-name-signup'].value
    const email = signupForm['input-email-signup'].value;
    const pwd = signupForm['input-password-signup'].value;
    const pic = signupForm1['profileimg'].src;
    var img1 = pic.split("/")
    var subimg = img1[img1.length-1].split(".")[0]
    firebase.auth().createUserWithEmailAndPassword(email, pwd)
    .then(() => {
            signupFeedback.style = `color:green`;
            signupFeedback.innerHTML = `<i class="bi bi-check-circle-fill"></i> Signup Complete.`;
            setTimeout(function (){
                singupModal.hide();
            }, 1000);
            const ref = firebase.database().ref("UserList")
            const currentUser = firebase.auth().currentUser;
            ref.child(currentUser.uid).update({
                uid: currentUser.uid,
                name: name,
                email: email,
                win: 0,
                lose: 0,
                level: 1,
                exp: 0,
                img: subimg
            });
        })
        .catch((error) => {
            signupFeedback.style = `color:crimson`;
            signupFeedback.innerText = `${error.message}`;
            signupForm.reset();
        });
}
const loginForm = document.querySelector("#login-form");
loginForm.addEventListener("submit", loginUser);

const loginFeedback = document.querySelector("#feedback-msg-login");
// const loginModal = new bootstrap.Modal(document.querySelector("#modal-login"));

function loginUser(event) {
    event.preventDefault();
    const email = loginForm['input-email-login'].value;
    const pwd = loginForm['input-password-login'].value;
    firebase.auth().signInWithEmailAndPassword(email, pwd)
    .then(() => {
            loginFeedback.style = `color:green`;
            loginFeedback.innerHTML = `<i class="bi bi-check-circle-fill"></i> login Complete.`;
            setTimeout(function (){
                // loginModal.hide();
                window.location.href = "./lobby.html"
            }, 1000);
        })
        .catch((error) => {
            loginFeedback.style = `color:crimson`;
            loginFeedback.innerText = `${error.message}`;
            loginForm.reset();
        });
}
// firebase.auth().onAuthStateChanged((user) => {
//     console.log('User: ', user);
//     setupUI(user);
// });

// const btnCancel = document.querySelectorAll('.btn-cancel').forEach(btn => {
//     btn.addEventListener('click', () => {
//         signupForm.reset();
//         signupFeedback.innerHTML = ``
//     })
// const btnLogout = document.querySelector('#btnLogout');
// btnLogout.addEventListener('click', ()=> {
//     firebase.auth().signOut();
//     console.log('logout complete');
// })
// })

