const express = require("express");
const http = require("http");
const mysql = require("mysql");
const _ = require("lodash");

require("dotenv").config();

const {
  DATABASE_HOST,
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_NAME,
  APP_PORT
} = process.env;

const connection = mysql.createConnection({
  host: DATABASE_HOST,
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: DATABASE_NAME
});

const app = express();

app.set("port", APP_PORT);

const getMessage = () => {
  return new Promise((resolve, reject) =>
    connection.query(
      `SELECT * FROM messages ORDER BY id DESC LIMIT 1`,
      (error, results) => {
        if (error) {
          reject(error);
        }
        const message = _.get(results, `0.title`);
        resolve(message);
      }
    )
  );
};

app.use("/", async (req, res, next) => {
  try {
    const result = await getMessage();
    res.json({ message: result });
  } catch (err) {
    console.log(err);
    res.status(503).json({ message: "service not available!" });
  }
});

app.use((req, res, next) => {
  res.status(404).json({ message: "not found!" });
});

const server = http.createServer(app);

connection.connect(err => {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }
  console.log("connected as id " + connection.threadId);
  server.listen(APP_PORT);
  server.on("error", console.log);
  server.on("listening", () => console.log(`Listening on ${APP_PORT}`));
});
