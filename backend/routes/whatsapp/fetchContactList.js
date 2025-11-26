const express = require("express");
const { PrismaClient } = require("../../generated/prisma/client");
const { RESPONSE_CODES } = require("../../config/constant");
const prisma = new PrismaClient();

const router = express.Router();

// GET /whatsapp/contacts/:waAccountId
router.get("/contacts/:waAccountId", async (req, res) => {
    try {
        const waAccountId = Number(req.params.waAccountId);

        if (!waAccountId) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "waAccountId is required",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            });
        }

        const conversations = await prisma.conversation.findMany({
            where: { waAccountId },
            orderBy: { lastMessageAt: "desc" }, // latest chat top
            include: {
                contact: true // join contact table
            }
        });

        const contactList = conversations.map((con) => ({
            contactId: con.contact.id,
            phone: con.contact.phone,
            lastMessage: con.lastMessage,
            lastMessageAt: con.lastMessageAt
        }));

        res.status(RESPONSE_CODES.GET).json({
            status: 1,
            message: "Fetched",
            statusCode: RESPONSE_CODES.GET,
            data: contactList
        });

    } catch (error) {
        console.log("CONTACT LIST ERROR:", error);
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: "Failed to fetch contacts",
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        });
    }
});

module.exports = router;
