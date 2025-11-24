import React, { useEffect, useState } from "react";
import { ChatState } from "../context/ChatProvider";
import axios from "axios";
import io from "socket.io-client";
import ScrollableChat from "./ScrollableChat";
import { getSender, getSenderFull } from "../config/ChatLogics";

const ENDPOINT = "http://localhost:5001";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const { user, selectedChat, setSelectedChat, notification, setNotification } =
        ChatState();

    const fetchMessages = async () => {
        if (!selectedChat) return;

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            setLoading(true);

            const { data } = await axios.get(
                `/api/message/${selectedChat._id}`,
                config
            );

            setMessages(data);
            setLoading(false);

            socket.emit("join chat", selectedChat._id);
        } catch (error) {
            alert("Error Occured: " + error.message);
        }
    };

    const sendMessage = async (event) => {
        if (event.key === "Enter" && newMessage) {
            socket.emit("stop typing", selectedChat._id);
            try {
                const config = {
                    headers: {
                        "Content-type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                setNewMessage("");
                const { data } = await axios.post(
                    "/api/message",
                    {
                        content: newMessage,
                        chatId: selectedChat._id,
                    },
                    config
                );
                socket.emit("new message", data);
                setMessages([...messages, data]);
            } catch (error) {
                alert("Error Occured: " + error.message);
            }
        }
    };

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));
    }, []);

    useEffect(() => {
        fetchMessages();
        selectedChatCompare = selectedChat;
    }, [selectedChat]);

    useEffect(() => {
        socket.on("message recieved", (newMessageRecieved) => {
            if (
                !selectedChatCompare ||
                selectedChatCompare._id !== newMessageRecieved.chat._id
            ) {
                if (!notification.includes(newMessageRecieved)) {
                    setNotification([newMessageRecieved, ...notification]);
                    setFetchAgain(!fetchAgain);
                }
            } else {
                setMessages([...messages, newMessageRecieved]);
            }
        });
    });

    const typingHandler = (e) => {
        setNewMessage(e.target.value);

        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }
        let lastTypingTime = new Date().getTime();
        var timerLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    };

    return (
        <>
            {selectedChat ? (
                <>
                    <div className="text-xl md:text-2xl pb-3 px-4 py-3 w-full font-sans flex justify-between items-center glass-header sticky top-0 z-10">
                        <button
                            className="md:hidden flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-colors text-white"
                            onClick={() => setSelectedChat("")}
                        >
                            <i className="fas fa-arrow-left"></i>
                        </button>

                        <div className="flex items-center gap-3">
                            {!selectedChat.isGroupChat ? (
                                <>
                                    <div className="relative">
                                        <img
                                            src={getSenderFull(user, selectedChat.users).pic}
                                            alt="Profile"
                                            className="w-10 h-10 rounded-full object-cover border border-white/20"
                                        />
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0f172a]"></div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-white text-lg">
                                            {getSender(user, selectedChat.users)}
                                        </span>
                                        <span className="text-xs text-gray-400">Online</span>
                                    </div>
                                    {/* <ProfileModal user={getSenderFull(user, selectedChat.users)} /> */}
                                </>
                            ) : (
                                <>
                                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold border border-white/20">
                                        {selectedChat.chatName[0].toUpperCase()}
                                    </div>
                                    <span className="font-semibold text-white text-lg">
                                        {selectedChat.chatName.toUpperCase()}
                                    </span>
                                    {/* <UpdateGroupChatModal
                                        fetchAgain={fetchAgain}
                                        setFetchAgain={setFetchAgain}
                                        fetchMessages={fetchMessages}
                                    /> */}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col justify-end p-3 bg-transparent w-full h-full overflow-y-hidden">
                        {loading ? (
                            <div className="self-center m-auto">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                            </div>
                        ) : (
                            <div className="messages flex flex-col overflow-y-scroll scrollbar-hide px-2">
                                <ScrollableChat messages={messages} />
                            </div>
                        )}

                        <div className="mt-3" onKeyDown={sendMessage}>
                            {isTyping ? (
                                <div className="mb-2 ml-2">
                                    <span className="bg-gray-800/50 text-gray-300 text-xs px-3 py-1 rounded-full animate-pulse">
                                        Typing...
                                    </span>
                                </div>
                            ) : (
                                <></>
                            )}
                            <div className="relative flex items-center">
                                <input
                                    className="glass-input w-full p-4 pl-5 rounded-xl outline-none text-sm transition-all placeholder-gray-400"
                                    placeholder="Type a message..."
                                    onChange={typingHandler}
                                    value={newMessage}
                                />
                                <button className="absolute right-3 p-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors shadow-lg">
                                    <i className="fas fa-paper-plane"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                    <div className="bg-white/5 p-6 rounded-full mb-4 backdrop-blur-sm">
                        <i className="fas fa-comments text-5xl text-indigo-400"></i>
                    </div>
                    <p className="text-3xl font-bold text-white mb-2 tracking-tight">
                        Welcome to Talk-A-Tive
                    </p>
                    <p className="text-gray-400 text-lg">
                        Select a chat to start messaging
                    </p>
                </div>
            )}
        </>
    );
};

export default SingleChat;
