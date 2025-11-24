import React, { useEffect, useState, useRef } from "react";
import { ChatState } from "../context/ChatProvider";
import axios from "axios";
import io from "socket.io-client";
import ScrollableChat from "./ScrollableChat";
import { getSender, getSenderFull } from "../config/ChatLogics";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import ProfileModal from "./miscellanous/ProfileModal";
import { uploadFileToCloudinary } from "../utils/fileUpload";

const ENDPOINT = "http://localhost:5001";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [profileUser, setProfileUser] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    const { user, selectedChat, setSelectedChat, notification, setNotification } =
        ChatState();

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };

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

    const sendMessage = async (event, attachment = null) => {
        if ((event?.key === "Enter" || event === null) && (newMessage || attachment)) {
            socket.emit("stop typing", selectedChat._id);
            try {
                const config = {
                    headers: {
                        "Content-type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                };

                const messageData = {
                    chatId: selectedChat._id,
                };

                if (newMessage) {
                    messageData.content = newMessage;
                }

                if (attachment) {
                    messageData.attachment = attachment;
                }

                setNewMessage("");
                const { data } = await axios.post(
                    "/api/message",
                    messageData,
                    config
                );
                socket.emit("new message", data);
                setMessages([...messages, data]);
            } catch (error) {
                alert("Error Occured: " + error.message);
            }
        }
    };

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            setUploadProgress(0);

            const attachment = await uploadFileToCloudinary(file, (progress) => {
                setUploadProgress(progress);
            });

            setUploading(false);
            setUploadProgress(0);

            // Send message with attachment
            await sendMessage(null, attachment);

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (error) {
            alert("Error uploading file: " + error.message);
            setUploading(false);
            setUploadProgress(0);
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
                    <div className="text-xl md:text-2xl pb-3 px-4 py-3 w-full font-sans flex justify-between items-center border-b border-white/5 bg-white/5 sticky top-0 z-10 ">
                        <button
                            className="md:hidden flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-colors text-white"
                            onClick={() => setSelectedChat("")}
                        >
                            <i className="fas fa-arrow-left"></i>
                        </button>

                        <div className="flex items-center gap-3">
                            {!selectedChat.isGroupChat ? (
                                <>
                                    <button
                                        onClick={() => {
                                            setProfileUser(getSenderFull(user, selectedChat.users));
                                            setIsProfileOpen(true);
                                        }}
                                        className="flex items-center gap-3 hover:bg-white/5 p-2 rounded-lg transition-colors"
                                    >
                                        <div className="relative">
                                            <img
                                                src={getSenderFull(user, selectedChat.users).pic}
                                                alt="Profile"
                                                className="w-10 h-10 rounded-full object-cover border border-primary/20 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                                            />
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-bg shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className="font-semibold text-white text-lg tracking-wide">
                                                {getSender(user, selectedChat.users)}
                                            </span>
                                            <span className="text-xs text-primary/80 font-medium">Online</span>
                                        </div>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                                        {selectedChat.chatName[0].toUpperCase()}
                                    </div>
                                    <span className="font-semibold text-white text-lg tracking-wide">
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
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
                            </div>
                        ) : (
                            <div className="messages flex flex-col overflow-y-scroll scrollbar-hide px-2">
                                <ScrollableChat messages={messages} />
                                {isTyping ? (
                                    <div className="mb-4 flex items-center gap-2 text-gray-400 text-sm">
                                        <Lottie
                                            options={defaultOptions}
                                            width={70}
                                            style={{ marginBottom: 0, marginLeft: 0 }}
                                        />
                                        <span>
                                            Typing...
                                        </span>
                                    </div>
                                ) : (
                                    <></>
                                )}

                                {/* Upload Progress */}
                                {uploading && (
                                    <div className="mb-4 p-4 bg-white/5 border border-white/10 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-300">Uploading file...</span>
                                            <span className="text-sm text-cyan-400">{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-white/10 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                <div className="relative flex items-center gap-2 group">
                                    {/* Hidden file input */}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                        disabled={uploading}
                                        accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                                    />

                                    {/* Attach file button */}
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="p-3 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Attach file"
                                    >
                                        <i className="fas fa-paperclip text-gray-400 hover:text-cyan-400 transition-colors"></i>
                                    </button>
                                    <input
                                        className="flex-1 p-4 pl-5 rounded-xl outline-none text-sm transition-all placeholder-gray-500 bg-white/5 border border-white/5 text-gray-200 focus:border-primary/50 focus:bg-white/10 focus:shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                                        placeholder="Type a message..."
                                        onChange={typingHandler}
                                        value={newMessage}
                                        onKeyDown={sendMessage}
                                        disabled={uploading}
                                    />
                                    <button
                                        onClick={(e) => sendMessage(null)}
                                        disabled={uploading || !newMessage}
                                        className="p-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white transition-colors shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <i className="fas fa-paper-plane"></i>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                    <div className="bg-white/5 p-6 rounded-full mb-4  border border-white/5 shadow-2xl">
                        <i className="fas fa-comments text-5xl text-primary drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]"></i>
                    </div>
                    <p className="text-3xl font-bold text-white mb-2 tracking-tight font-sans">
                        Welcome to Talk-A-Tive
                    </p>
                    <p className="text-gray-400 text-lg">
                        Select a chat to start messaging
                    </p>
                </div>
            )}

            {/* Profile Modal */}
            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={profileUser}
            />
        </>
    );
};

export default SingleChat;
