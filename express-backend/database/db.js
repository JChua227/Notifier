require("dotenv").config();

const mysql = require("mysql2");
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.dbPassword,
  database: "notifier",
});

module.exports = connection;