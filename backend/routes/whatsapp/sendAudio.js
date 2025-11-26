const express = require("express");
const axios = require("axios");
const { PrismaClient } = require("../../generated/prisma/client");
const { RESPONSE_CODES } = require("../../config/constant");
const { sendAudio } = require("../../services/whatsapp");
const prisma = new PrismaClient();

const router = express.Router();

router.post("/send-audio", async (req, res) => {
    try {

        const { phone, audioUrl, waAccountId } = req.body;

        if (!phone || !audioUrl || !waAccountId) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "phone, audioUrl, waAccountId required",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            });
        }

        // FETCH WHATSAPP ACCOUNT & VALIDATE STATUS
        const waAccount = await prisma.whatsAppAccount.findUnique({
            where: { id: waAccountId }
        });

        if (!waAccount) {
            return res.status(RESPONSE_CODES.NOT_FOUND).json({
                status: 0,
                message: "WhatsApp Account not found",
                statusCode: RESPONSE_CODES.NOT_FOUND,
                data: {}
            });
        }

        if (!waAccount.isConnected) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "WhatsApp account is not connected",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            });
        }

        const phoneNumberId = waAccount.phoneNumberId;
        const accessToken = waAccount.accessToken;

        if (!phoneNumberId || !accessToken) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "Missing phoneNumberId or accessToken in WhatsApp Account",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            });
        }

        // SEND AUDIO VIA WHATSAPP CLOUD API
        const waMessageId = await sendAudio(phoneNumberId, phone, audioUrl, accessToken);

        // UPSERT CONTACT
        const contact = await prisma.contact.upsert({
            where: {
                waAccountId_phone: {
                    waAccountId,
                    phone
                }
            },
            create: {
                waAccountId,
                phone,
                lastMessageAt: new Date()
            },
            update: {
                lastMessageAt: new Date()
            }
        });

        // UPSERT CONVERSATION
        const conversation = await prisma.conversation.upsert({
            where: {
                waAccountId_contactId: {
                    waAccountId,
                    contactId: contact.id
                }
            },
            create: {
                waAccountId,
                contactId: contact.id,
                lastMessage: "audio",
                lastMessageAt: new Date()
            },
            update: {
                lastMessage: "audio",
                lastMessageAt: new Date()
            }
        });

        // SAVE OUTBOUND MESSAGE IN DB
        await prisma.message.create({
            data: {
                waAccountId,
                contactId: contact.id,
                conversationId: conversation.id,
                direction: "OUTBOUND",
                status: "SENT",
                messageType: "audio",
                text: null,
                mediaUrl: audioUrl,
                waMessageId,
                timestamp: new Date()
            }
        });

        res.status(RESPONSE_CODES.GET).json({
            status: 1,
            message: "Audio sent successfully + DB saved",
            statusCode: RESPONSE_CODES.GET,
            data: {
                waMessageId,
                api: apiResponse.data
            }
        });

    } catch (error) {
        console.log("SEND AUDIO ERROR:", error.response?.data || error);
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: error.response?.data || "Something went wrong",
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        });
    }
});

module.exports = router;