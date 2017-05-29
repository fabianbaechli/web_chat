var mysql = require('mysql');
require('dotenv').config();

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "web_chat"
});
connection.connect();

module.exports = connection;