import React, { useEffect, useState } from "react";
import { ChatState } from "../context/ChatProvider";
import axios from "axios";
import { getSender } from "../config/ChatLogics";
import GroupChatModal from "./miscellanous/GroupChatModal";

const MyChats = ({ fetchAgain }) => {
    const [loggedUser, setLoggedUser] = useState();
    const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

    const fetchChats = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.get("/api/chat", config);
            setChats(data);
        } catch (error) {
            alert("Error Occured: " + error.message);
        }
    };

    useEffect(() => {
        setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
        fetchChats();
    }, [fetchAgain]);

    return (
        <div
            className={`${selectedChat ? "hidden" : "flex"
                } md:flex flex-col items-center p-0 bg-transparent w-full md:w-[31%] rounded-xl glass overflow-hidden h-full`}
        >
            <div className="pb-3 px-4 py-4 text-xl font-bold text-white flex w-full justify-between items-center glass-header">
                My Chats
                <GroupChatModal>
                    <button className="flex items-center text-xs bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-3 py-2 rounded-lg hover:bg-indigo-600/40 transition-all font-medium backdrop-blur-md">
                        <span className="mr-1 text-lg">+</span> New Group
                    </button>
                </GroupChatModal>
            </div>
            <div className="flex flex-col p-2 w-full h-full overflow-y-hidden">
                {chats ? (
                    <div className="overflow-y-scroll scrollbar-hide space-y-2 px-1 py-2">
                        {chats.map((chat) => (
                            <div
                                onClick={() => setSelectedChat(chat)}
                                className={`cursor-pointer px-4 py-3 rounded-xl transition-all duration-200 flex items-center border ${selectedChat === chat
                                        ? "bg-indigo-600 text-white shadow-lg border-indigo-500"
                                        : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border-transparent hover:border-white/5"
                                    }`}
                                key={chat._id}
                            >
                                <div className="flex-1">
                                    <p className="font-medium text-base">
                                        {!chat.isGroupChat
                                            ? getSender(loggedUser, chat.users)
                                            : chat.chatName}
                                    </p>
                                    {chat.latestMessage && (
                                        <p className={`text-xs mt-1 truncate ${selectedChat === chat ? "text-indigo-200" : "text-gray-500"}`}>
                                            <span className="font-bold">{chat.latestMessage.sender.name}: </span>
                                            {chat.latestMessage.content.length > 50
                                                ? chat.latestMessage.content.substring(0, 51) + "..."
                                                : chat.latestMessage.content}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex justify-center items-center h-full text-gray-400">
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="h-4 w-32 bg-gray-700 rounded mb-2"></div>
                            <div className="h-4 w-24 bg-gray-700 rounded"></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyChats;
