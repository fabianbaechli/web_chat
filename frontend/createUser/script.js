function checkFormAndSubmit() {
    var fullName = document.getElementById("fullNameTextField").value;
    var email = document.getElementbyId("emailTextField").value;
    var username = document.getElementById("usernameTextField").value;
    var password = document.getElementbyId("passwordTextField").value;
    var retypePassword = document.getElementbyId("passwordRetypeTextField").value;

}

function checkName() {
    var regex = /^[a-zA-Z ]{2,30}$/;
    var element = document.getElementById("fullNameTextField");

    if (!regex.test(element.value)) {
        element.style.borderBottomColor = "red";
    } else {
    }
}