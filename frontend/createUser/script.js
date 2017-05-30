var fields = {fullName: false, email: false, username: false, password: false, retypePassword: false};
function checkFormAndSubmit() {
    for (var i = 0; i < fields.size; i++) {
        if (fields[i] === false) {
            window.alert("")
        }
    }
}

function checkName() {
    var regex = /^[a-zA-Z ]{2,30}$/;
    var element = document.getElementById("fullNameTextField");

    if (!regex.test(element.value)) {
        element.style.borderBottomColor = "red";
        fields.fullName = false;
    } else {
        element.style.borderBottomColor = "#1abc9c";
        fields.fullName = true;
    }
    function checkEmail() {

    }
    function checkUsername() {

    }
    function checkPassword() {

    }
    function checkRetypePassword() {

    }
}