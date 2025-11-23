const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../../generated/prisma/client');
const prisma = new PrismaClient();
const { fetchBusinessInfo, fetchPhoneNumbers } = require('../../services/whatsapp');
const { RESPONSE_CODES } = require('../../config/constant');

router.post('/', async (req, res) => {
    try {

        const { accessToken, webhookUrl } = req.body;
        if (!accessToken)
            return res.status(400).json({
                message: 'accessToken required'
            });

        const business = await fetchBusinessInfo(accessToken);  // fetch waba id using access token
        const wabaId = business.id;
        const numbers = await fetchPhoneNumbers(wabaId, accessToken); // fetch phone numbers using wabaid, accessToken
        const first = numbers?.data?.[0];
        if (!first)
            return res.status(400).json({
                message: 'No phone numbers in WABA'
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


