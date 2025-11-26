const express = require("express");
const router = express.Router();
const { PrismaClient } = require("../../generated/prisma/client");
const prisma = new PrismaClient();
const { RESPONSE_CODES } = require('../../config/constant');
const { sendImageMessage } = require("../../services/whatsapp");

router.post('/image', async (req, res) => {
    try {

        const { waAccountId, to, imageUrl, caption } = req.body;

        if (!waAccountId || !to || !imageUrl) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "waAccountId, to & imageUrl are required",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            });
        }

        const account = await prisma.whatsAppAccount.findUnique({
            where: { id: Number(waAccountId) }
        });

        if (!account) {
            return res.status(RESPONSE_CODES.NOT_FOUND).json({
                status: 0,
                message: "WhatsApp account not found",
                statusCode: RESPONSE_CODES.NOT_FOUND,
                data: {}
            });
        }

        if (!account.isConnected) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "WhatsApp account is not connected",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            });
        }

        // Send image message via WhatsApp Cloud API
        const apiResponse = await sendImageMessage(
            account.phoneNumberId,
            account.accessToken,
            to,
            imageUrl,
            caption
        );

        const waMessageId = apiResponse.messages?.[0]?.id;

        // Contact UPSERT
        const contact = await prisma.contact.upsert({
            where: {
                waAccountId_phone: { waAccountId: account.id, phone: to }
            },
            create: {
                waAccountId: account.id,
                phone: to,
                lastMessageAt: new Date()
            },
            update: {
                lastMessageAt: new Date()
            }
        });

        // Conversation UPSERT
        const conversation = await prisma.conversation.upsert({
            where: {
                waAccountId_contactId: { waAccountId: account.id, contactId: contact.id }
            },
            create: {
                waAccountId: account.id,
                contactId: contact.id,
                lastMessage: caption || "Image",
                lastMessageAt: new Date()
            },
            update: {
                lastMessage: caption || "Image",
                lastMessageAt: new Date()
            }
        });

        // Media Save
        const media = await prisma.media.create({
            data: {
                id: waMessageId,
                waAccountId: account.id,
                type: "image",
                url: imageUrl,
                mimeType: "image/jpeg",
                waMediaId: waMessageId
            }
        });

        // Message Save
        const message = await prisma.message.create({
            data: {
                waAccountId: account.id,
                contactId: contact.id,
                conversationId: conversation.id,
                direction: "OUTBOUND",
                status: "SENT",
                messageType: "image",
                text: caption || null,
                mediaId: waMessageId,
                waMessageId,
                timestamp: new Date()
            }
        });

        res.status(RESPONSE_CODES.GET).json({
            status: 1,
            message: "Image sent successfully",
            statusCode: RESPONSE_CODES.GET,
            data: {
                waMessageId,
                dbMessageId: message.id,
                mediaId: media.id
            }
        });

    } catch (error) {
        console.log("Image API Error:", error.response?.data || error);
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: error.response?.data?.error?.message || "Something went wrong",
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        });
    }
});


module.exports = router;