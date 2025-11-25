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
            bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl w-full md:w-[31%] 
            rounded-2xl border border-slate-200/50 dark:border-white/10 
            overflow-hidden h-full shadow-xl relative transition-all duration-300`}
        >
            {/* Header */}
            <div className="px-6 py-5 w-full flex justify-between items-center border-b border-slate-200/50 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 z-10">
                <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400 text-transparent bg-clip-text">
                    Chats
                </span>
                <GroupChatModal>
                    <button className="flex items-center gap-2 text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2.5 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 active:scale-95">
                        <span className="text-lg leading-none">+</span>
                        <span>NEW GROUP</span>
                    </button>
                </GroupChatModal>
            </div>

            {/* Chat List */}
            <div className="flex flex-col w-full h-full overflow-y-hidden relative">
                {chats ? (
                    <div className="overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 hover:scrollbar-thumb-indigo-500/50 space-y-2 p-4">
                        <AnimatePresence>
                            {chats.map((chat, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: i * 0.05 }}
                                    onClick={() => setSelectedChat(chat)}
                                    className={`
                                        cursor-pointer p-3 rounded-xl transition-all duration-200 flex items-center gap-4 border relative overflow-hidden group
                                        ${selectedChat === chat
                                            ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 shadow-md"
                                            : "bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 border-transparent hover:border-slate-200 dark:hover:border-white/5"
                                        }
                                    `}
                                    key={chat._id}
                                >
                                    {/* Avatar Logic */}
                                    <div className="relative">
                                        {!chat.isGroupChat ? (
                                            <div className="relative">
                                                <img
                                                    src={getSenderFull(loggedUser, chat.users).pic}
                                                    alt="avatar"
                                                    className={`w-12 h-12 rounded-full object-cover ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 transition-all ${selectedChat === chat ? 'ring-indigo-500' : 'ring-transparent group-hover:ring-slate-200 dark:group-hover:ring-slate-700'}`}
                                                />
                                                {/* Online Status Dot (Mockup) */}
                                                <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                                            </div>
                                        ) : (
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 transition-all ${selectedChat === chat ? 'bg-indigo-600 text-white ring-indigo-500' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 ring-transparent'}`}>
                                                {chat.chatName[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className={`font-semibold text-sm truncate ${selectedChat === chat ? "text-indigo-900 dark:text-indigo-100" : "text-slate-800 dark:text-slate-200"}`}>
                                                {!chat.isGroupChat
                                                    ? getSender(loggedUser, chat.users)
                                                    : chat.chatName}
                                            </h4>
                                            {/* Time Placeholder */}
                                            {chat.latestMessage && (
                                                <span className={`text-[10px] font-medium ${selectedChat === chat ? "text-indigo-600 dark:text-indigo-300" : "text-slate-400"}`}>
                                                    {new Date(chat.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>

                                        {typingChats.has(chat._id) ? (
                                            <p className="text-xs text-indigo-500 font-semibold animate-pulse flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                                                Typing...
                                            </p>
                                        ) : (
                                            chat.latestMessage && (
                                                <p className={`text-xs truncate ${selectedChat === chat ? "text-indigo-700/80 dark:text-indigo-200/70" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`}>
                                                    <span className="font-medium mr-1 opacity-80">
                                                        {chat.latestMessage.sender._id === loggedUser?._id
                                                            ? "You:"
                                                            : chat.latestMessage.sender.name.split(" ")[0] + ":"}
                                                    </span>
                                                    {chat.latestMessage.content
                                                        ? (chat.latestMessage.content.length > 40
                                                            ? chat.latestMessage.content.substring(0, 40) + "..."
                                                            : chat.latestMessage.content)
                                                        : (chat.latestMessage.attachment
                                                            ? <span className="italic inline-flex items-center gap-1"><i className="fas fa-paperclip text-[10px]"></i> Attachment</span>
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
                    /* Refined Loading Skeletons */
                    <div className="flex flex-col space-y-4 p-6">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <div key={n} className="flex items-center space-x-4 opacity-60 animate-pulse">
                                <div className="rounded-full bg-slate-200 dark:bg-slate-700 h-12 w-12"></div>
                                <div className="flex-1 space-y-2.5">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-3/4"></div>
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