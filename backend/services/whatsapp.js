const axios = require('axios');

const GRAPH = `https://graph.facebook.com/${process.env.GRAPH_API_VERSION || 'v17.0'}`; // The base URL for every API call.

const fetchPhoneNumbers = async (wabaId, accessToken) => {
    try {
        const res = await axios.get(`${GRAPH}/${wabaId}/phone_numbers`, {
            params: {
                access_token: accessToken
            }
        });

        return res.data;

    } catch (error) {
        throw error.response?.data || error;
    }
};

const sendTextMessage = async (phoneNumberId, accessToken, to, text) => {
    try {
        const res = await axios.post(
            `${GRAPH}/${phoneNumberId}/messages`,
            {
                messaging_product: "whatsapp",
                to: to,
                type: "text",
                text: { body: text }
            },
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );

        return res.data;

    } catch (error) {
        console.log("error", error?.response?.data);
        throw error.response?.data || error;
    }
}

module.exports = {
    fetchPhoneNumbers,
    sendTextMessage
}