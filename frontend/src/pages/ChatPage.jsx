import { ChatState } from "../context/ChatProvider";
import { useState } from "react";
import SideDrawer from "../components/miscellanous/SideDrawer";
import MyChats from "../components/MyChats";
import ChatBox from "../components/ChatBox";

const ChatPage = () => {
    const { user } = ChatState();
    const [fetchAgain, setFetchAgain] = useState(false);

    return (
        <div style={{ width: "100%" }}>
            {user && <SideDrawer />}
            <div className="flex justify-between w-full h-[91.5vh] p-2.5">
                {user && <MyChats fetchAgain={fetchAgain} />}
                {user && (
                    <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
                )}
            </div>
        </div>
    );
};

export default ChatPage;
