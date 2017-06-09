// Dependencies
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const hash = require('sha256');
const auth = require("./auth.js");
const db = require("./db.js");
const inputValidator = require("./input_validation.js");
require('dotenv').config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

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

        // Create user query string
        let queryString = "INSERT INTO users (full_name, user_name, password, email, image_path, online) VALUES " +
            "(" + fullName + "," + username + "," + password + "," + email + "," + profilePicture + "," + 1 + ")";

        // To check if user is not already existing on database
        db.query("SELECT * FROM users WHERE user_name = " + username, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                if (results.length === 0) {
                    db.query(queryString, () => {
                        console.log("created user");
                        req.session.authenticated = true;
                        res.redirect("/chat_page");
                    })
                } else {
                    res.json({userCreated: false, message: "username already taken"});
                }
            }
        });
    } else {
        res.json({userCreated: false, message: "bad input"});
    }
});

app.get('/chat_page/chat_rooms', (req, res) => {
    if (req.session.authenticated === true) {
        const query = "SELECT chat_room.id, max_participants, chat_room.room_name, users.user_name AS admin from chat_room " +
            "INNER JOIN users ON chat_room.admin = users.id";
        db.query(query, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                res.send(results);
            }
        });
    } else {
        res.json({});
    }
});
app.listen(8080);
console.log(new Date + " Server listening on port 8080");
