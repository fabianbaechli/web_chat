// Dependencies
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var app = express();
var hash = require('sha256');
var auth = require("./auth.js");
var db = require("./db.js");
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
    var fullName = db.escape(req.body.fullName);
    var email = db.escape(req.body.email);
    var username = db.escape(req.body.username);
    var password = hash.x2(req.body.password);
    password = db.escape(password);

    var queryString = "INSERT INTO users (full_name, user_name, password, email) VALUES " +
        "(" + fullName + "," + username + "," + password + "," + email + ")";

    db.query("SELECT * FROM users WHERE user_name = " + username, function (error, results) {
        console.log("test");
        if (error) {
            console.log(error);
        } else {
            if (results.length === 0) {
                db.query(queryString, function () {
                    console.log("created user");
                    res.json({userCreated: true});
                })
            } else {
                res.json({userCreated: false, message: "username already taken"});
            }
        }
    });
    console.log(queryString);
});

app.listen(8080);
console.log(new Date + " Server listening on port 8080");
