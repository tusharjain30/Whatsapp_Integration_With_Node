import { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { useSelector, useDispatch } from "react-redux";
import { fetchMessages, sendTextMessage } from "../../store/slices/MessageSlice";

const ChatWindow = () => {

  const dispatch = useDispatch();
  const { isLoading, messageData, messages } = useSelector((state) => state.messages);
  const { contactId, phone } = useParams();
  const { waAccountId } = useOutletContext();

  useEffect(() => {
    if (!contactId) return;
    loadMessages();
  }, [contactId, messageData]);

  // const loadContact = async () => {
  //   // simple way: get all contacts and find one
  //   const res = await fetchContacts(waAccountId);
  //   const c = (res.contacts || []).find(
  //     (x) => x.contactId === Number(contactId)
  //   );
  //   setContact(c || null);
  // };

  const loadMessages = async () => {
    dispatch(fetchMessages(waAccountId, contactId));
  };

  const handleSendText = async (text) => {
    dispatch(sendTextMessage({
      waAccountId,
      to: phone,
      text: text
    }))
    // await sendTextMessage({
    //   waAccountId,
    //   phone: contact.phone,
    //   message: text,
    // });
    await loadMessages();
  };

  return (
    <div className="flex flex-col w-full h-full">

      <ChatHeader phone={phone} />

      <div className="flex-1 bg-slate-50 overflow-y-auto p-3 space-y-1">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            No messages yet. Say hi 👋
          </div>
        )}

        {messages && messages.map((m) => (
          <MessageBubble key={m.id} msg={m} />
        ))}
      </div>

      <MessageInput onSendText={handleSendText} />
    </div>
  );
}

export default ChatWindow;