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
    colorize(regex, element, "fullName");
}
function checkEmail() {
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const element = document.getElementById("emailTextField");
    colorize(regex, element, "email");
}
function checkUsername() {
    const regex = /^.{2,20}$/;
    const element = document.getElementById("usernameTextField");
    colorize(regex, element, "username");
}

function checkURL() {
    const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)/;
    const element = document.getElementById("imagePathTextField");
    colorize(regex, element, "url");
}
function checkPassword() {
    const regex = /^.{6,15}$/;
    const element = document.getElementById("passwordTextField");
    colorize(regex, element, "password");
}
function checkRetypePassword() {
    const element = document.getElementById("passwordRetypeTextField");
    const compareElement = document.getElementById("passwordTextField");
    const comparision = element.value === compareElement.value;

    if (comparision && fields.password === true) {
        document.getElementById("passwordRetypeTextField").style.borderBottomColor = "#1abc9c";
        fields.retypePassword = true;
    } else {
        document.getElementById("passwordRetypeTextField").style.borderBottomColor = "red";
        fields.retypePassword = false;
    }
}
function colorize(regex, htmlElement, elementInFieldsList) {
    if (!regex.test(htmlElement.value)) {
        htmlElement.style.borderBottomColor = "red";
        fields[elementInFieldsList] = false;
    } else {
        htmlElement.style.borderBottomColor = "#1abc9c";
        fields[elementInFieldsList] = true;
    }
}