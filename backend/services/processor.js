const { PrismaClient } = require('../generated/prisma/client');
const { getMediaUrl } = require('./whatsapp');
const prisma = new PrismaClient();

async function processIncomingWebhook(account, field, payload) {
    try {
        if (field !== "messages") return;

        const messages = payload.messages || [];

        for (const msg of messages) {

            const from = msg.from;
            const waMessageId = msg.id;
            const msgType = msg.type;

            let text = null;
            let incomingMediaId = null;

            // TEXT
            if (msgType === "text") {
                text = msg.text?.body || null;
            }

            // UNIFIED MEDIA HANDLING
            const mediaTypes = ["image", "video", "audio", "document"];

            if (mediaTypes.includes(msgType)) {
                incomingMediaId = msg[msgType]?.id || null;
            }

            if (incomingMediaId) incomingMediaId = String(incomingMediaId);

            // CONTACT UPSERT 
            const contact = await prisma.contact.upsert({
                where: {
                    waAccountId_phone: {
                        waAccountId: account.id,
                        phone: from
                    }
                },
                create: {
                    waAccountId: account.id,
                    phone: from,
                    lastMessageAt: new Date()
                },
                update: {
                    lastMessageAt: new Date()
                }
            });

            // CONVERSATION UPSERT
            const conversation = await prisma.conversation.upsert({
                where: {
                    waAccountId_contactId: {
                        waAccountId: account.id,
                        contactId: contact.id
                    }
                },
                create: {
                    waAccountId: account.id,
                    contactId: contact.id,
                    lastMessage: text || msgType,
                    lastMessageAt: new Date()
                },
                update: {
                    lastMessage: text || msgType,
                    lastMessageAt: new Date()
                }
            });

            // MEDIA SAVE (IF MEDIA MESSAGE)
            let mediaRecord = null;
            if (incomingMediaId) {

                const mimeType = msg[msgType]?.mime_type || null;
                const fileSize = msg[msgType]?.file_size || null;

                // It only fetches a temporary download URL – from the WhatsApp Cloud API
                const temporaryUrl = await getMediaUrl(
                    incomingMediaId,
                    account.accessToken
                );

                mediaRecord = await prisma.media.upsert({
                    where: { id: incomingMediaId },
                    create: {
                        id: incomingMediaId,
                        waAccountId: account.id,
                        type: msgType,
                        mimeType: mimeType,
                        size: fileSize,
                        url: temporaryUrl,
                        waMediaId: incomingMediaId,
                        whatsappAccount: {
                            connect: { id: account.id }
                        }
                    },
                    update: {
                        url: temporaryUrl // update fresh URL
                    }
                });
            }

            // MESSAGE RECORD CREATE
            await prisma.message.create({
                data: {
                    waAccountId: account.id,
                    contactId: contact.id,
                    conversationId: conversation.id,
                    direction: "INBOUND",
                    status: "DELIVERED",
                    messageType: msgType,
                    text: text,
                    mediaId: incomingMediaId || null,
                    waMessageId: waMessageId,
                    timestamp: msg.timestamp
                        ? new Date(Number(msg.timestamp) * 1000)
                        : new Date()
                }
            });
        };

        console.log("Webhook Process Completed");

    } catch (error) {
        console.log("Webhook Processing Error:", error?.response?.data || error);
        throw error?.response?.data || error;
    }
};

module.exports = { processIncomingWebhook };
