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
// contains objects in this form {useId: <value>, chatroom: <value>}
let pendingConnections = [];
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

// ROUTES
app.post("/createUser", (req, res) => {
  // Input validation
  if ((inputValidator.validateFullName(req.body.fullName)) &&
    (inputValidator.validateUsername(req.body.username)) &&
    (inputValidator.validatePassword(req.body.password)) &&
    (inputValidator.validateRetypedPassword(req.body.password, req.body.retypePassword)) &&
    (inputValidator.validateEmail(req.body.email)) &&
    (inputValidator.validateURL(req.body.image))) {

    // Prevents sql injections
    const fullName = req.body.fullName;
    const email = req.body.email;
    const username = req.body.username;
    const profilePicture = req.body.image;
    let password = hash.x2(req.body.password);

    searchUser(username, (results) => {
      if (results.length === 0) {
        createUser(fullName, username, password, email, profilePicture, (results) => {
          console.log("created user");
          req.session.authenticated = true;
          req.session.username = username;
          req.session.userId = results.insertId;
          getAllUsers((results) => {
            users = results;
          });
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
      const roomName = req.body.roomName;
      const maxParticipants = Number(req.body.maxParticipants);
      let password = hash.x2(req.body.password);

      createChatRoom(maxParticipants, userId, password, roomName, () => {
        res.redirect("/chat_page/");
        getAllChatRooms((results) => {
          chatrooms = results;
          chatrooms.map((room) => {
            room.participants = [];
          });
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

app.post("/chat_page/join_room", (req, res) => {
  if (req.session.authenticated === true) {
    const userId = req.session.userId;
    const roomId = parseInt(req.body.id);
    const password = hash.x2(req.body.password);

    getRoomPassword(roomId, (room_password) => {
      if (room_password === password) {
        chatrooms.forEach((item) => {
          if (item.id === roomId) {
            checkIfUserHasPendingConnection(roomId, userId, (alreadyHasPendingConnection) => {
              if (alreadyHasPendingConnection === false) {
                console.log("user: " + userId + " joined room " + roomId);
                pendingConnections.push({userId: userId, roomId: roomId});
                res.json({joined_room: true});
              } else {
                console.log("already has pending connection");
                res.json({joined_room: true});
              }
            })
          }
        })
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

    getAllUsersInRoom(roomId, (users) => {
      let response = [];
      users.forEach((user) => {
        response.push({
          username: findUsername(user.userId),
          userId: user.userId,
          image: user.image
        })
      });
      res.send({users: response, userId: userId, username: findUsername(userId)});
    });
  } else {
    res.json({authenticated: false})
  }
});

app.ws('/chat_page/room', (ws, req) => {
  if (req.session.authenticated === true) {
    const roomId = parseInt(req.query.id);
    const userId = req.session.userId;

    // Opens up a web socket connection if the user is in the pending connections array
    // If his id is found in the array, he gets deleted from pending connections
    // And added to the room.participants array in the from: {userId:<userId>, ws:<newly created ws connection>}
    getRoom(roomId, (room) => {
      checkIfUserIsInRoom(roomId, userId, (isInRoom) => {
        if (isInRoom === false) {
          for (let i = 0; i < pendingConnections.length; i++) {
            if (pendingConnections[i].userId === userId &&
              pendingConnections[i].roomId === roomId) {
              room.participants.push({userId: userId, ws: ws});
              pendingConnections.splice(i, 1);
            }
          }
        }
      })
    });

    // Figures out for which chatroom the message was
    // Loops through all the users from that chatroom and sends the message to the ws object
    ws.on('message', (msg) => {
      getRoom(roomId, (room) => {
        console.log("message: " + msg + " for room: " + room.id);
        room.participants.forEach((user) => {
          console.log("\t to user: " + user.userId);
          try {
            if (user.ws !== undefined) {
              user.ws.send(JSON.stringify({
                text: msg,
                senderId: userId,
                senderName: findUsername(userId)
              }));
            }
          } catch (e) {
            console.log("user: " + user.userId + " not available");
          }
        });
      });
    });

    // Deletes the user from the room.participants array
    // Puts the user in the pendingConnections array
    // So that if he reopens the tab he gets reconnected
    ws.on('close', () => {
      getRoom(roomId, (room) => {
        for (let i = 0; i < room.participants.length; i++) {
          if (room.participants[i].userId === userId) {
            room.participants.splice(i, 1);
            checkIfUserHasPendingConnection(roomId, userId, (alreadyHasPendingConnection) => {
              if (alreadyHasPendingConnection === false) {
                pendingConnections.push({userId: userId, roomId: roomId});
              }
            })
          }
        }
      });
    });
  }
});

// HELPER FUNCTIONS
function getAllUsersInRoom(roomId, callback) {
  getRoom(roomId, (room) => {
    let response = [];
    room.participants.forEach((participant) => {
      users.forEach((user) => {
        if (user.userId === participant.userId) {
          response.push(user);
        }
      })
    });
    callback(response);
  });
}
function checkIfUserIsInRoom(roomId, userId, callback) {
  getRoom(roomId, (roomToCheck) => {
    // Iterates over all users in correct chat room
    let isInRoom = false;
    for (let i = 0; i < roomToCheck.participants.length; i++) {
      // The user is in the room
      if (roomToCheck.participants[i].userId === userId) {
        isInRoom = true;
        callback(isInRoom)
      }
    }
    callback(isInRoom)
  });
}
function checkIfUserHasPendingConnection(roomId, userId, callback) {
  let alreadyHasPendingConnection = false;
  // Checks if the user already has a pending connection
  for (let i = 0; i < pendingConnections.length; i++) {
    if (pendingConnections[i].userId === userId &&
      pendingConnections[i].roomId === roomId) {

      alreadyHasPendingConnection = true;
    }
  }
  callback(alreadyHasPendingConnection)
}
function getRoom(roomId, callback) {
  // Iterates over all chat rooms
  for (let i = 0; i < chatrooms.length; i++) {
    if (chatrooms[i].id === roomId) {
      callback(chatrooms[i]);
    }
  }
}
function findUsername(id) {
  for (let i = 0; i < users.length; i++) {
    if (users[i].userId === id) {
      return users[i].name;
    }
  }
}

// DB queries
function getAllUsers(callback) {
  const queryString = "select id as userId, user_name as name, image_path as image from users";

  db.query(queryString, (error, results) => {
    if (error) console.log(error);
    else callback(results);
  });
}
function createChatRoom(maxParticipants, userId, password, roomName, callback) {
  const queryString = "INSERT INTO chat_room (max_participants, admin, password, room_name) VALUES " +
    "(" + db.escape(maxParticipants) + "," + db.escape(userId) + "," + db.escape(password) + "," + db.escape(roomName) + ")";

  db.query(queryString, (error, results) => {
    if (error) console.log(error);
    else callback(results);
  });
}
function getRoomPassword(roomId, callback) {
  const queryString = "SELECT password FROM chat_room WHERE id = " + db.escape(roomId) + "";
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
  const queryString = "SELECT * FROM users WHERE user_name = " + db.escape(username);
  db.query(queryString, (error, results) => {
    if (error) console.log(error);
    else callback(results);
  });
}
function createUser(fullName, username, password, email, profilePicture, callback) {
  let queryString = "INSERT INTO users (full_name, user_name, password, email, image_path, online) VALUES " +
    "(" + db.escape(fullName) + "," + db.escape(username) + "," + db.escape(password) + "," + db.escape(email) + "," +
    db.escape(profilePicture) + "," + 1 + ")";
  db.query(queryString, (error, results) => {
    if (error) console.log(error);
    else callback(results);
  });
}

app.listen(8080);
console.log(new Date + " Server listening on port 8080");
