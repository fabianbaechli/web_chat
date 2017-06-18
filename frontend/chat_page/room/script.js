let room_info = {};
let roomNumber = new URL(window.location.href).searchParams.get("room_number");
const ws = new WebSocket('ws://localhost:8080/chat_page/room', 'echo-protocol');

document.addEventListener('DOMContentLoaded', () => {
    httpRequest("/chat_page/chat_content?room_number=" + roomNumber, "GET", (response) => {
        console.log("RESPONSE: " + response);
        room_info = JSON.parse(response);
        if (room_info.authenticated === false) {
            window.location.replace("http://localhost:8080/");
        } else {
            if (room_info.joined_room === false) {
                // will replace with password input html page eventually
                window.location.replace("http://localhost:8080/chat_page");
            } else if (room_info.joined_room === true) {

            }
        }
    })
});

function sendMessage() {
    const message = "hello";
    ws.send(message);
}
ws.addEventListener("message", function(e) {
    // The data is simply the message that we're sending back
    const msg = e.data;

    // Append the message
    console.log(msg);
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
    return http.responseText;
}