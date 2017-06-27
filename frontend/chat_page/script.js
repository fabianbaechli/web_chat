const fields = {roomName: false, maxParticipants: false, roomPassword: false, retypePassword: false};

// On document load
let content;
let userInfo;

document.addEventListener('DOMContentLoaded', () => {
    validateMaxParticipants();
    validatePassword();
    validateRetypedPassword();
    validateRoomName();
    userInfo = JSON.parse(httpRequest("/chat_page/user_info", "GET", null));
    content = JSON.parse(httpRequest("/chat_page/chat_rooms", "GET", null));
    console.log(userInfo);
    console.log(content);
    if (userInfo.authenticated) {
        document.getElementById("connectedAs").innerHTML = "Logged in as: " + userInfo.username;
        for (let i = 0; i < Object.keys(content).length; i++) {
            displayContent(content[i]);
        }
    } else {
        document.getElementById("connectedAs").innerHTML = "Not Authenticated";
        console.log("not authenticated hombre");
    }
});

function checkForm() {
    for (let key in fields) {
        if (fields[key] === false) {
            window.alert(key + " not properly set");
            return false;
        }
    }
}

function joinChat(id, password) {
    const http = new XMLHttpRequest();
    const url = "http://localhost:8080/chat_page/join_room";
    const params = "id=" + id + "&password=" + password;
    http.open("POST", url, true);

    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            window.location.href = "http://localhost:8080/chat_page/room?id=" + id;
        }
    };
    http.send(params);
}

function toggle_visibility(id) {
    const e = document.getElementById(id);
    if (e.style.display === 'block') {
        e.style.display = 'none';
    }
    else {
        e.style.display = 'block';
    }
}

function displayContent(content) {
    const tableBody = document.getElementById("tableBody");
    const row = document.createElement("tr");
    const cells = new Array(3);

    for (let i = 0; i < 4; i++) {
        cells[i] = document.createElement("td");
    }

    const values = {
        0: content.id,
        1: content.room_name,
        2: content.admin,
        3: content.max_participants
    };

    for (let i = 0; i < cells.length; i++) {
        cells[i].appendChild(document.createTextNode(values[i]));
    }
    for (let i = 0; i < cells.length; i++) {
        row.appendChild(cells[i])
    }
    row.style.backgroundColor = "#B0BEC5";
    row.className = "entry";

    row.onclick = () => {
        toggle_visibility('joinChatPopUp');
        let submitButton = document.getElementById("joinChatButton");

        submitButton.onclick = () => {
            console.log(document.getElementById("passwordField").value);
            const passwordValue = document.getElementById("passwordField").value;
            joinChat(row.firstChild.innerText, passwordValue);
        }
    };

    tableBody.appendChild(row);
}
// TODO: sort after function
// Forms a HTTP request
function httpRequest(path, method, params) {
    const xmlHttp = new XMLHttpRequest();
    if (params !== null)
        xmlHttp.open(method, path + params, true);
    else
        xmlHttp.open(method, path, false);
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

function validateRoomName() {
    const regex = /^.{2,20}$/;
    const element = document.getElementById("roomNameTextField");

    if (regex.test(element.value)) {
        fields.roomName = true;
        colorize(element, true)
    } else {
        fields.roomName = false;
        colorize(element, false)
    }
}

function validateMaxParticipants() {
    const element = document.getElementById("maxParticipantsNumField");
    if (element.value < 5000 && element.value > 0) {
        fields.maxParticipants = true;
        colorize(element, true)
    } else {
        fields.maxParticipants = false;
        colorize(element, false)
    }
}

function validatePassword() {
    const regex = /^.{6,15}$/;
    const element = document.getElementById("passwordTextField");

    if (regex.test(element.value)) {
        fields.roomPassword = true;
        colorize(element, true)
    } else {
        fields.roomPassword = false;
        colorize(element, false)
    }
}

function validateRetypedPassword() {
    const element = document.getElementById("passwordRetypeTextField");
    const compareElement = document.getElementById("passwordTextField");
    const comparision = element.value === compareElement.value;

    if (comparision && fields.roomPassword === true) {
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