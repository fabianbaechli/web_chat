let room_info = {};
let roomNumber = new URL(window.location.href).searchParams.get("room_number");
const ws = new WebSocket('ws://localhost:8080/chat_page/room', 'echo-protocol');

document.addEventListener('DOMContentLoaded', () => {
});

function sendMessage() {
    const message = "hello";
    console.log("sent message");
    ws.send(message);
}

ws.addEventListener("message", function(event) {
    console.log(event.data);
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