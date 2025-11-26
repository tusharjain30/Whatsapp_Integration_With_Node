const express = require("express");
const { PrismaClient } = require("../../generated/prisma/client");
const { sendVideo } = require("../../services/whatsapp");
const { RESPONSE_CODES } = require("../../config/constant");
const prisma = new PrismaClient();
const router = express.Router();

router.post("/send-video", async (req, res) => {
    try {
        const { phone, videoUrl, caption, waAccountId } = req.body;

        if (!phone || !videoUrl || !waAccountId) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "phone, videoUrl, waAccountId required",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            });
        }

        // FETCH WHATSAPP ACCOUNT + VALIDATE CONNECTION
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
                message: "WhatsApp account is missing phoneNumberId or accessToken",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            });
        }

        // SEND VIDEO USING WHATSAPP API
        const waMessageId = await sendVideo(phoneNumberId, phone, videoUrl, caption, accessToken);

        // UPSERT CONTACT
        const contact = await prisma.contact.upsert({
            where: {
                waAccountId_phone: {
                    waAccountId: waAccountId,
                    phone: phone
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
                lastMessage: caption || "video",
                lastMessageAt: new Date()
            },
            update: {
                lastMessage: caption || "video",
                lastMessageAt: new Date()
            }
        });

        // SAVE OUTBOUND MESSAGE
        await prisma.message.create({
            data: {
                waAccountId,
                contactId: contact.id,
                conversationId: conversation.id,
                direction: "OUTBOUND",
                status: "SENT",
                messageType: "video",
                text: caption || null,
                mediaUrl: videoUrl,
                waMessageId: waMessageId,
                timestamp: new Date()
            }
        });

        res.status(RESPONSE_CODES.GET).json({
            status: 1,
            message: "Video sent successfully + DB saved",
            statusCode: RESPONSE_CODES.GET,
            data: {
                waMessageId,
                api: apiResponse.data
            }
        });

    } catch (error) {
        console.log("SEND VIDEO ERROR:", error.response?.data || error);
        res.status(500).json({
            error: error.response?.data || "Something went wrong"
        });
    }
});

module.exports = router;
