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
        console.log("error", error?.response?.data);
        throw error.response?.data || error;
    }
};

const sendTextMessage = async (phoneNumberId, accessToken, to, text) => {
    try {
        const res = await axios.post(`${GRAPH}/${phoneNumberId}/messages`, {
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
};

const sendImageMessage = async (phoneNumberId, accessToken, to, publicUrl, caption = "") => {
    try {
        const res = await axios.post(
            `${GRAPH}/${phoneNumberId}/messages`,
            {
                messaging_product: "whatsapp",
                to: to,
                type: "image",
                image: {
                    link: publicUrl,   // PUBLIC DIRECT URL REQUIRED
                    caption: caption
                }
            },
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        return res.data;

    } catch (error) {
        console.log("error", error?.response?.data);
        throw error.response?.data || error;
    }
};

const sendDocumentMessage = async (phoneNumberId, accessToken, to, waMediaId, caption, fileName) => {
    try {
        const sendRes = await axios({
            method: "POST",
            url: `${GRAPH}/${phoneNumberId}/messages`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            data: {
                messaging_product: "whatsapp",
                to: to,  // FIXED
                type: "document",
                document: {
                    id: waMediaId,
                    caption: caption || "",
                    filename: fileName
                }
            }
        });

        return sendRes?.data?.messages?.[0]?.id;

    } catch (error) {
        console.log("error", error?.response?.data);
        throw error.response?.data || error;
    }
};

const sendVideo = async (phoneNumberId, phone, videoUrl, caption, accessToken) => {
    try {
        const url = `${GRAPH}/${phoneNumberId}/messages`;

        const payload = {
            messaging_product: "whatsapp",
            to: phone,
            type: "video",
            video: {
                link: videoUrl,
                caption: caption || ""
            }
        };

        const apiResponse = await axios.post(url, payload, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        });

        return apiResponse.data?.messages?.[0]?.id || null;

    } catch (error) {
        console.log("error", error?.response?.data);
        throw error.response?.data || error;
    }
};

const sendAudio = async (phoneNumberId, phone, audioUrl, accessToken) => {
    try {
        const url = `${GRAPH}/${phoneNumberId}/messages`;

        const payload = {
            messaging_product: "whatsapp",
            to: phone,
            type: "audio",
            audio: {
                link: audioUrl
            }
        };

        const apiResponse = await axios.post(url, payload, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        });

        return apiResponse.data?.messages?.[0]?.id || null;

    } catch (error) {
        console.log("error", error?.response?.data);
        throw error.response?.data || error;
    }
};

const uploadDocument = async (phoneNumberId, accessToken, fileUrl, fileName) => {
    try {
        const mediaRes = await axios({
            method: "POST",
            url: `${GRAPH}/${phoneNumberId}/media`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            data: {
                messaging_product: "whatsapp",
                type: "document",
                url: fileUrl,
                filename: fileName
            }
        });

        return mediaRes.data.id;

    } catch (error) {
        console.log("error", error?.response?.data);
        throw error.response?.data || error;
    }
};

async function getMediaUrl(mediaId, accessToken) {
    try {
        const res = await axios.get(
            `${GRAPH}/${mediaId}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        return res.data.url || null; // Temporary download URL

    } catch (error) {
        console.log("Failed to fetch media URL:", err?.response?.data);
        throw error.response?.data || error;
    }
};

module.exports = {
    fetchPhoneNumbers,
    sendTextMessage,
    sendImageMessage,
    sendDocumentMessage,
    uploadDocument,
    getMediaUrl,
    sendVideo,
    sendAudio
};