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
                h-full // Ensures it takes full height of the container
                rounded-xl 
                bg-dark-bg/80 // Semi-transparent dark background
                border border-white/10 // Subtle glass edge
                shadow-[0_0_50px_rgba(0,0,0,0.5)] // Deep shadow for "floating" depth
                overflow-hidden // Clips content to rounded corners
                relative // For positioning internal absolute elements
            `}
        >
            <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        </div>
    );
};

export default ChatBox;