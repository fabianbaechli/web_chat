var validator = module.exports;
validator.validateFullName = function (fullName) {
    var regex = /^[a-zA-Z ]{2,30}$/;
    console.log(fullName);
    return regex.test(fullName);
};
validator.validateUsername = function (username) {
    var regex = /^.{2,20}$/;
    console.log(username);
    return regex.test(username);
};
validator.validateEmail = function (email) {
    var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    console.log(email);
    return regex.test(email);
};
validator.validatePassword = function (password) {
    var regex = /^.{6,15}$/;
    regex.test(password);
};
validator.validateRetypedPassword = function (password, passwordRetype) {
    return password === passwordRetype;
};
validator.validateURL = function (url) {
    console.log(url);
    var regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)/;
    return regex.test(url);
};