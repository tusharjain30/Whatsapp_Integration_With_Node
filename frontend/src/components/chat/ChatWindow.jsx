import { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
// import {
//   fetchMessages,
//   sendTextMessage,
// } from "../../utils/api";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
// import { fetchContacts } from "../../utils/api";

const ChatWindow = () => {
  const { contactId } = useParams();
  const { waAccountId } = useOutletContext();

  const [messages, setMessages] = useState([]);
  const [contact, setContact] = useState(null);

  useEffect(() => {
    if (!contactId) return;
    // loadContact();
    // loadMessages();
  }, [contactId]);

  // const loadContact = async () => {
  //   // simple way: get all contacts and find one
  //   const res = await fetchContacts(waAccountId);
  //   const c = (res.contacts || []).find(
  //     (x) => x.contactId === Number(contactId)
  //   );
  //   setContact(c || null);
  // };

  // const loadMessages = async () => {
  //   const res = await fetchMessages(waAccountId, contactId);
  //   setMessages(res.messages || []);
  // };

  const handleSendText = async (text) => {
    if (!contact) return;
    // await sendTextMessage({
    //   waAccountId,
    //   phone: contact.phone,
    //   message: text,
    // });
    // await loadMessages();
  };

  return (
    <div className="flex flex-col w-full h-full">
      <ChatHeader phone={contact?.phone} />

      <div className="flex-1 bg-slate-50 overflow-y-auto p-3 space-y-1">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            No messages yet. Say hi 👋
          </div>
        )}

        {messages.map((m) => (
          <MessageBubble key={m.id} msg={m} />
        ))}
      </div>

      <MessageInput onSendText={handleSendText} />
    </div>
  );
}

export default ChatWindow;