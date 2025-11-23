const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../../generated/prisma/client');
const prisma = new PrismaClient();
const { processIncomingWebhook } = require('../../services/processor');
const { RESPONSE_CODES } = require('../../config/constant');

// This endpoint is only for verifying the meta.
router.get('/', (req, res) => {
    try {

        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];  // Checks whether the token is equal or not
        const challenge = req.query['hub.challenge']; // returns the same number
        if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {  // Confirms there is a subscription request
            console.log('VERIFIED! returning challenge:', challenge);
            return res.status(200).send(challenge);
        }

        console.log('VERIFY FAILED');
        res.sendStatus(403);

    } catch (error) {
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: error.message,
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        })
    };
});

// This endpoint receives messages + notifications from WhatsApp.
router.post('/', async (req, res) => {
    try {

        const body = req.body;

        const entries = body.entry || [];
        for (const entry of entries) {
            const changes = entry.changes || [];
            for (const change of changes) {
                const field = change.field;
                const value = change.value;
                const phoneNumberId = value?.metadata?.phone_number_id || value?.metadata?.display_phone_number || null;

                // Find matching account by phoneNumberId if exists
                let account = null;
                if (phoneNumberId) {
                    account = await prisma.whatsAppAccount.findFirst({
                        where: { phoneNumberId: phoneNumberId }
                    });
                }

                await prisma.webhookEvent.create({
                    data: {
                        waAccountId: account ? account.id : 0,
                        eventType: field,
                        payload: value
                    }
                });

                // Kick off basic processing (non-blocking)
                processIncomingWebhook(account, field, value).catch(e => console.error('processor error', e));
            }
        }

        res.sendStatus(200);

    } catch (error) {
        console.log('webhook error', error);
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: error.message,
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        })
    };
});

module.exports = router;
