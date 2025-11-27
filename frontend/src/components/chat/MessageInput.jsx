import { useState } from "react";

const MessageInput = ({ onSendText }) => {
  const [value, setValue] = useState("");

  const handleSend = () => {
    const text = value.trim();
    if (!text) return;
    onSendText(text);
    setValue("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-16 px-3 flex items-center gap-2 bg-slate-100 border-t border-slate-200">
      {/* Attachment buttons (future: open file picker etc.) */}
      <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-200">
        📎
      </button>

      <textarea
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        className="flex-1 resize-none px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 outline-none focus:border-emerald-500"
        placeholder="Type a message"
      />

      <button
        onClick={handleSend}
        className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600"
      >
        Send
      </button>
    </div>
  );
}

export default MessageInput;
