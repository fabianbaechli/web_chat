const mysql = require('mysql');
require('dotenv').config();

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "web_chat"
});
connection.connect();

module.exports = connection;