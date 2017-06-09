// On document load
let content;
document.addEventListener('DOMContentLoaded', () => {
    content = JSON.parse(httpRequest("/chat_page/chat_rooms", "GET", null));
    console.log(content);
    if (Object.keys(content).length !== 0) {
        for (let i = 0; i < Object.keys(content).length; i++) {
            displayContent(content[i]);
        }
    } else {
        console.log("not authenticated hombre");
    }
});

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
    row.ondblclick = () => {
        // TODO: dialog to enter chat room
    };
    tableBody.appendChild(row);
}

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