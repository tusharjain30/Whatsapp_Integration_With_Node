const MessageBubble = ({ msg }) => {
  const isMe = msg.direction === "OUTBOUND";

  return (
    <div className={`flex mb-2 ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] px-3 py-2 rounded-lg shadow-sm text-sm break-words ${isMe ? "bg-emerald-200" : "bg-white"
          }`}
      >
        {/* MEDIA HANDLING */}
        {msg.messageType === "image" && msg.mediaUrl && (
          <img
            src={msg.mediaUrl}
            alt=""
            className="rounded mb-1 max-h-56 object-cover"
          />
        )}

        {msg.messageType === "document" && msg.mediaUrl && (
          <a
            href={msg.mediaUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-blue-600 underline mb-1"
          >
            📄 {msg.fileName || "Document"}
          </a>
        )}

        {msg.messageType === "video" && msg.mediaUrl && (
          <video
            src={msg.mediaUrl}
            controls
            className="rounded mb-1 max-h-56"
          />
        )}

        {msg.messageType === "audio" && msg.mediaUrl && (
          <audio src={msg.mediaUrl} controls className="mb-1 w-full" />
        )}

        {/* TEXT / CAPTION */}
        {msg.text && <p>{msg.text}</p>}

        <div className="text-[10px] text-slate-500 text-right mt-1">
          {msg.timestamp &&
            new Date(msg.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;