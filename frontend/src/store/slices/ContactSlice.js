import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

export const API_BASE = "http://localhost:4000/whatsapp";

const contactSlice = createSlice({
    name: "contact",
    initialState: {
        isLoading: false,
        contactList: []
    },
    reducers: {
        fetchContactListRequest(state, action) {
            state.isLoading = true,
                state.contactList = []
        },
        fetchContactListSuccess(state, action) {
            state.isLoading = false,
                state.contactList = action.payload
        },
        fetchContactListFailed(state, action) {
            state.isLoading = false,
                state.contactList = []
        }
    }
});

export const fetchContactList = (waAccountId) => async (dispatch) => {
    dispatch(contactSlice.actions.fetchContactListRequest());
    try {
        const response = await axios.get(`${API_BASE}/fetchContactList/contacts/${waAccountId}`,
            {
                withCredentials: true
            }
        );
        console.log("Fetch Messages:", response);
        dispatch(contactSlice.actions.fetchContactListSuccess(response.data.data))
    } catch (error) {
        dispatch(contactSlice.actions.fetchContactListFailed());
        console.log("Fetch contact list", error);
        toast.error(error.response.data.message);
    }
};

export default contactSlice.reducer;