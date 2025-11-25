import React, { useState } from "react";
import {
    isLastMessage,
    isSameSender,
    isSameSenderMargin,
    isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../context/ChatProvider";
import { motion } from "framer-motion";
import FileMessage from "./FileMessage";

const ScrollableChat = ({ messages, handleDeleteMessage }) => {
    const { user } = ChatState();
    const [activeMessageId, setActiveMessageId] = useState(null);

    return (
        <div className="overflow-x-hidden pb-4">
            {messages &&
                messages.map((m, i) => {
                    // If deleted for me, don't render
                    if (m.deletedBy && m.deletedBy.includes(user._id)) return null;

                    const isMyMessage = m.sender._id === user._id;
                    const isSameSenderAsNext =
                        i < messages.length - 1 &&
                        messages[i + 1].sender._id === m.sender._id;
                    const isSameSenderAsPrev =
                        i > 0 && messages[i - 1].sender._id === m.sender._id;

                    // Border Radius Logic
                    const borderRadius = isMyMessage
                        ? `${isSameSenderAsPrev ? "4px" : "20px"} 20px ${isSameSenderAsNext ? "4px" : "20px"
                        } 20px`
                        : `20px ${isSameSenderAsPrev ? "4px" : "20px"} 20px ${isSameSenderAsNext ? "4px" : "20px"
                        }`;

                    return (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            style={{ display: "flex" }}
                            key={m._id}
                            className={`mb-${isSameSenderAsNext ? "1" : "4"} ${isMyMessage ? "justify-end" : "justify-start"
                                }`}
                        >
                            {/* Avatar for Friend's Last Message in Group */}
                            {!isMyMessage &&
                                (isSameSender(messages, m, i, user._id) ||
                                    isLastMessage(messages, i, user._id)) && (
                                    <div
                                        className="mt-1 mr-2 cursor-pointer self-end"
                                        title={m.sender.name}
                                    >
                                        <img
                                            className="rounded-full w-8 h-8 object-cover shadow-md border border-white/10"
                                            src={m.sender.pic}
                                            alt={m.sender.name}
                                        />
                                    </div>
                                )}

                            {/* Spacer for alignment if no avatar */}
                            {!isMyMessage &&
                                !(
                                    isSameSender(messages, m, i, user._id) ||
                                    isLastMessage(messages, i, user._id)
                                ) && <div className="w-10 mr-0"></div>}

                            <div
                                className={`px-4 py-2 max-w-[75%] text-[15px] leading-relaxed relative group transition-all duration-200
                                    ${isMyMessage
                                        ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none hover:shadow-md transition-shadow"}
                                `}
                                style={{
                                    borderRadius: borderRadius
                                }}
                                onMouseLeave={() => setActiveMessageId(null)}
                            >
                                {m.isDeletedForEveryone ? (
                                    <div className="italic text-sm opacity-70 flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                        <i className="fas fa-ban text-xs"></i> This message was deleted
                                    </div>
                                ) : (
                                    <>
                                        {/* Display file attachment if exists */}
                                        {m.attachment && (
                                            <FileMessage attachment={m.attachment} isSender={isMyMessage} />
                                        )}

                                        {/* Display text content if exists */}
                                        {m.content && (
                                            <div className={m.attachment ? "mt-2" : ""}>
                                                {m.content}
                                            </div>
                                        )}

                                        {/* Dropdown Trigger */}
                                        <button
                                            className={`absolute top-1 right-1 p-1 rounded-full text-xs transition-all duration-200 ${activeMessageId === m._id ? "opacity-100 bg-black/10 dark:bg-white/10" : "opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10"}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMessageId(activeMessageId === m._id ? null : m._id);
                                            }}
                                        >
                                            <i className={`fas fa-ellipsis-v w-4 h-4 flex items-center justify-center ${isMyMessage ? "text-white/90" : "text-slate-500 dark:text-slate-400"}`}></i>
                                        </button>

                                        {/* Dropdown Menu */}
                                        {activeMessageId === m._id && (
                                            <div className="absolute top-8 right-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-xl shadow-2xl z-50 w-44 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                                <button
                                                    className="px-4 py-2.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700/50 text-red-500 dark:text-red-400 transition-colors flex items-center gap-3 font-medium"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteMessage(m._id, "me");
                                                        setActiveMessageId(null);
                                                    }}
                                                >
                                                    <i className="fas fa-trash-alt text-xs opacity-70"></i> Delete for me
                                                </button>
                                                {m.sender._id === user._id && (
                                                    <button
                                                        className="px-4 py-2.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700/50 text-red-500 dark:text-red-400 transition-colors border-t border-slate-200/50 dark:border-slate-700/50 flex items-center gap-3 font-medium"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteMessage(m._id, "everyone");
                                                            setActiveMessageId(null);
                                                        }}
                                                    >
                                                        <i className="fas fa-globe text-xs opacity-70"></i> Delete for everyone
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                                <div className={`text-[10px] mt-1 text-right font-medium opacity-80 ${isMyMessage ? "text-blue-100" : "text-slate-400 dark:text-slate-500"}`}>
                                    {/* Timestamp placeholder - could be real time if available in 'm' */}
                                    {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
        </div>
    );
};

export default ScrollableChat;
