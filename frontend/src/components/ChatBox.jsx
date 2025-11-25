import React from "react";
import { ChatState } from "../context/ChatProvider";
import SingleChat from "./SingleChat";

const ChatBox = ({ fetchAgain, setFetchAgain }) => {
    const { selectedChat } = ChatState();

    return (
        <div
            className={`
                ${selectedChat ? "flex" : "hidden"} md:flex 
                flex-col items-center 
                p-0 
                w-full md:w-[68%] 
                h-full 
                rounded-2xl 
                ${selectedChat ? "bg-white/80 dark:bg-slate-900/80" : "bg-white/40 dark:bg-slate-900/40"} backdrop-blur-xl 
                border border-slate-200/50 dark:border-white/10 
                shadow-xl 
                overflow-hidden 
                relative 
                transition-all duration-300
            `}
        >
            <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        </div>
    );
};

export default ChatBox;