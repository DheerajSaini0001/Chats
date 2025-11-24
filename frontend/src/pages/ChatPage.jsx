import { ChatState } from "../context/ChatProvider";
import { useState } from "react";
import SideDrawer from "../components/miscellanous/SideDrawer";
import MyChats from "../components/MyChats";
import ChatBox from "../components/ChatBox";
import AnimatedBackground from "../components/AnimatedBackground";

const ChatPage = () => {
    const { user } = ChatState();
    const [fetchAgain, setFetchAgain] = useState(false);

    return (
        <div className="w-full relative overflow-hidden bg-white dark:bg-[#09090b] transition-colors duration-300 min-h-screen">
            {/* Animated Background */}
            <AnimatedBackground />

            <div className="relative z-10">
                {user && <SideDrawer />}
                <div className="flex justify-between w-full h-[91.5vh] p-2.5">
                    {user && <MyChats fetchAgain={fetchAgain} />}
                    {user && (
                        <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
