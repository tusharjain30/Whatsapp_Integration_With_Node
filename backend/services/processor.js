const { PrismaClient } = require('../generated/prisma/client');
const { getMediaUrl } = require('./whatsapp');
const prisma = new PrismaClient();

async function processIncomingWebhook(account, field, payload) {
    try {
        if (field !== "messages") return;

        const messages = payload.messages || [];

        for (const msg of messages) {
            const waMessageId = msg.id;
            const from = msg.from;
            const msgType = msg.type;

            let text = null;
            let mediaType = null;
            let mediaId = null;
            let mimeType = null;
            let fileSize = null;

            // HANDLE TEXT
            if (msgType === "text") {
                text = msg.text?.body || null;
            }

            // HANDLE MEDIA + CAPTION (TEXT)
            const mediaTypes = ["image", "video", "document", "audio"];

            if (mediaTypes.includes(msgType)) {
                mediaType = msgType;
                mediaId = msg[msgType]?.id || null;
                mimeType = msg[msgType]?.mime_type || null;
                fileSize = msg[msgType]?.file_size || null;

                // Caption as text (if exists)
                if (msg[msgType]?.caption) {
                    text = msg[msgType].caption;
                }
            }

            if (mediaId) {
                mediaId = String(mediaId);
            }

            // UPSERT CONTACT
            const contact = await prisma.contact.upsert({
                where: {
                    waAccountId_phone: {
                        waAccountId: account.id,
                        phone: from,
                    },
                },
                create: {
                    waAccountId: account.id,
                    phone: from,
                    lastMessageAt: new Date(),
                },
                update: {
                    lastMessageAt: new Date(),
                },
            });

            // UPSERT CONVERSATION
            const conversation = await prisma.conversation.upsert({
                where: {
                    waAccountId_contactId: {
                        waAccountId: account.id,
                        contactId: contact.id,
                    },
                },
                create: {
                    waAccountId: account.id,
                    contactId: contact.id,
                    lastMessage: text || msgType,
                    lastMessageAt: new Date(),
                },
                update: {
                    lastMessage: text || msgType,
                    lastMessageAt: new Date(),
                },
            });

            // SAVE MEDIA (IF ANY)
            let mediaRecord = null;

            if (mediaId) {
                const tempUrl = await getMediaUrl(
                    mediaId,
                    account.accessToken
                );

                mediaRecord = await prisma.media.upsert({
                    where: { id: mediaId },
                    create: {
                        id: mediaId,
                        waAccountId: account.id,
                        type: mediaType,
                        mimeType: mimeType,
                        size: fileSize,
                        url: tempUrl,
                        waMediaId: mediaId,
                    },
                    update: {
                        url: tempUrl,
                    },
                });
            }

            // SAVE MESSAGE RECORD
            await prisma.message.create({
                data: {
                    waAccountId: account.id,
                    contactId: contact.id,
                    conversationId: conversation.id,
                    direction: "INBOUND",
                    status: "DELIVERED",
                    messageType: msgType,
                    text: text,
                    mediaId: mediaRecord ? mediaRecord.id : null,
                    waMessageId: waMessageId,

                    timestamp: msg.timestamp
                        ? new Date(Number(msg.timestamp) * 1000)
                        : new Date(),
                },
            });
        }

        console.log("Webhook Process Completed Successfully");

    } catch (error) {
        console.log(
            "Webhook Processing Error:",
            error?.response?.data || error
        );
        throw error?.response?.data || error;
    }
}

module.exports = { processIncomingWebhook };

