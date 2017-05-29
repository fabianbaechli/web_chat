// Dependencies
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var app = express();
var sha256 = require('sha256');
var mysql = require('mysql');
var auth = require("./auth.js");
require('dotenv').config();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// All files in the frontend folder are available without a cookie
app.use(express.static('frontend'));

app.use(auth.router);

app.listen(8080);
console.log(new Date + " Server listening on port 8080");
