let roomParticipants = {};
let id = new URL(window.location.href).searchParams.get("id");

chatInfo = JSON.parse(httpRequest("/chat_page/room/info?id=" + id, "GET", (response) => {
    try {
        roomParticipants = JSON.parse(response)
        console.log(roomParticipants)
    } catch (e) {
        console.log("Server is broken boiii");
    }
}));

const ws = new WebSocket('ws://localhost:8080/chat_page/room?id=' + id, 'echo-protocol');

document.addEventListener('DOMContentLoaded', () => {
});

function sendMessage() {
    const message = "hello";
    console.log("sent message");
    ws.send(message);
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