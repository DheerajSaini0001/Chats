import React from "react";
import {
    isLastMessage,
    isSameSender,
    isSameSenderMargin,
    isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../context/ChatProvider";
import { motion } from "framer-motion";
import FileMessage from "./FileMessage";

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
                                className={`px-4 py-2 max-w-[75%] shadow-md text-[15px] leading-relaxed relative group
                                    ${isMyMessage
                                        ? "bg-chat-bubble-me text-white shadow-[0_4px_15px_rgba(8,145,178,0.3)]"
                                        : "bg-chat-bubble-friend text-gray-200 border border-white/5 shadow-[0_4px_15px_rgba(0,0,0,0.2)]"}
                                `}
                                style={{
                                    borderRadius: borderRadius
                                }}
                            >
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

                                <div className={`text-[10px] mt-1 text-right ${isMyMessage ? "text-cyan-100" : "text-gray-400"}`}>
                                    {/* Timestamp placeholder */}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
        </div>
    );
};

export default ScrollableChat;
