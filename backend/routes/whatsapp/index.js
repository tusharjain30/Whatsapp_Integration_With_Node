const express = require("express");
const router = express.Router();

const connect = require("./connect");
const webhook = require("./webhook");
const sendMessages = require("./sendMessages");
const sendImageMessage = require("./sendImageMessage");
const sendDocumentMessage = require("./sendDocumentMessage");
const sendVideo = require("./sendVideo");
const sendAudio = require("./sendAudio");
const fetchContactList = require("./fetchContactList");
const fetchChatConversation = require("./fetchChatConversation");


router.use("/connect", connect); // /whatsapp/connect
router.use("/webhook", webhook); // /whatsapp/webhook
router.use("/send-messages", sendMessages); // /whatsapp/send-messages
router.use("/send-image-messages", sendImageMessage); // /whatsapp/send-image-messages
router.use("/send-document-messages", sendDocumentMessage); // /whatsapp/send-document-messages
router.use("/send-video", sendVideo); // /whatsapp/send-video
router.use("/send-audio", sendAudio); // /whatsapp/send-audio
router.use("/fetchContactList", fetchContactList); // /whatsapp/fetchContactList
router.use("/fetchChatConversation", fetchChatConversation); // /whatsapp/fetchChatConversation

module.exports = router;
