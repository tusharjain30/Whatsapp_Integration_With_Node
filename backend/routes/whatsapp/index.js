const express = require("express");
const router = express.Router();

const connect = require("./connect");
const webhook = require("./webhook");
const sendMessages = require("./sendMessages");


router.use("/connect", connect); // /whatsapp/connect
router.use("/webhook", webhook); // /whatsapp/webhook
router.use("/send-messages", sendMessages); // /whatsapp/send-messages

module.exports = router;
