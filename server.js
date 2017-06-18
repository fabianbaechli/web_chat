// Dependencies
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const hash = require('sha256');
const auth = require("./auth.js");
const db = require("./db.js");
const inputValidator = require("./input_validation.js");
const websocket = require('express-ws')(app);
require('dotenv').config();
let count = 0;
let clients = {};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.ws('/chat_page/room', function(ws, req) {
    ws.on('message', function(msg) {
        console.log(msg);
    });
    console.log(ws);
});

// All files in the frontend folder are available without a cookie
app.use(express.static('frontend'));

// Handles authentication
app.use(auth.router);

app.post("/createUser", (req, res) => {
    // Input validation
    if ((inputValidator.validateFullName(req.body.fullName)) &&
        (inputValidator.validateUsername(req.body.username)) &&
        (inputValidator.validatePassword(req.body.password)) &&
        (inputValidator.validateRetypedPassword(req.body.password, req.body.retypePassword)) &&
        (inputValidator.validateEmail(req.body.email)) &&
        (inputValidator.validateURL(req.body.image))) {
        console.log("all good with input");

        // Prevents sql injections
        const fullName = db.escape(req.body.fullName);
        const email = db.escape(req.body.email);
        const username = db.escape(req.body.username);
        const profilePicture = db.escape(req.body.image);
        let password = hash.x2(req.body.password);
        password = db.escape(password);

        searchUser(username, (results) => {
            if (results.length === 0) {
                createUser(fullName, username, password, email, profilePicture, (results) => {
                    console.log("created user");
                    req.session.authenticated = true;
                    req.session.username = username;
                    req.session.userId = results.insertId;
                    res.redirect("/chat_page");
                });
            } else {
                res.json({userCreated: false, message: "username already taken"});
            }
        });
    } else {
        res.json({userCreated: false, message: "bad input"});
    }
});

app.get("/chat_page/user_info", (req, res) => {
    res.json({
        username: req.session.username,
        user_id: req.session.userId,
        authenticated: req.session.authenticated
    })
});

app.post("/chat_page/create_room_session", (req, res) => {
    if (req.session.authenticated === true) {
        const roomId = db.escape(req.body.id);
        const userId = req.session.userId;
        let password = hash.x2(req.body.password);

        getChatSession(userId, roomId, (results) => {
            if (results.length !== 1) {
                getRoomPassword(roomId, (room_password) => {
                    if (room_password === password) {
                        createChatSession(req.session.userId, roomId, (results) => {
                            res.send({joined_room: true});
                        });
                    } else {
                        res.json({joined_room: false})
                    }
                });
            } else {
                res.json({joined_room: true});
            }
        })
    } else {
        res.json({authenticated: false})
    }
});

app.get("/chat_page/chat_content", (req, res) => {
    const roomId = req.query.room_number;
    const userId = req.session.userId;

    if (userId === undefined) {
        res.json({authenticated: false});
    } else if (roomId === undefined) {
        res.send("missing room_number parameter in link");
    } else {
        getChatSession(userId, roomId, (results) => {
            if (results.length <= 0) {
                res.json({joined_room: false})
            } else {
                // the user has a chat session on the server
                getUsersInChatRoom(roomId, (results) => {
                    console.log("user: " + userId + " joined room " + roomId);
                    res.json({joined_room: true, results});
                })
            }
        })
    }
});

app.post("/chat_page/create_chat_room", (req, res) => {
    if ((inputValidator.validateRoomName(req.body.roomName)) &&
        (inputValidator.validateMaxParticipants(req.body.maxParticipants)) &&
        (inputValidator.validatePassword(req.body.password)) &&
        (inputValidator.validateRetypedPassword(req.body.password, req.body.retypePassword))) {

        if (req.session.authenticated === true) {
            const userId = req.session.userId;
            const roomName = db.escape(req.body.roomName);
            const maxParticipants = Number(req.body.maxParticipants);
            let password = hash.x2(req.body.password);
            password = db.escape(password);

            createChatRoom(maxParticipants, userId, password, roomName, (results) => {
                createChatSession(userId, results.insertId, (results) => {
                    res.redirect("/chat_page/");
                });
            });
        } else {
            res.json({user_authenticated: false})
        }
    } else {
        res.json({input_valid: false})
    }
});

app.get('/chat_page/chat_rooms', (req, res) => {
    if (req.session.authenticated === true) {
        getAllChatRooms((results) => res.send(results));
    } else {
        res.json({});
    }
});

app.listen(8080);
console.log(new Date + " Server listening on port 8080");

// DB queries
function createChatRoom(maxParticipants, userId, password, roomName, callback) {
    const queryString = "INSERT INTO chat_room (max_participants, admin, password, room_name) VALUES " +
        "(" + maxParticipants + "," + userId + "," + password + "," + roomName + ")";

    db.query(queryString, (error, results) => {
        if (error) console.log(error);
        else callback(results);
    });
}
function getUsersInChatRoom(roomId, callback) {
    const queryString = "SELECT user.`user_name` FROM users_chatrooms AS temp_table " +
        "INNER JOIN users as user ON temp_table.`user_fk` = user.`id` " +
        "INNER JOIN chat_room as room ON temp_table.`chat_room_fk` = room.`id` " +
        "WHERE room.id = " + db.escape(roomId);

    db.query(queryString, (error, results) => {
        if (error) console.log(error);
        else callback(results)
    })
}
function getChatSession(userId, roomId, callback) {
    const queryString = "SELECT * from users_chatrooms WHERE user_fk = " + db.escape(userId) + " AND chat_room_fk = " +
        roomId;
    db.query(queryString, (error, results) => {
        if (error) console.log(error);
        else callback(results);
    });
}
function getRoomPassword(roomId, callback) {
    const queryString = "SELECT password FROM chat_room WHERE id = " + roomId + "";
    db.query(queryString, (error, results) => {
        if (error) console.log(error);
        else callback(results[0].password);
    });
}
function getAllChatRooms(callback) {
    const queryString = "SELECT chat_room.id, max_participants, chat_room.room_name, users.user_name AS admin from chat_room " +
        "INNER JOIN users ON chat_room.admin = users.id";

    db.query(queryString, (error, results) => {
        if (error) console.log(error);
        else callback(results);
    });
}
function createChatSession(user_fk, chat_room_fk, callback) {
    const queryString = "INSERT INTO users_chatrooms (user_fk, chat_room_fk) VALUES " +
        "(" + user_fk + "," + chat_room_fk + ")";
    db.query(queryString, (error, results) => {
        if (error) console.log(error);
        else callback(results);
    });
}
function searchUser(username, callback) {
    const queryString = "SELECT * FROM users WHERE user_name = " + username;
    db.query(queryString, (error, results) => {
        if (error) console.log(error);
        else callback(results);
    });
}
function createUser(fullName, username, password, email, profilePicture, callback) {
    let queryString = "INSERT INTO users (full_name, user_name, password, email, image_path, online) VALUES " +
        "(" + fullName + "," + username + "," + password + "," + email + "," + profilePicture + "," + 1 + ")";
    db.query(queryString, (error, results) => {
        if (error) console.log(error);
        else callback(results);
    });
}