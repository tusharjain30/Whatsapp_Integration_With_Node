import clsx from "clsx";

const ContactItems = ({ contact, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-full flex flex-col px-4 py-3 text-left hover:bg-slate-100 border-b border-slate-100",
        active && "bg-slate-100"
      )}
    >
      <div className="flex justify-between items-center">
        <span className="font-medium text-sm truncate">{contact.phone}</span>
        {contact.lastMessageAt && (
          <span className="text-[11px] text-slate-400">
            {new Date(contact.lastMessageAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
      {contact.lastMessage && (
        <span className="text-xs text-slate-500 truncate">
          {contact.lastMessage}
        </span>
      )}
    </button>

  );
}

export default ContactItems;
