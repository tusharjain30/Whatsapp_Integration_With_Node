const express = require("express");
const { PrismaClient } = require("../../generated/prisma/client");
const { RESPONSE_CODES } = require("../../config/constant");
const prisma = new PrismaClient();

const router = express.Router();

router.get("/messages/:waAccountId/:contactId", async (req, res) => {
    try {
        const waAccountId = Number(req.params.waAccountId);
        const contactId = Number(req.params.contactId);

        if (!waAccountId || !contactId) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "waAccountId & contactId required",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            });
        }

        const conversation = await prisma.conversation.findUnique({
            where: {
                waAccountId_contactId: { waAccountId, contactId }
            }
        });

        if (!conversation) {
            return res.status(RESPONSE_CODES.GET).json({
                status: 1,
                message: "No Conversation",
                statusCode: RESPONSE_CODES.GET,
                data: []
            });
        }

        const messages = await prisma.message.findMany({
            where: {
                waAccountId,
                conversationId: conversation.id
            },
            orderBy: { timestamp: "asc" },
            include: {
                media: true
            }
        });

        const formatted = messages.map(msg => ({
            id: msg.id,
            direction: msg.direction,
            messageType: msg.messageType,
            text: msg.text,

            mediaUrl: msg.media?.url || msg.mediaUrl || null,
            mimeType: msg.media?.mimeType || null,
            fileName: msg.media?.fileName || null,

            timestamp: msg.timestamp
        }));

        res.status(RESPONSE_CODES.GET).json({
            status: 1,
            message: "Fetched",
            statusCode: RESPONSE_CODES.GET,
            data: {
                conversationId: conversation.id,
                messages: formatted
            }
        });

    } catch (error) {
        console.log("FETCH CHAT ERROR:", error);
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: "Failed to fetch chat messages",
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        });
    }
});

module.exports = router;
