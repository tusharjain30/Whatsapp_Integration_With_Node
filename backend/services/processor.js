const { PrismaClient } = require('../generated/prisma/client');
const prisma = new PrismaClient();

async function processIncomingWebhook(account, field, payload) {
    // Only handle messages for now
    if (field !== 'messages') return;

    const messages = payload.messages || [];
    for (const msg of messages) {
        const from = msg.from; // phone number of sender
        const waMessageId = msg.id;
        const msgType = Object.keys(msg)[1] || 'text'; // crude detection

        // Find or create contact (if account null, skip contact creation)
        let contact = null;
        if (account) {
            contact = await prisma.contact.upsert({
                where: { waAccountId_phone: { waAccountId: account.id, phone: from } },
                create: {
                    waAccountId: account.id,
                    phone: from,
                    firstName: null
                },
                update: {
                    lastMessageAt: new Date()
                }
            }).catch(async (e) => {
                // fallback: find by unique phone index
                const c = await prisma.contact.findFirst({ where: { waAccountId: account.id, phone: from } });
                return c;
            });
        }

        // Ensure conversation exists
        let conversation = null;
        if (account && contact) {
            conversation = await prisma.conversation.upsert({
                where: { waAccountId_contactId: { waAccountId: account.id, contactId: contact.id } },
                create: {
                    waAccountId: account.id,
                    contactId: contact.id,
                    lastMessage: msg.text?.body || (msgType + ' message'),
                    lastMessageAt: new Date()
                },
                update: {
                    lastMessage: msg.text?.body || (msgType + ' message'),
                    lastMessageAt: new Date()
                }
            });
        }

        // Create message record
        await prisma.message.create({
            data: {
                waAccountId: account ? account.id : 0,
                contactId: contact ? contact.id : 0,
                conversationId: conversation ? conversation.id : null,
                direction: 'INBOUND',
                status: 'DELIVERED',
                messageType: msgType === 'text' ? 'text' : msgType,
                text: msg.text?.body ?? null,
                waMessageId: waMessageId,
                timestamp: msg.timestamp ? new Date(Number(msg.timestamp) * 1000) : new Date()
            }
        });
    }
}

module.exports = { processIncomingWebhook };
