let room_info = {};
let roomNumber = new URL(window.location.href).searchParams.get("room_number");

document.addEventListener('DOMContentLoaded', () => {
    httpRequest("/chat_page/chat_content?room_number=" + roomNumber, "GET", (response) => {
        room_info = JSON.parse(response);
        if (room_info.authenticated === false) {
            window.location.replace("http://localhost:8080/");
        } else {
            if (room_info.joined_room === false) {
                // will replace with password input html page eventually
                window.location.replace("http://localhost:8080/chat_page");
            } else if (room_info.joined_room === true) {
                console.log(room_info)
            }
        }
    })
});

function httpRequest(path, method, callback) {
    const http = new XMLHttpRequest();
    http.open(method, path, true);
    http.send(null);
    http.onreadystatechange = () => {
        callback(http.responseText);
    };
    return http.responseText;
}