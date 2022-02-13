const express = require("express");
const connection = require("./database/db.js");
const app = express();
const cors = require("cors");
const session = require("express-session");

app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(
  session({
    secret: "ABCDefghiJKLMnopQrSTUVwXYz",
    resave: false,
    saveUninitialized: false,
  })
);

app.post("/createSession", (req, res) => {
  req.session.thing = "hello world";
  res.send(200);
});

app.get("/getSession", (req, res) => {
  res.send(req.session.thing);
});

const users = require("./endpoints/users.js");
app.use("/users", users);

app.use(async (req, res, next) => {
  try {
    const username = req.session.user.result.username;
    const password = req.session.user.result.password;
    const result = await validUser(username);
    if (result.password != password) res.sendStatus(401);
    req.session.user = { result };
    next();
  } catch (err) {
    res.sendStatus(401);
  }
});

const validUser = async (username) => {
  const result = await connection
    .promise()
    .query("SELECT * FROM user WHERE username=?", [username])
    .then();
  return result[0][0];
};

app.post("/logout", (req, res) => {
  try {
    req.session.user.result = {};
    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(400);
  }
});

const messages = require("./endpoints/messages.js");
app.use("/messages", messages);

app.get("/test", (req, res) => {
  res.send("this test is working");
});

app.listen(8080);
