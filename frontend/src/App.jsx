import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ChatLayout from "./pages/ChatLayout";
import EmptyState from "./pages/EmptyState";
import ChatWindow from "./components/chat/ChatWindow";

const App = () => {
   return (
      <BrowserRouter>
         <Routes>
            <Route path="/" element={<ChatLayout />}>
               <Route index element={<EmptyState />} />
               <Route path="chat/:contactId" element={<ChatWindow />} />
            </Route>

            {/* redirect anything unknown */}
            <Route path="*" element={<Navigate to="/" />} />
         </Routes>
      </BrowserRouter>
   );
}

export default App;