let id = new URL(window.location.href).searchParams.get("id");
let roomInformation = {};
let roomParticipants = {};
let userId;

let protocol = "ws://";
const ws = new WebSocket(protocol + window.location.host + '/chat_page/room?id=' + id, 'echo-protocol');

ws.onopen = function () {
    console.log("ws open")
    httpRequest("/chat_page/room/users_in_room?id=" + id, "GET", (response) => {
        console.log("requested users in room")
        try {
            roomInformation = JSON.parse(response);
        } catch (e) {
            console.log(e)
        }
        console.log(roomInformation)
        if (roomInformation.authenticated === false) {
            console.log("not authenticated")
        } else if (roomInformation.inRoom === false) {
            console.log("not in room")
        } else {
            document.getElementById("connectionState").innerHTML = "Connected as: " + roomInformation.username;
            userId = roomInformation.userId;
            roomParticipants = roomInformation.users;
            displayUsers(roomParticipants)
        }
    });
};

document.addEventListener('input', (event) => {
    if (document.getElementById("inputArea") === document.activeElement) {
        if (event.code === "Enter") {
            event.preventDefault();
            sendMessage();
        } else {
            let textarea = document.getElementById("inputArea");
            let heightLimit = 100;
            textarea.style.height = 0;
            textarea.style.height = Math.min(textarea.scrollHeight, heightLimit) + "%";
        }
    }
});

function displayUsers(participants) {
    for (let i = 0; i < participants.length; i++) {
        let displayImage = document.createElement("img");
        displayImage.src = participants[i].image;
        displayImage.className = "userImage";

        let displayUsername = document.createElement("P");
        displayUsername.appendChild(document.createTextNode(participants[i].username));
        displayUsername.className = "userName";

        let container = document.createElement("div");
        container.className = "imageTextPair";
        container.appendChild(displayUsername);
        container.appendChild(displayImage);

        document.getElementsByClassName("userDisplay")[0].appendChild(container);
    }
}

function sendMessage() {
    let textInput = document.getElementById("inputArea");
    const message = textInput.value;
    textInput.value = "";
    console.log("sent message: " + message);
    ws.send(message);
}

function displayMessage(message, senderId, senderName) {
    console.log("received message: " + message);
    const table = document.getElementById("table");
    const row = document.createElement("li");
    const senderInfo = document.createElement("P");
    let date = new Date();
    const currentTime = ("0" + date.getHours().toString()).slice(-2) + ":" +
        ("0" + date.getMinutes().toString()).slice(-2) + ":" +
        ("0" + date.getSeconds().toString()).slice(-2);

    if (senderId === userId) {
        row.className = "own";
        senderInfo.appendChild(document.createTextNode("You: " + currentTime));
    } else {
        row.className = "other";
        senderInfo.appendChild(document.createTextNode(senderName + ": " + currentTime));
    }

    let paragraph = document.createElement("P");
    paragraph.className = "message_content";
    senderInfo.className = "senderInfo";
    const text = document.createTextNode(message);
    paragraph.appendChild(text);
    row.appendChild(paragraph);
    row.appendChild(senderInfo);

    table.appendChild(row);
    table.scrollTop = table.scrollHeight;
}

ws.addEventListener("message", function (event) {
    const message = JSON.parse(event.data);
    const senderId = message.senderId;
    const text = message.text;
    const senderName = message.senderName;
    displayMessage(text, senderId, senderName)
});

function httpRequest(path, method, callback) {
    const http = new XMLHttpRequest();
    http.open(method, path, true);
    http.send(null);
    http.onload = () => {
        if (http.responseText.length > 0) {
            callback(http.responseText);
        }
    };
}