const express = require("express");
const router = express.Router();
const connection = require("../database/db.js");

router.post("/create", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await validUser(username);
    if (result!==undefined) {
      return res.sendStatus(401);
    }
    connection
      .promise()
      .query(
        `INSERT INTO USER(username,password,typeOfAccount) VALUES (?,?,2);`,
        [username, password]
      );
    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(404);
  }
});

router.post("/setLogin", async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const result = await validUser(username);
    if (result.password != password) res.sendStatus(400);
    req.session.user = { result };
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
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

module.exports = router;
