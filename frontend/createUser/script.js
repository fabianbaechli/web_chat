const fields = {fullName: false, email: false, username: false, url: false, password: false, retypePassword: false};

document.addEventListener('DOMContentLoaded', function () {
    checkName();
    checkEmail();
    checkUsername();
    checkURL();
    checkPassword();
    checkRetypePassword();
});
function checkForm() {
    for (let key in fields) {
        if (fields[key] === false) {
            window.alert(key + " not properly set");
            return false;
        }
    }
}

function checkName() {
    const regex = /^[a-zA-Z ]{2,30}$/;
    const element = document.getElementById("fullNameTextField");

    if (regex.test(element.value)) {
        fields.fullName = true;
        colorize(element, true)
    } else {
        fields.fullName = false;
        colorize(element, false)
    }
}
function checkEmail() {
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const element = document.getElementById("emailTextField");

    if (regex.test(element.value)) {
        fields.email = true;
        colorize(element, true)
    } else {
        fields.email = false;
        colorize(element, false)
    }
}
function checkUsername() {
    const regex = /^.{2,20}$/;
    const element = document.getElementById("usernameTextField");

    if (regex.test(element.value)) {
        fields.username = true;
        colorize(element, true)
    } else {
        fields.username = false;
        colorize(element, false)
    }
}

function checkURL() {
    const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)/;
    const element = document.getElementById("imagePathTextField");

    if (regex.test(element.value)) {
        fields.url = true;
        colorize(element, true)
    } else {
        fields.url = false;
        colorize(element, false)
    }
}
function checkPassword() {
    const regex = /^.{6,15}$/;
    const element = document.getElementById("passwordTextField");

    if (regex.test(element.value)) {
        fields.passowrd = true;
        colorize(element, true)
    } else {
        fields.password = false;
        colorize(element, false)
    }
}
function checkRetypePassword() {
    const element = document.getElementById("passwordRetypeTextField");
    const compareElement = document.getElementById("passwordTextField");
    const comparision = element.value === compareElement.value;

    if (comparision && fields.password === true) {
        colorize(element, true);
        fields.retypePassword = true;
    } else {
        colorize(element, false);
        fields.retypePassword = false;
    }
}

function colorize(element, valid) {
    if (valid) {
        element.style.borderBottomColor = "#1abc9c";
    } else {
        element.style.borderBottomColor = "red";
    }
}