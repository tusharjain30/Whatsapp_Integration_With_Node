const ChatHeader = ({ phone }) => {
  if (!phone) return null;
  return (
    <div className="h-14 px-4 flex items-center justify-between bg-slate-100 border-b border-slate-200">
      <div>
        <div className="font-medium text-sm">{phone}</div>
        <div className="text-xs text-emerald-500">online</div>
      </div>
    </div>
  );
}

export default ChatHeader;
