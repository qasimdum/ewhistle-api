const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();

const connection = mysql.createConnection({
  host: process.env.RDS_HOSTNAME || process.env.DB_HOST,
  user: process.env.RDS_USERNAME || process.env.DB_USER,
  password: process.env.RDS_PASSWORD || process.env.DB_PASSWORD,
  database: process.env.RDS_DB_NAME || process.env.DB_NAME,
  port: process.env.RDS_PORT || process.env.DB_PORT
});
connection.connect();

module.exports = connection;

