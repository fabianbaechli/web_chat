// Dependencies
var express       = require('express')
var session       = require('express-session')
var db            = require('mysql')
var bodyParser    = require('body-parser')
var app           = express()
var sha256        = require('sha256')
var mysql         = require('mysql')
require('dotenv').config()

var session;

// mysql connection
var connection = mysql.createConnection({
   host: "localhost",
   user: "root",
   password: "root",
   database: "web_chat"
});
connection.connect();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
   extended: true
}))

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
   session = request.session
   if (isLoggedIn(request)) {
      response.redirect("/main_page")
   } else {
      response.redirect("/")
   }
})

app.post("/login", (request, response) => {
   session = request.session
   var username = request.body.username;
   var password = request.body.password;
   var queryString = "SELECT * FROM users WHERE user_name = " + connection.escape(username);
   connection.query(queryString, (error, results, fields) => {
      if (error)
         throw error
      if (results.length == 0)
         response.redirect("/")
      else {
         if (results[0].password === password) {
            session.username = username;
            response.send("logged in!")
//            response.redirect("/main_page")
         }
         else
            response.redirect("/")
      }
   })
})

function isLoggedIn(request) {
   session = request.session;
   if (session.username) {
      return true
   } else {
      return false
   }
}

app.listen(8080)
console.log(new Date + " Server listening on port 8080")
