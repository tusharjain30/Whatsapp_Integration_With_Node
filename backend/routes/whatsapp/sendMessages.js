const express = require("express");
const router = express.Router();
const { PrismaClient } = require("../../generated/prisma/client");
const prisma = new PrismaClient();
const { RESPONSE_CODES } = require("../../config/constant");
const { sendTextMessage } = require("../../services/whatsapp");

router.post('/text', async (req, res) => {
    try {

        const { waAccountId, to, text } = req.body;
        if (!waAccountId || !to || !text)
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "waAccountId, to, text is required",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            });

        const account = await prisma.whatsAppAccount.findUnique({ where: { id: Number(waAccountId) } });
        if (!account) {
            return res.status(RESPONSE_CODES.NOT_FOUND).json({
                status: 0,
                message: "Account not found",
                statusCode: RESPONSE_CODES.NOT_FOUND,
                data: {}
            })
        }

        if (!account.isConnected) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "WhatsApp account is not connected",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            });
        }

        // Send via WhatsApp Cloud API
        const sent = await sendTextMessage( // This is the function that hits the actual WhatsApp Cloud API, and the actual message is delivered to WhatsApp.
            account.phoneNumberId,
            account.accessToken,
            to,
            text
        );

        const waMessageId = sent?.messages?.[0]?.id || null;

        let contact = await prisma.contact.findFirst({ where: { waAccountId: account.id, phone: to } });
        if (!contact) {
            contact = await prisma.contact.create({ data: { waAccountId: account.id, phone: to } });
        }

        let conversation = await prisma.conversation.findFirst({ where: { waAccountId: account.id, contactId: contact.id } });
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    waAccountId: account.id,
                    contactId: contact.id,
                    lastMessage: text,
                    lastMessageAt: new Date()
                }
            })
        } else {
            await prisma.conversation.update({
                where: { id: conversation.id },
                data: { lastMessage: text, lastMessageAt: new Date() }
            });
        }

        const outbound = await prisma.message.create({
            data: {
                waAccountId: account.id,
                contactId: contact.id,
                conversationId: conversation.id,
                direction: "OUTBOUND",
                status: "SENT",
                messageType: "text",
                text,
                waMessageId,
                timestamp: new Date()
            }
        });

        res.status(RESPONSE_CODES.GET).json({
            status: 1,
            message: "Message sent successfully",
            statusCode: RESPONSE_CODES.GET,
            data: outbound
        });

    } catch (error) {
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: error.message,
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        });
    }
});

module.exports = router;