// Dependencies
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const hash = require('sha256');
const auth = require("./auth.js");
const db = require("./db.js");
const inputValidator = require("./input_validation.js");
const ws = require('express-ws')(app);
let chatrooms;
let users;
require('dotenv').config();

getAllUsers((results) => {
    users = results;
});

getAllChatRooms((results) => {
    chatrooms = results;
    chatrooms.map((room) => {
        room.participants = [];
    });
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Handles authentication
app.use(auth.router);

// All files in the frontend folder are available without a cookie
app.use(express.static('frontend'));

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
                res.redirect("/chat_page/");
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

app.post("/chat_page/join_room", (req, res) => {
    if (req.session.authenticated === true) {
        const userId = req.session.userId;
        const roomId = parseInt(req.body.id);
        const password = hash.x2(req.body.password);

        getRoomPassword(roomId, (room_password) => {
            if (room_password === password) {
                for (let i = 0; i < chatrooms.length; i++) {
                    if (chatrooms[i].id === roomId) {
                        console.log("user: " + userId + " joined room " + roomId);
                        chatrooms[i].participants.push({userId: userId});
                        res.json({joined_room: true});
                    }
                }
            }
        });

    } else {
        res.json({user_authenticated: false})
    }
});

app.get("/chat_page/room/users_in_room", (req, res) => {
    if (req.session.authenticated === true) {
        const roomId = parseInt(req.query.id);
        const userId = req.session.userId;

        checkIfUserIsInRoom(roomId, userId, (isInRoom) => {
            if (isInRoom) {
                getAllUsersInRoom(roomId, (users) => res.send(users));
            } else {
                res.json({inRoom: false});
            }
        });
    } else {
        res.json({authenticated: false})
    }
});

function getAllUsersInRoom(roomId, callback) {
    getRoom(roomId, (room) => {
        let response = [];
        for (let i = 0; i < room.participants.length; i++) {
            for (let y = 0; y < users.length; y++) {
                if (users[y].id === room.participants[i].userId) {
                    response.push(users[y])
                }
            }
        }
        callback(response);
    });
}

function checkIfUserIsInRoom(roomId, userId, callback) {
    getRoom(roomId, (roomToCheck) => {
        let isInRoom = false;
        // Iterates over all users in correct chat room
        for (let y = 0; y < roomToCheck.participants.length; y++) {
            // The user is in the room
            if (roomToCheck.participants[y].userId === userId) {
                isInRoom = true;
            }
        }
        callback(isInRoom);
    });
}
function getRoom(roomId, callback) {
    // Iterates over all chat rooms
    for (let i = 0; i < chatrooms.length; i++) {
        if (chatrooms[i].id === roomId) {
            callback(chatrooms[i]);
        }
    }
}

app.ws('/chat_page/room', function (ws, req) {
    if (req.session.authenticated === true) {
        const roomId = parseInt(req.query.id);
        const userId = req.session.userId;

        for (let i = 0; i < chatrooms.length; i++) {
            if (chatrooms[i].id === roomId) {
                for (let y = 0; y < chatrooms[i].participants.length; y++) {
                    if (chatrooms[i].participants[y].id === userId) {
                        chatrooms[i].participants[y] = {userId: userId, ws: ws};
                    }
                }
            }
        }

        ws.on('message', function (msg) {
            for (let i = 0; i < chatrooms.length; i++) {
                if (chatrooms[i].id === roomId) {
                    console.log("message: " + msg + " for room: " + roomId);
                    for (let y = 0; y < chatrooms[i].participants.length; y++) {
                        console.log("message for user: " + chatrooms[i].participants[y].userId);
                        try {
                            chatrooms[i].participants[y].ws.send(msg);
                        } catch (e) {
                            console.log("user: " + chatrooms[i].participants[y].userId + " not available");
                        }
                    }
                }
            }
        });
    }
});

function findUsername(id) {
    for (let i = 0; i < users.length; i++) {
        if (users[i].id === id) {
            return users[i].name;
        }
    }
}

app.listen(8080);
console.log(new Date + " Server listening on port 8080");

// DB queries
function getAllUsers(callback) {
    const queryString = "select id, user_name as name from users";

    db.query(queryString, (error, results) => {
        if (error) console.log(error);
        else callback(results);
    });
}
function createChatRoom(maxParticipants, userId, password, roomName, callback) {
    const queryString = "INSERT INTO chat_room (max_participants, admin, password, room_name) VALUES " +
        "(" + maxParticipants + "," + userId + "," + password + "," + roomName + ")";

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