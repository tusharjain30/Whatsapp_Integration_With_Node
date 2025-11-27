import { Outlet } from "react-router-dom";
import  Sidebar  from "../components/sidebar/Sidebar";

const ChatLayout = () => {
    // abhi hard-coded, baad me login se aa sakta hai
    const waAccountId = 1;

    return (
        <div className="h-screen flex bg-slate-900 justify-center items-center">
            <div className="w-full h-full md:h-[90vh] md:w-[95vw] lg:w-[80vw] bg-white rounded-none md:rounded-2xl shadow-lg overflow-hidden flex">

                <Sidebar waAccountId={waAccountId} />
                <div className="flex-1 bg-slate-100 hidden sm:flex">
                    <Outlet context={{ waAccountId }} />
                </div>

                {/* Mobile: chat / sidebar full-screen, router still works.
            We'll let Outlet render full width on mobile in a different route if needed */}
            </div>
        </div>
    );
}

export default ChatLayout;
