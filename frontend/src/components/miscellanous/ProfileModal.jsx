import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { ChatState } from "../../context/ChatProvider";

const ProfileModal = ({ isOpen, onClose, user, isOwnProfile = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [pic, setPic] = useState("");
    const [picLoading, setPicLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user: currentUser, setUser } = ChatState();

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setBio(user.bio || "Hey there! I am using Talk-A-Tive.");
            setPic(user.pic || "");
        }
    }, [user]);

    if (!user) return null;

    const postDetails = (pics) => {
        setPicLoading(true);
        if (pics === undefined) {
            alert("Please Select an Image!");
            setPicLoading(false);
            return;
        }

        if (pics.type === "image/jpeg" || pics.type === "image/png") {
            const data = new FormData();
            data.append("file", pics);
            data.append("upload_preset", "chat-app");

            // Cloudinary cloud name
            const cloudName = "db5jdjjon";

            if (cloudName === "YOUR_CLOUD_NAME") {
                alert("⚠️ Please configure Cloudinary first!\n\n1. Go to cloudinary.com and create account\n2. Get your Cloud Name from dashboard\n3. Update cloudName in ProfileModal.jsx");
                setPicLoading(false);
                return;
            }

            fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: "post",
                body: data,
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.error) {
                        console.error("Cloudinary error:", data.error);
                        alert(`Error uploading image: ${data.error.message}`);
                        setPicLoading(false);
                        return;
                    }
                    if (data.url) {
                        setPic(data.url.toString());
                        setPicLoading(false);
                    } else {
                        console.error("No URL in response:", data);
                        alert("Error: No image URL received from upload");
                        setPicLoading(false);
                    }
                })
                .catch((err) => {
                    console.error("Upload error:", err);
                    alert("Error uploading image: " + err.message);
                    setPicLoading(false);
                });
        } else {
            alert("Please Select an Image (JPEG or PNG)!");
            setPicLoading(false);
            return;
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${currentUser.token}`,
                },
            };

            const { data } = await axios.put(
                "/api/user/profile",
                { name, bio, pic },
                config
            );

            // Update local storage and context
            localStorage.setItem("userInfo", JSON.stringify(data));
            setUser(data);

            alert("Profile updated successfully!");
            setIsEditing(false);
            setLoading(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            const errorMessage = error.response?.data?.message || error.message || "Unknown error occurred";
            alert(`Error updating profile: ${errorMessage}`);
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setName(user.name || "");
        setBio(user.bio || "Hey there! I am using Talk-A-Tive.");
        setPic(user.pic || "");
        setIsEditing(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-md mx-4"
                    >
                        <div className="glass p-8 rounded-2xl border border-white/10 shadow-2xl">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                            >
                                <i className="fas fa-times text-xl"></i>
                            </button>

                            {/* Profile Content */}
                            <div className="flex flex-col items-center text-center">
                                {/* Profile Picture */}
                                <div className="relative mb-6">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                                        <img
                                            src={pic}
                                            alt={name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {isOwnProfile && isEditing && (
                                        <label className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 p-3 rounded-full cursor-pointer shadow-lg transition-all hover:scale-110 animate-pulse">
                                            <i className="fas fa-camera text-white text-lg"></i>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => postDetails(e.target.files[0])}
                                                disabled={picLoading}
                                            />
                                        </label>
                                    )}
                                    {!isEditing && (
                                        <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-[#0f172a] shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                    )}
                                </div>

                                {/* Change Picture Button (Edit Mode) */}
                                {isOwnProfile && isEditing && (
                                    <div className="mb-4 w-full space-y-2">
                                        <label className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg cursor-pointer transition-all text-sm text-gray-300 hover:text-white flex items-center gap-2 justify-center">
                                            <i className="fas fa-upload"></i>
                                            <span>Upload Picture</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => postDetails(e.target.files[0])}
                                                disabled={picLoading}
                                            />
                                        </label>
                                        <div className="text-center text-xs text-gray-500">or</div>
                                        <input
                                            type="text"
                                            placeholder="Paste image URL here"
                                            value={pic}
                                            onChange={(e) => setPic(e.target.value)}
                                            className="w-full glass-input p-2 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white placeholder-gray-500"
                                        />
                                    </div>
                                )}

                                {picLoading && (
                                    <div className="flex items-center gap-2 text-sm text-indigo-400 mb-4">
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Uploading image...
                                    </div>
                                )}

                                {/* User Info */}
                                {isEditing ? (
                                    <div className="w-full space-y-4 mb-4">
                                        <div className="flex flex-col gap-2 text-left">
                                            <label className="text-sm font-semibold text-gray-300">Name</label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="glass-input p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 text-left">
                                            <label className="text-sm font-semibold text-gray-300">Bio</label>
                                            <textarea
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                rows="3"
                                                maxLength="150"
                                                className="glass-input p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none text-white"
                                                placeholder="Tell us about yourself..."
                                            />
                                            <span className="text-xs text-gray-500 text-right">{bio.length}/150</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                                            {name}
                                        </h2>

                                        <div className="flex items-center gap-2 text-gray-400 mb-4">
                                            <i className="fas fa-envelope text-sm"></i>
                                            <p className="text-sm">{user.email}</p>
                                        </div>

                                        {/* Bio */}
                                        <div className="w-full mb-4 p-3 bg-white/5 rounded-lg border border-white/5">
                                            <p className="text-gray-300 text-sm italic">"{bio}"</p>
                                        </div>
                                    </>
                                )}

                                {/* Divider */}
                                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6"></div>

                                {/* Additional Info */}
                                {!isEditing && (
                                    <div className="w-full space-y-3 mb-4">
                                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                            <span className="text-gray-400 text-sm">Status</span>
                                            <span className="text-green-400 text-sm font-semibold flex items-center gap-2">
                                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                Online
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                            <span className="text-gray-400 text-sm">User ID</span>
                                            <span className="text-gray-300 text-sm font-mono">{user._id?.slice(-8) || 'N/A'}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                {isOwnProfile ? (
                                    isEditing ? (
                                        <div className="flex gap-3 w-full">
                                            <button
                                                onClick={handleCancel}
                                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
                                                disabled={loading || picLoading}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={loading || picLoading}
                                            >
                                                {loading ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Saving...
                                                    </span>
                                                ) : "Save Changes"}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-3 w-full">
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors shadow-lg shadow-indigo-500/30"
                                            >
                                                <i className="fas fa-edit mr-2"></i>
                                                Edit Profile
                                            </button>
                                            <button
                                                onClick={onClose}
                                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    )
                                ) : (
                                    <button
                                        onClick={onClose}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors shadow-lg shadow-indigo-500/30"
                                    >
                                        Close
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ProfileModal;
