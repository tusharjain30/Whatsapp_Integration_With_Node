const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../../generated/prisma/client');
const prisma = new PrismaClient();
const { fetchPhoneNumbers } = require('../../services/whatsapp');
const { RESPONSE_CODES } = require('../../config/constant');

router.post('/', async (req, res) => {
    try {

        const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
        const { webhookUrl } = req.body;
        if (!accessToken)
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "accessToken required",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            });

        const wabaId = process.env.WABA_ID;
        const numbers = await fetchPhoneNumbers(wabaId, accessToken); // fetch phone numbers using wabaid, accessToken
        const first = numbers?.data?.[0];
        if (!first)
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "No phone numbers in WABA",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            });

        // Create or update WhatsAppAccount record
        const existing = await prisma.whatsAppAccount.findFirst({
            where: { phoneNumberId: first.id }
        });

        const payload = {
            phoneNumber: first.display_phone_number || first.phone_number || first.verified_name || 'unknown',
            phoneNumberId: first.id,
            businessAccountId: wabaId,
            displayName: first?.verified_name || business.name || null,
            accessToken,
            webhookUrl,
            isConnected: true
        }

        let account;
        if (existing) {
            account = await prisma.whatsAppAccount.update({
                where: { id: existing.id },
                data: payload
            });
        } else {
            account = await prisma.whatsAppAccount.create({ data: payload });
        }

        res.status(RESPONSE_CODES.GET).json({
            status: 1,
            message: "Connected",
            statusCode: RESPONSE_CODES.GET,
            data: account
        });

    } catch (error) {
        console.log(error?.response?.data || error);
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: error.message,
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        });
    }
});

module.exports = router;


