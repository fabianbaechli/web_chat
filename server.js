// Dependencies
var express       = require('express')
var session       = require('express-session')
var db            = require('mysql')
var bodyParser    = require('body-parser')
var app           = express()
var sha256        = require('sha256')
var mysql         = require('mysql')
require('dotenv').config()

// mysql connection
var connection = mysql.createConnection({
   host: "localhost",
   user: "root",
   password: "root",
   database: "web_chat"
});
connection.connect();

// Cookie settings for session
app.use(session({
   secret: process.env.COOKIE_SECRET,
   cookie: {
      maxAge: 10000
   },
   resave: true,
   saveUninitialized: true
}))

// All files in the frontend folder are available without a cookie
app.use(express.static('frontend'))

app.get("/", (request, response) => {
   if (isLoggedIn(request)) {
      response.redirect("/main_page")
   } else {
      response.redirect("/")
   }
})

app.post("/login", (request, response) => {
   console.log(request.body.username);
})

function isLoggedIn(request) {
   var session = request.session;
   if (session.username) {
      return true;
   } else {
      return false;
   }
}

app.listen(8080)
console.log(new Date + " Server listening on port 8080")
