import React, { useEffect, useState } from "react";
import { ChatState } from "../context/ChatProvider";
import axios from "axios";
import { getSender, getSenderFull } from "../config/ChatLogics";
import GroupChatModal from "./miscellanous/GroupChatModal";
import { motion, AnimatePresence } from "framer-motion";
import io from "socket.io-client";

const ENDPOINT = "http://localhost:5001";
var socket;

const MyChats = ({ fetchAgain }) => {
    const [loggedUser, setLoggedUser] = useState();
    const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
    const [typingChats, setTypingChats] = useState(new Set());

    useEffect(() => {
        setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
        fetchChats();
    }, [fetchAgain]);

    useEffect(() => {
        if (user) {
            socket = io(ENDPOINT);
            socket.emit("setup", user);

            socket.on("typing", (room) => {
                setTypingChats(prev => new Set(prev).add(room));
            });

            socket.on("stop typing", (room) => {
                setTypingChats(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(room);
                    return newSet;
                });
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [user]);

    const fetchChats = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.get("/api/chat", config);
            setChats(data);

            // Join all chat rooms to receive typing events
            if (socket) {
                data.forEach(chat => {
                    socket.emit("join chat", chat._id);
                });
            }
        } catch (error) {
            alert("Error Occured: " + error.message);
        }
    };

    // Re-join rooms if chats update and socket exists
    useEffect(() => {
        if (socket && chats) {
            chats.forEach(chat => {
                socket.emit("join chat", chat._id);
            });
        }
    }, [chats]);

    return (
        <div
            className={`${selectedChat ? "hidden" : "flex"} 
            md:flex flex-col items-center p-0 
            bg-white/80 dark:bg-gray-900/90 w-full md:w-[31%] 
            rounded-xl border border-gray-200 dark:border-white/5 
            overflow-hidden h-full shadow-2xl relative transition-colors duration-300`}
        >
            {/* Header */}
            <div className="pb-3 px-4 py-4 text-xl font-bold flex w-full justify-between items-center border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5 z-10 transition-colors duration-300">
                <span className="tracking-wider font-sans bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-purple-600 dark:from-cyan-400 dark:to-purple-400">
                    CHATS
                </span>
                <GroupChatModal>
                    <button className="flex items-center text-xs bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/50 px-3 py-2 rounded-lg hover:bg-cyan-500/20 transition-all font-medium shadow-[0_0_10px_rgba(6,182,212,0.2)] hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95">
                        <span className="mr-1 text-lg">+</span> NEW GROUP
                    </button>
                </GroupChatModal>
            </div>

            {/* Chat List */}
            <div className="flex flex-col w-full h-full overflow-y-hidden relative bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-opacity-5">
                {chats ? (
                    <div className="overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-white/10 hover:scrollbar-thumb-cyan-500/50 space-y-2 px-3 py-4">
                        <AnimatePresence>
                            {chats.map((chat, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: i * 0.05 }}
                                    onClick={() => setSelectedChat(chat)}
                                    className={`
                                        cursor-pointer px-3 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 border relative overflow-hidden group
                                        ${selectedChat === chat
                                            ? "bg-gradient-to-r from-cyan-500/20 to-transparent border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                                            : "bg-gray-100/50 dark:bg-white/5 hover:bg-gray-200/50 dark:hover:bg-white/10 border-transparent hover:border-gray-300 dark:hover:border-white/10"
                                        }
                                    `}
                                    key={chat._id}
                                >
                                    {/* Active Indicator Strip */}
                                    {selectedChat === chat && (
                                        <motion.div
                                            layoutId="active-strip"
                                            className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_10px_cyan]"
                                        />
                                    )}

                                    {/* Avatar Logic */}
                                    <div className="relative">
                                        {!chat.isGroupChat ? (
                                            <img
                                                src={getSenderFull(loggedUser, chat.users).pic}
                                                alt="avatar"
                                                className={`w-10 h-10 rounded-full object-cover border-2 ${selectedChat === chat ? 'border-cyan-400' : 'border-gray-300 dark:border-transparent group-hover:border-gray-400 dark:group-hover:border-white/20'}`}
                                            />
                                        ) : (
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${selectedChat === chat ? 'bg-cyan-900 text-cyan-200 border-cyan-500' : 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300 border-transparent'}`}>
                                                {chat.chatName[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex justify-between items-center">
                                            <p className={`font-medium text-sm tracking-wide ${selectedChat === chat ? "text-cyan-700 dark:text-cyan-100" : "text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white"}`}>
                                                {!chat.isGroupChat
                                                    ? getSender(loggedUser, chat.users)
                                                    : chat.chatName}
                                            </p>
                                        </div>

                                        {typingChats.has(chat._id) ? (
                                            <p className="text-xs mt-1 text-green-500 font-medium italic animate-pulse">
                                                Typing...
                                            </p>
                                        ) : (
                                            chat.latestMessage && (
                                                <p className="text-xs mt-1 truncate text-gray-500 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors">
                                                    <span className={`${selectedChat === chat ? "text-cyan-600 dark:text-cyan-400" : "text-gray-500 dark:text-gray-400"} font-medium mr-1`}>
                                                        {chat.latestMessage.sender._id === loggedUser?._id
                                                            ? "You:"
                                                            : chat.latestMessage.sender.name + ":"}
                                                    </span>
                                                    {chat.latestMessage.content
                                                        ? (chat.latestMessage.content.length > 50
                                                            ? chat.latestMessage.content.substring(0, 51) + "..."
                                                            : chat.latestMessage.content)
                                                        : (chat.latestMessage.attachment
                                                            ? <span className="italic flex items-center gap-1"><i className="fas fa-paperclip"></i> Attachment</span>
                                                            : "")
                                                    }
                                                </p>
                                            )
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    /* Holographic Loading Skeletons */
                    <div className="flex flex-col space-y-4 p-4">
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className="flex items-center space-x-3 opacity-50 animate-pulse">
                                <div className="rounded-full bg-gray-200 dark:bg-white/10 h-10 w-10"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-1/3"></div>
                                    <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-3/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyChats;