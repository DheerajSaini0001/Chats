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
import { Send, Video, Link, ArrowLeft, Phone } from 'lucide-react';
import VideoCall from "./VideoCall";
import { motion, AnimatePresence } from "framer-motion";

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
    const [callActive, setCallActive] = useState(false);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callType, setCallType] = useState("video");
    const [incomingCall, setIncomingCall] = useState(null);
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

    const startVideoCall = () => {
        setCallType("video");
        setCallActive(true);
        socket.emit("call started", {
            chat: selectedChat,
            caller: user,
            callType: "video",
        });
    };

    const startAudioCall = () => {
        setCallType("audio");
        setCallActive(true);
        socket.emit("call started", {
            chat: selectedChat,
            caller: user,
            callType: "audio",
        });
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

        socket.on("incoming call", ({ chat, caller, callType }) => {
            setIncomingCall({ chat, caller, callType });
        });

        return () => {
            socket.off("incoming call");
        };
    }, []);

    useEffect(() => {
        fetchMessages();
        selectedChatCompare = selectedChat;
    }, [selectedChat]);

    const handleDeleteMessage = async (messageId, deleteType) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.put(
                "/api/message/delete",
                { messageId, deleteType },
                config
            );

            if (deleteType === "everyone") {
                socket.emit("message deleted", data);
            }

            // Update local state immediately
            setMessages(messages.map((m) => (m._id === messageId ? data : m)));
        } catch (error) {
            alert("Error deleting message: " + error.message);
        }
    };

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

        socket.on("message deleted", (deletedMessage) => {
            if (
                selectedChatCompare &&
                selectedChatCompare._id === deletedMessage.chat._id
            ) {
                setMessages(messages.map((m) => m._id === deletedMessage._id ? deletedMessage : m));
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
                    <div className="text-xl md:text-2xl pb-3 px-6 py-4 w-full font-sans flex justify-between items-center border-b border-slate-200/50 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-10 transition-all duration-300">
                        {/* Left Side: Back Button & Profile Info */}
                        <div className="flex items-center gap-4">
                            <button
                                className="md:hidden flex items-center justify-center p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-white"
                                onClick={() => setSelectedChat("")}
                            >
                                <ArrowLeft size={24} />
                            </button>

                            {!selectedChat.isGroupChat ? (
                                <>
                                    <button
                                        onClick={() => {
                                            setProfileUser(getSenderFull(user, selectedChat.users));
                                            setIsProfileOpen(true);
                                        }}
                                        className="flex items-center gap-3 group"
                                    >
                                        <div className="relative">
                                            <img
                                                src={getSenderFull(user, selectedChat.users).pic}
                                                alt="Profile"
                                                className="w-11 h-11 rounded-full object-cover ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-transparent group-hover:ring-indigo-500 transition-all"
                                            />
                                            <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"></div>
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                {getSender(user, selectedChat.users)}
                                            </span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Online</span>
                                        </div>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30">
                                        {selectedChat.chatName[0].toUpperCase()}
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">
                                        {selectedChat.chatName.toUpperCase()}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Right Side: Video Call Button */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={startAudioCall}
                                className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 rounded-full text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-transparent hover:border-indigo-200 dark:hover:border-indigo-500/30"
                                title="Start Audio Call"
                            >
                                <Phone size={20} />
                            </button>
                            <button
                                onClick={startVideoCall}
                                className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 rounded-full text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-transparent hover:border-indigo-200 dark:hover:border-indigo-500/30"
                                title="Start Video Call"
                            >
                                <Video size={22} />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col justify-end p-4 bg-transparent w-full flex-1 overflow-y-hidden relative">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]"></div>

                        {loading ? (
                            <div className="self-center m-auto">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 shadow-lg shadow-indigo-500/30"></div>
                            </div>
                        ) : (
                            <div className="messages flex flex-col overflow-y-scroll scrollbar-hide px-2 relative z-0">
                                <ScrollableChat messages={messages} handleDeleteMessage={handleDeleteMessage} />
                                {isTyping ? (
                                    <div className="mb-4 ml-2 flex items-center gap-2 text-slate-400 text-sm font-medium">
                                        <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full rounded-tl-none">
                                            <span className="animate-pulse">Typing...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <></>
                                )}

                                {/* Upload Progress */}
                                {uploading && (
                                    <div className="mb-4 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg mx-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{uploadProgress === 100 ? "Processing..." : "Uploading file..."}</span>
                                            <span className="text-sm font-bold text-indigo-500">{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                {/* Chat Request Logic */}
                                {(!selectedChat.isGroupChat && selectedChat.isAccepted === false) ? (
                                    selectedChat.requestedBy === user._id ? (
                                        messages.length > 0 ? (
                                            <div className="p-6 mx-auto max-w-md bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-center shadow-sm">
                                                <p className="text-indigo-600 dark:text-indigo-400 font-bold mb-2 text-lg">Request Sent</p>
                                                <p className="text-slate-600 dark:text-slate-400">You can send more messages after the user accepts your request.</p>
                                            </div>
                                        ) : (
                                            <div className="relative flex items-center gap-3 p-2">
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
                                                    className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 shadow-sm"
                                                    title="Attach file"
                                                >
                                                    <Link size={20} />
                                                </button>
                                                <input
                                                    className="flex-1 p-4 pl-6 rounded-full outline-none text-sm transition-all placeholder-slate-400 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/30 text-slate-900 dark:text-white shadow-inner focus:bg-white dark:focus:bg-slate-900"
                                                    placeholder="Send a request message..."
                                                    onChange={typingHandler}
                                                    value={newMessage}
                                                    onKeyDown={sendMessage}
                                                    disabled={uploading}
                                                />
                                                <button
                                                    onClick={(e) => sendMessage(null)}
                                                    disabled={uploading || !newMessage}
                                                    className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-full text-white transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                                                >
                                                    <Send size={20} className="text-white ml-0.5" />
                                                </button>
                                            </div>
                                        )
                                    ) : (
                                        <div className="flex flex-col items-center gap-4 p-8 mx-auto max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl">
                                            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-2">
                                                <i className="fas fa-user-plus text-2xl text-indigo-600 dark:text-indigo-400"></i>
                                            </div>
                                            <p className="text-slate-900 dark:text-white text-xl font-bold">Accept Chat Request?</p>
                                            <p className="text-slate-600 dark:text-slate-400 text-center mb-4">
                                                <span className="font-semibold text-slate-900 dark:text-white">{getSender(user, selectedChat.users)}</span> wants to send you a message.
                                            </p>
                                            <div className="flex gap-4 w-full">
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const config = {
                                                                headers: { Authorization: `Bearer ${user.token}` },
                                                            };
                                                            await axios.put("/api/chat/reject", { chatId: selectedChat._id }, config);
                                                            setSelectedChat("");
                                                            setFetchAgain(!fetchAgain);
                                                        } catch (error) {
                                                            alert("Error rejecting chat");
                                                        }
                                                    }}
                                                    className="flex-1 py-3 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 rounded-xl transition-colors font-semibold"
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const config = {
                                                                headers: { Authorization: `Bearer ${user.token}` },
                                                            };
                                                            const { data } = await axios.put("/api/chat/accept", { chatId: selectedChat._id }, config);
                                                            setSelectedChat(data);
                                                            setFetchAgain(!fetchAgain);
                                                        } catch (error) {
                                                            alert("Error accepting chat");
                                                        }
                                                    }}
                                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors shadow-lg shadow-indigo-500/30 font-semibold"
                                                >
                                                    Accept
                                                </button>
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <div className="relative flex items-center gap-3 p-2">
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
                                            className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 shadow-sm"
                                            title="Attach file"
                                        >
                                            <Link size={20} />
                                        </button>
                                        <input
                                            className="flex-1 p-4 pl-6 rounded-full outline-none text-sm transition-all placeholder-slate-400 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/30 text-slate-900 dark:text-white shadow-inner focus:bg-white dark:focus:bg-slate-900"
                                            placeholder="Type a message..."
                                            onChange={typingHandler}
                                            value={newMessage}
                                            onKeyDown={sendMessage}
                                            disabled={uploading}
                                        />
                                        <button
                                            onClick={(e) => sendMessage(null)}
                                            disabled={uploading || !newMessage}
                                            className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-full text-white transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                                        >
                                            <Send size={20} className="text-white ml-0.5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Incoming Call Modal */}
                    <AnimatePresence>
                        {incomingCall && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.5, opacity: 0 }}
                                    className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center gap-6 max-w-sm w-full"
                                >
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20"></div>
                                        <img
                                            src={incomingCall.caller.pic}
                                            alt={incomingCall.caller.name}
                                            className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-xl relative z-10"
                                        />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{incomingCall.caller.name}</h3>
                                        <p className="text-indigo-500 font-medium animate-pulse">Incoming {incomingCall.callType} Call...</p>
                                    </div>
                                    <div className="flex gap-6 w-full justify-center">
                                        <button
                                            onClick={() => {
                                                socket.emit("call rejected", { to: incomingCall.caller._id });
                                                setIncomingCall(null);
                                            }}
                                            className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all shadow-lg shadow-red-500/30 hover:scale-110"
                                        >
                                            <Phone size={28} className="rotate-[135deg]" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setCallType(incomingCall.callType);
                                                setCallAccepted(true);
                                                setCallActive(true);
                                                setIncomingCall(null);
                                            }}
                                            className="p-4 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all shadow-lg shadow-green-500/30 hover:scale-110 animate-bounce"
                                        >
                                            <Phone size={28} />
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Video Call Component */}
                    {callActive && (
                        <div className="fixed inset-0 z-[100] bg-black">
                            <VideoCall
                                channelName={selectedChat._id}
                                user={user}
                                callType={callType}
                                onLeave={() => {
                                    setCallActive(false);
                                    setCallAccepted(false);
                                    socket.emit("call ended", { to: selectedChat._id });
                                }}
                                isAudioOnly={callType === 'audio'}
                            />
                        </div>
                    )}

                    {/* Profile Modal */}
                    <ProfileModal
                        isOpen={isProfileOpen}
                        onClose={() => setIsProfileOpen(false)}
                        user={profileUser}
                        isOwnProfile={false}
                    />
                </>
            ) : (
                <div className="flex items-center justify-center h-full flex-col gap-8 text-center p-10 relative overflow-hidden">
                    {/* Background Pattern for Welcome Screen */}
                    <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.07] pointer-events-none bg-[radial-gradient(#6366f1_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>

                    <div className="relative z-10 group">
                        <div className="absolute inset-0 bg-indigo-500/30 blur-[60px] rounded-full animate-pulse-slow"></div>
                        <img
                            src="/logo.png"
                            alt="Logo"
                            className="w-40 h-40 object-contain relative z-10 drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => e.target.style.display = 'none'}
                        />
                    </div>

                    <div className="space-y-4 relative z-10 max-w-2xl">
                        <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-800 dark:text-white drop-shadow-sm">
                            Welcome to <br />
                            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">Talk-A-Tive</span>
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 text-xl font-medium leading-relaxed">
                            Select a chat from the sidebar to start messaging or create a new group to connect with friends.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default SingleChat;
