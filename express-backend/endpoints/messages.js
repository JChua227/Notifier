const express = require("express");
const twilio = require("twilio");
const router = express.Router();
const connection = require("../database/db.js");
require("dotenv").config();
const cron = require("cron").CronJob;
const moment = require("moment");

const accountSid = process.env.accountSid;
const authToken = process.env.authToken;
const client = new twilio(accountSid, authToken);
module.exports = client;

const pendingEvents = [];
const pendingJobs = [];
const uniqueEventIds = new Map();
const deleteIncomingEvents = new Set();

router.post("/createMessage", async (req, res) => {
  try {
    const { message, executionTime, recipient } = req.body;
    let convertedTime = moment(executionTime).format("YYYY-MM-DD HH:mm:ss");
    connection
      .promise()
      .query(
        `INSERT INTO messages (userId,messages,executionTime,recipient) VALUES(?,?,?,?)`,
        [req.session.user.result.userId, message, convertedTime, recipient]
      );
    let tenMinutes = 10 * 60000;
    let convertedDate = new Date(convertedTime);
    if (convertedDate - new Date() < tenMinutes) {
      await initialPopulateCurrentEvents();
    }
  } catch (err) {
    console.log(err);
  }
});

router.get("/getMessages/:country/:location", async (req, res) => {
  try {
    const result = await connection
      .promise()
      .query("SELECT * FROM messages WHERE userId=? ORDER BY executionTime", [
        req.session.user.result.userId,
      ])
      .catch((err) => {
        console.log(err);
      });

    const data = result[0].map((message) => ({
      ...message,
      executionTime: new Date(message.executionTime).toLocaleString("en-US", {
        timeZone: `${req.params.country}/${req.params.location}`,
      }),
    }));

    for (let x = 0; x < data.length; x++) {
      if (deleteIncomingEvents.has(data[x].messagesId)) {
        data.splice(x, 1);
        x--;
      }
    }

    res.send(data);
  } catch (err) {
    res.sendStatus(400);
  }
});

router.post("/deleteMessage", async (req, res) => {
  const { messageId } = req.body;
  try {
    await connection
      .promise()
      .query(
        "DELETE messages FROM messages JOIN user ON messages.userId=user.userId WHERE messagesId=? AND user.userId=?;",
        [messageId, req.session.user.result.userId]
      );
    deleteEvent(messageId);
    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(401);
  }
});

const deleteEvent = (messageId) => {
  for (let x = 0; x < pendingEvents.length; x++) {
    if (pendingEvents[x].messagesId == messageId) {
      pendingEvents.splice(x, 1);
      pendingJobs[x].stop();
      pendingJobs.splice(x, 1);
      uniqueEventIds.delete(messageId);
      x--;
    }
  }

  deleteIncomingEvents.add(messageId);
};

const createPendingEvents = () => {
  for (let x = 0; x < pendingEvents.length; x++) {
    if (uniqueEventIds.get(pendingEvents[x].messagesId) == 0) {
      uniqueEventIds.set(pendingEvents[x].messagesId, 1);
      console.log("messages id " + pendingEvents[x].messagesId);
      const job = new cron(
        pendingEvents[x].executionTime,
        () => {
          client.messages
            .create({
              body: pendingEvents[x].messages,
              to: pendingEvents[x].recipient,
              from: process.env.fromNumber,
            })
            .then()
            .catch((err) => {
              console.log(err);
            });
          deleteIncomingEvents.add(pendingEvents[x].messagesid);
        },
        null,
        true,
        "America/New_York"
      );
      job.start();
      pendingJobs.push(job);
    }
  }
};

const deleteOldEvents = () => {
  connection
    .promise()
    .query(`DELETE FROM messages WHERE executionTime <= NOW()`)
    .catch((err) => console.log(err));
};

const stopOldJobs = () => {
  for (let x = 0; x < pendingEvents.length; x++) {
    uniqueEventIds.delete(pendingEvents[x].messagesId);
    pendingEvents.splice(x, 1);
    pendingJobs[x].stop();
    pendingJobs.splice(x, 1);
    x--;
  }
};

const populateCurrentEvents = async () => {
  initialPopulateCurrentEvents();
  const job = new cron("*/30 * * * * *", async () => {
    stopOldJobs();
    deleteOldEvents();
    let messages;
    messages = await connection
      .promise()
      .query(
        "SELECT * FROM messages WHERE executionTime <= NOW() + INTERVAL 10 MINUTE;"
      )
      .then()
      .catch((err) => console.log(err));

    messages[0].forEach((item) => {
      if (!uniqueEventIds.has(item.messagesId)) {
        pendingEvents.push(item);
        uniqueEventIds.set(item.messagesId, 0);
      }
    });
    await createPendingEvents();
  });

  job.start();
};

const initialPopulateCurrentEvents = async () => {
  stopOldJobs();
  deleteOldEvents();
  let messages;
  messages = await connection
    .promise()
    .query(
      "SELECT * FROM messages WHERE executionTime <= NOW() + INTERVAL 10 MINUTE;"
    )
    .then()
    .catch((err) => console.log(err));

  messages[0].forEach((item) => {
    if (!uniqueEventIds.has(item.messagesId)) {
      pendingEvents.push(item);
      uniqueEventIds.set(item.messagesId, 0);
    }
  });
  await createPendingEvents();
};

const checkDaylightSavingsTime = () => {
  Date.prototype.stdTimezoneOffset = function () {
    const jan = new Date(this.getFullYear(), 0, 1);
    const jul = new Date(this.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
  };

  Date.prototype.isDstObserved = function () {
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
  };

  const today = new Date();
  return today.isDstObserved();
};

populateCurrentEvents();

module.exports = router;
