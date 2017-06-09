// Dependencies
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var app = express();
var hash = require('sha256');
var auth = require("./auth.js");
var db = require("./db.js");
var inputValidator = require("./input_validation.js");
require('dotenv').config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// All files in the frontend folder are available without a cookie
app.use(express.static('frontend'));

// Handles authentication
app.use(auth.router);

app.post("/createUser", function (req, res) {
    // Input validation
    if ((inputValidator.validateFullName(req.body.fullName)) &&
        (inputValidator.validateUsername(req.body.username)) &&
        (inputValidator.validatePassword(req.body.password)) &&
        (inputValidator.validateRetypedPassword(req.body.password, req.body.retypePassword)) &&
        (inputValidator.validateEmail(req.body.email)) &&
        (inputValidator.validateURL(req.body.image))) {
        console.log("all good with input");

        // Prevents sql injections
        var fullName = db.escape(req.body.fullName);
        var email = db.escape(req.body.email);
        var username = db.escape(req.body.username);
        var profilePicture = db.escape(req.body.image);
        var password = hash.x2(req.body.password);
        password = db.escape(password);

        // Create user query string
        var queryString = "INSERT INTO users (full_name, user_name, password, email, image_path, online) VALUES " +
            "(" + fullName + "," + username + "," + password + "," + email + "," + profilePicture + "," + 1 + ")";

        // To check if user is not already existing on database
        db.query("SELECT * FROM users WHERE user_name = " + username, function (error, results) {
            if (error) {
                console.log(error);
            } else {
                if (results.length === 0) {
                    db.query(queryString, function () {
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

    console.log(queryString);
});

app.get('/chat_page/chat_rooms', function (req, res) {
    if (req.session.authenticated === true) {
        var query = "SELECT chat_room.id, max_participants, chat_room.password, users.user_name AS admin from chat_room" +
            "INNER JOIN users ON chat_room.admin = users.id";
        db.query(query, function (error, results) {
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
