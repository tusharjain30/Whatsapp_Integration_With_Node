const express = require("express");
const router = express.Router();
const { PrismaClient } = require("../../generated/prisma/client");
const prisma = new PrismaClient();
const { RESPONSE_CODES } = require('../../config/constant');
const { sendDocumentMessage, uploadDocument } = require("../../services/whatsapp");

router.post("/document", async (req, res) => {
    try {
        const { waAccountId, contactId, fileUrl, fileName, caption } = req.body;

        if (!waAccountId || !contactId || !fileUrl) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "waAccountId, contactId & fileUrl are required",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            });
        }

        // WhatsApp Account
        const account = await prisma.whatsAppAccount.findUnique({
            where: { id: Number(waAccountId) }
        });

        if (!account || !account.accessToken || !account.phoneNumberId) {
            return res.status(RESPONSE_CODES.NOT_FOUND).json({
                status: 0,
                message: "WhatsApp Account not connected",
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

        const accessToken = account.accessToken;
        const phoneNumberId = account.phoneNumberId;

        // Contact
        const contact = await prisma.contact.findUnique({
            where: { id: Number(contactId) }
        });

        if (!contact) {
            return res.status(RESPONSE_CODES.NOT_FOUND).json({
                status: 0,
                message: "Contact not found",
                statusCode: RESPONSE_CODES.NOT_FOUND,
                data: {}
            });
        }

        // Conversation
        let conversation = await prisma.conversation.findFirst({
            where: {
                waAccountId: Number(waAccountId),
                contactId: Number(contactId)
            }
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    waAccountId: Number(waAccountId),
                    contactId: Number(contactId),
                    lastMessage: caption || "Document",
                    lastMessageAt: new Date()
                }
            });
        }

        // Upload Document to WhatsApp
        const waMediaId = await uploadDocument(
            phoneNumberId,
            accessToken,
            fileUrl,
            fileName
        );

        // Save Media in DB
        await prisma.media.create({
            data: {
                id: waMediaId,
                waAccountId: Number(waAccountId),
                type: "document",
                mimeType: "application/pdf",
                url: fileUrl,
                waMediaId: waMediaId
            }
        });

        // Send document message
        const waMessageId = await sendDocumentMessage(
            phoneNumberId,
            accessToken,
            contact.phone,
            waMediaId,
            caption,
            fileName
        );

        // Save message in DB
        const message = await prisma.message.create({
            data: {
                waAccountId: Number(waAccountId),
                contactId: Number(contactId),
                conversationId: conversation.id,
                direction: "OUTBOUND",
                status: "SENT",
                messageType: "document",
                mediaId: waMediaId,
                waMessageId: waMessageId,
                text: caption || null,
                timestamp: new Date()
            }
        });

        // Update conversation last message
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: {
                lastMessage: caption || "Document sent",
                lastMessageAt: new Date()
            }
        });

        res.status(RESPONSE_CODES.GET).json({
            status: 1,
            message: "Document sent successfully",
            statusCode: RESPONSE_CODES.GET,
            data: {
                waMessageId,
                dbMessageId: message.id,
                mediaId: waMediaId
            }
        });

    } catch (error) {
        console.log("Document Send Error:", error?.response?.data || error);

        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: error?.response?.data?.error?.message || "Failed to send document",
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        });
    }
});

module.exports = router;
