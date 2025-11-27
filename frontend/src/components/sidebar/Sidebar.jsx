import { useEffect, useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import SearchBar from "./SearchBar";
import ContactItems from "./ContactItems";
import { useDispatch, useSelector } from "react-redux";
import { fetchContactList } from "../../store/slices/ContactSlice";

const Sidebar = ({ waAccountId }) => {

  const { contactList } = useSelector((state) => state.contacts);
  // const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");  // git commit -m "Updated code"

  const dispatch = useDispatch();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    dispatch(fetchContactList(waAccountId));
  }, []);


  const currentContactId = (() => {
    const match = location.pathname.match(/\/chat\/(\d+)/);
    return match ? Number(match[1]) : null;
  })();

  return (
    <div className="w-full sm:w-[40%] md:w-[35%] lg:w-[30%] border-r border-slate-200 flex flex-col bg-white">
      <div className="px-4 py-3 bg-emerald-600 text-white text-lg font-semibold">
        ChatBot
      </div>

      <SearchBar value={search} onChange={""} />

      <div className="flex-1 overflow-y-auto">
        {contactList.length === 0 && (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            No chats yet
          </div>
        )}

        {contactList.map((c) => (
          <ContactItems
            key={c.contactId}
            contact={c}
            active={currentContactId === c.contactId}
            onClick={() => navigate(`/chat/${c.contactId}`)}
          />
        ))}
      </div>
    </div>
  );
}

export default Sidebar;