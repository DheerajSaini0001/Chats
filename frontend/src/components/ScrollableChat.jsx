import React from "react";
import {
    isLastMessage,
    isSameSender,
    isSameSenderMargin,
    isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../context/ChatProvider";
import { motion } from "framer-motion";

const ScrollableChat = ({ messages }) => {
    const { user } = ChatState();

    return (
        <div className="overflow-x-hidden pb-4">
            {messages &&
                messages.map((m, i) => {
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
                                style={{
                                    backgroundColor: isMyMessage ? "#6366f1" : "rgba(30, 41, 59, 0.8)", // Indigo-500 vs Slate-800/80
                                    color: isMyMessage ? "white" : "#e2e8f0",
                                    borderRadius: borderRadius,
                                    padding: "10px 18px",
                                    maxWidth: "75%",
                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                    fontSize: "15px",
                                    lineHeight: "1.6",
                                    backdropFilter: !isMyMessage ? "blur(8px)" : "none",
                                    border: !isMyMessage ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
                                }}
                                className={`${isMyMessage ? "bg-gradient-to-br from-indigo-500 to-blue-600" : ""}`}
                            >
                                {m.content}
                                <div className={`text-[10px] mt-1 text-right ${isMyMessage ? "text-indigo-200" : "text-slate-400"}`}>
                                    {/* Timestamp placeholder - could use moment.js here */}
                                    {/* {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} */}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
        </div>
    );
};

export default ScrollableChat;
