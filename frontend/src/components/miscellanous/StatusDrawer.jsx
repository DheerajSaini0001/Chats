import React, { useState, useEffect, useRef } from "react";
import { ChatState } from "../../context/ChatProvider";
import axios from "axios";
import { uploadFileToCloudinary } from "../../utils/fileUpload";
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react";

const StatusDrawer = ({ isOpen, onClose }) => {
    const { user } = ChatState();
    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [viewingUser, setViewingUser] = useState(null); // User whose statuses we are viewing
    const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
    const fileInputRef = useRef(null);

    const fetchStatuses = async () => {
        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.get("/api/status", config);
            setStatuses(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching statuses", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchStatuses();
        }
    }, [isOpen]);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const uploaded = await uploadFileToCloudinary(file);

            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`
                },
            };

            await axios.post("/api/status", {
                mediaUrl: uploaded.url,
                mediaType: uploaded.fileType === "video" ? "video" : "image",
                caption: "",
            }, config);

            setUploading(false);
            fetchStatuses(); // Refresh list
        } catch (error) {
            alert("Error uploading status: " + error.message);
            setUploading(false);
        }
    };

    // Group statuses by user
    const groupedStatuses = statuses.reduce((acc, status) => {
        const userId = status.user._id;
        if (!acc[userId]) {
            acc[userId] = {
                user: status.user,
                statuses: []
            };
        }
        acc[userId].statuses.push(status);
        return acc;
    }, {});

    const myStatuses = groupedStatuses[user._id]?.statuses || [];
    const otherStatuses = Object.values(groupedStatuses).filter(g => g.user._id !== user._id);

    const handleViewStatus = (group) => {
        setViewingUser(group);
        setCurrentStatusIndex(0);
    };

    useEffect(() => {
        let timer;
        if (viewingUser) {
            timer = setTimeout(() => {
                handleNextStatus();
            }, 15000);
        }
        return () => clearTimeout(timer);
    }, [viewingUser, currentStatusIndex]);

    const handleNextStatus = () => {
        if (viewingUser && currentStatusIndex < viewingUser.statuses.length - 1) {
            setCurrentStatusIndex(prev => prev + 1);
        } else {
            setViewingUser(null); // Close viewer if no more statuses
        }
    };

    const handlePrevStatus = () => {
        if (currentStatusIndex > 0) {
            setCurrentStatusIndex(prev => prev - 1);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex">
            <div className="fixed inset-0 bg-black/60" onClick={onClose}></div>

            {/* Drawer Content */}
            <div className="relative z-50 w-80 bg-[#0f172a] h-full shadow-2xl flex flex-col border-r border-gray-800 animate-in slide-in-from-left duration-300">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1e293b]">
                    <h2 className="text-xl font-bold text-white">Status</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* My Status */}
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => myStatuses.length > 0 ? handleViewStatus({ user, statuses: myStatuses }) : fileInputRef.current.click()}>
                        <div className="relative">
                            <img
                                src={user.pic}
                                alt="My Status"
                                className={`w-12 h-12 rounded-full object-cover border-2 ${myStatuses.length > 0 ? 'border-cyan-500' : 'border-gray-600'}`}
                            />
                            {myStatuses.length === 0 && (
                                <div className="absolute bottom-0 right-0 bg-cyan-500 rounded-full p-1 border-2 border-[#0f172a]">
                                    <Plus size={12} className="text-white" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white font-semibold">My Status</h3>
                            <p className="text-xs text-gray-400">
                                {uploading ? "Uploading..." : (myStatuses.length > 0 ? "Click to view" : "Tap to add status update")}
                            </p>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*,video/*"
                            onChange={handleFileUpload}
                        />
                    </div>

                    {/* Recent Updates */}
                    <div>
                        <h3 className="text-gray-400 text-sm font-semibold mb-4 uppercase tracking-wider">Recent Updates</h3>
                        {loading ? (
                            <div className="flex justify-center p-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                            </div>
                        ) : otherStatuses.length === 0 ? (
                            <p className="text-gray-500 text-sm italic text-center">No recent updates</p>
                        ) : (
                            <div className="space-y-4">
                                {otherStatuses.map((group) => (
                                    <div
                                        key={group.user._id}
                                        className="flex items-center gap-4 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors"
                                        onClick={() => handleViewStatus(group)}
                                    >
                                        <div className="relative">
                                            <img
                                                src={group.user.pic}
                                                alt={group.user.name}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500 p-[2px]"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium">{group.user.name}</h4>
                                            <p className="text-xs text-gray-400">
                                                {new Date(group.statuses[group.statuses.length - 1].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Viewer Overlay */}
            {viewingUser && (
                <div className="fixed inset-0 z-[110] bg-black flex flex-col items-center justify-center">
                    {/* Progress Bar */}
                    <div className="absolute top-4 left-0 right-0 flex gap-1 px-4 z-20">
                        {viewingUser.statuses.map((_, idx) => (
                            <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-cyan-500 transition-all ease-linear ${idx < currentStatusIndex ? 'w-full' : idx === currentStatusIndex ? 'w-full' : 'w-0'
                                        }`}
                                    style={{ transitionDuration: idx === currentStatusIndex ? '15000ms' : '0ms' }}
                                ></div>
                            </div>
                        ))}
                    </div>

                    {/* Header */}
                    <div className="absolute top-8 left-4 flex items-center gap-3 z-20">
                        <button onClick={() => setViewingUser(null)} className="text-white">
                            <ChevronLeft size={28} />
                        </button>
                        <img src={viewingUser.user.pic} className="w-10 h-10 rounded-full border border-white/20" alt="" />
                        <div>
                            <p className="text-white font-semibold">{viewingUser.user.name}</p>
                            <p className="text-white/60 text-xs">
                                {new Date(viewingUser.statuses[currentStatusIndex].createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="w-full h-full flex items-center justify-center relative">
                        {/* Navigation Zones */}
                        <div className="absolute inset-y-0 left-0 w-1/3 z-10" onClick={handlePrevStatus}></div>
                        <div className="absolute inset-y-0 right-0 w-1/3 z-10" onClick={handleNextStatus}></div>

                        {viewingUser.statuses[currentStatusIndex].mediaType === "video" ? (
                            <video
                                src={viewingUser.statuses[currentStatusIndex].mediaUrl}
                                className="max-h-full max-w-full object-contain"
                                autoPlay
                                controls={false}
                                onEnded={handleNextStatus}
                            />
                        ) : (
                            <img
                                src={viewingUser.statuses[currentStatusIndex].mediaUrl}
                                className="max-h-full max-w-full object-contain"
                                alt="Status"
                            />
                        )}

                        {/* Caption */}
                        {viewingUser.statuses[currentStatusIndex].caption && (
                            <div className="absolute bottom-10 bg-black/50 px-4 py-2 rounded-full text-white">
                                {viewingUser.statuses[currentStatusIndex].caption}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatusDrawer;
