import React from "react";
import { ChatState } from "../context/ChatProvider";
import SingleChat from "./SingleChat";

const ChatBox = ({ fetchAgain, setFetchAgain }) => {
    const { selectedChat } = ChatState();

    return (
        <div
            className={`${selectedChat ? "flex" : "hidden"
                } md:flex flex-col items-center p-0 bg-transparent w-full md:w-[68%] rounded-xl glass overflow-hidden h-full`}
        >
            <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        </div>
    );
};

export default ChatBox;
