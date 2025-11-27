import {configureStore} from "@reduxjs/toolkit";
import messageReducer from "./slices/MessageSlice";
import contactReducer from "./slices/ContactSlice";

const store = configureStore({
    reducer: {
        messages: messageReducer,
        contacts: contactReducer,
    },
});

export default store;