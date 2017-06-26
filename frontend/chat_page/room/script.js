let roomParticipants = {};
let id = new URL(window.location.href).searchParams.get("id");
const ws = new WebSocket('ws://localhost:8080/chat_page/room?id=' + id, 'echo-protocol');

document.addEventListener('keyup', (event) => {
    if (event.code === "Enter") {
        if (document.getElementById("inputArea") === document.activeElement) {
            event.preventDefault();
            sendMessage();
        }
    }
});

httpRequest("/chat_page/room/users_in_room?id=" + id, "GET", (response) => {
    try {
        roomParticipants = JSON.parse(response);
        if (roomParticipants.authenticated === false) {
            console.log("not authenticated")
        } else if (roomParticipants.inRoom === false) {
            console.log("not in room")
        } else {

        }
    } catch (e) {
        console.log("Server is broken boiii");
    }
});

function sendMessage() {
    let textInput = document.getElementById("inputArea");
    const message = textInput.value;
    textInput.value = "";
    console.log("sent message: " + message);
    ws.send(message);
    const table = document.getElementById("table");
    const row = document.createElement("li");
    row.className = "own";

    let paragraph = document.createElement("P");
    paragraph.className = "message_content";
    const text = document.createTextNode(message);
    paragraph.appendChild(text);
    row.appendChild(paragraph);

    table.appendChild(row);

}

ws.addEventListener("message", function (event) {
    console.log("received data: " + event.data);
});

function httpRequest(path, method, callback) {
    const http = new XMLHttpRequest();
    http.open(method, path, true);
    http.send(null);
    http.onreadystatechange = () => {
        if (http.responseText.length > 0) {
            callback(http.responseText);
        }
    };
}