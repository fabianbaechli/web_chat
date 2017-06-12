const validator = module.exports;
validator.validateFullName = fullName => {
    const regex = /^[a-zA-Z ]{2,30}$/;
    return regex.test(fullName);
};
validator.validateUsername = username => {
    const regex = /^.{2,20}$/;
    return regex.test(username);
};
validator.validateEmail = email => {
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(email);
};
validator.validatePassword = password => {
    const regex = /^.{6,15}$/;
    return regex.test(password);
};
validator.validateRetypedPassword = (password, passwordRetype) => password === passwordRetype;
validator.validateMaxParticipants = maxParticipants => (Number(maxParticipants) > 0 && Number(maxParticipants) < 5000);
validator.validateURL = url => {
    const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)/;
    return regex.test(url);
};

validator.validateRoomName = roomName => {
    const regex = /^.{2,20}$/;
    return regex.test(roomName);
};