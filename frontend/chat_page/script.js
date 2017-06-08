// On document load
var content;
document.addEventListener('DOMContentLoaded', function () {
    content = JSON.parse(httpRequest("/chat_page/chat_rooms", "GET", null));
    console.log(content);
    if (Object.keys(content).length !== 0) {
        console.log("authenticated mydude");
    } else {
        console.log("not authenticated hombre");
    }
});

function displayContent(content) {
    var tableBody = document.getElementById("tableBody");
    var row = document.createElement("tr");
    var cells = new Array(3);

    for (var i = 0; i < 3; i++) {
        cells[i] = document.createElement("td");
    }
    var values = {
        0: content.name_lieferant,
        1: content.art_nr,
        2: content.beschreibung,
    };

    for (i = 0; i < cells.length; i++) {
        cells[i].appendChild(document.createTextNode(values[i]));
    }
    for (i = 0; i < cells.length; i++) {
        row.appendChild(cells[i])
    }

    row.ondblclick = function () {
        // TODO: dialog to create chat room
    };
    tableBody.appendChild(row);
}

// Forms a HTTP request
function httpRequest(path, method, params) {
    var xmlHttp = new XMLHttpRequest();
    var synchronous;
    switch (method) {
        case "GET"  :
            (synchronous = false);
            break;
        case "POST" :
            (synchronous = true);
            break;
        default     :
            (synchronous = null);
            break;
    }
    if (params !== null)
        xmlHttp.open(method, path + params, synchronous);
    else
        xmlHttp.open(method, path, synchronous);
    xmlHttp.send(null);
    return xmlHttp.responseText;
}