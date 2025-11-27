import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

export const API_BASE = "http://localhost:4000/whatsapp";

const messageSlice = createSlice({
    name: "message",
    initialState: {
        isLoading: false,
        messageData: {},
        messages: []
    },
    reducers: {
        fetchMessagesRequest(state, action) {
            state.isLoading = true,
                state.messages = []
        },
        fetchMessagesSuccess(state, action) {
            state.isLoading = false,
                state.messages = action.payload
        },
        fetchMessagesFailed(state, action) {
            state.isLoading = false,
                state.messages = []
        },

        sendMessageRequest(state, action) {
            isLoading = true,
                messageData = {}
        },
        sendMessageSuccess(state, action) {
            isLoading = false,
                messageData = action.payload
        },
        sendMessageFailed(state, action) {
            isLoading = false
            messageData = {}
        }
    }
});

// FETCH MESSAGES
export const fetchMessages = (waAccountId, contactId) => async (dispatch) => {
    dispatch(messageSlice.actions.fetchMessagesRequest());
    try {
        const response = await axios.get(`${API_BASE}/fetchChatConversation/messages/${waAccountId}/${contactId}`,
            {
                withCredentials: true
            }
        );
        console.log("Fetch Messages:", response);
        dispatch(messageSlice.actions.fetchMessagesSuccess(response.data.data.messages))
    } catch (error) {
        dispatch(messageSlice.actions.fetchMessagesFailed());
        console.log("Fetch Messages:", error);
        toast.error(error.response.data.message);
    }
};

// SEND TEXT MESSAGE
export const sendTextMessage = () => async (dispatch) => {
    dispatch(messageSlice.actions.sendMessageRequest());
    try {
        const response = await axios.post(`${API_BASE}/send-messages/text`, data,
            {
                withCredentials: true,
                headers: { "Content-Type": "application/json" }
            }
        );
        dispatch(messageSlice.actions.sendMessageSuccess(response.data.data));
        toast.success(response.data.message);
    } catch (error) {
        dispatch(messageSlice.actions.sendMessageFailed());
        console.log("Send Message", error);
        toast.error(error.response.data.message)
    };
};

export default messageSlice.reducer;