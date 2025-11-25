import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../../context/ChatProvider";
import axios from "axios";
import ProfileModal from "./ProfileModal";
import ThemeToggle from "../ThemeToggle";
import { Search, CircleDashed } from "lucide-react";
import StatusDrawer from "./StatusDrawer";

const SideDrawer = () => {
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);

    const { user, setSelectedChat, chats, setChats } = ChatState();
    const navigate = useNavigate();

    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        navigate("/");
    };

    const handleSearch = async () => {
        if (!search) {
            alert("Please Enter something in search");
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.get(`/api/user?search=${search}`, config);
            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            alert("Error Occured: " + error.message);
            setLoading(false);
        }
    };

    const accessChat = async (userId) => {
        try {
            setLoadingChat(true);
            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.post(`/api/chat`, { userId }, config);

            if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
            setSelectedChat(data);
            setLoadingChat(false);
            setIsDrawerOpen(false);
        } catch (error) {
            alert("Error fetching the chat: " + error.message);
            setLoadingChat(false);
        }
    };

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    return (
        <>
            <div className="flex justify-between items-center w-full p-3 glass-header sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <button
                        className="flex items-center px-4 py-2 bg-white/10 dark:bg-white/5 rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition-colors duration-200 text-gray-200"
                        onClick={() => setIsDrawerOpen(true)}
                    >
                        <Search size={20} className="text-white" />
                        <span className="hidden md:flex px-2 font-medium">Search</span>
                    </button>
                    <button
                        className="flex items-center px-4 py-2 bg-white/10 dark:bg-white/5 rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition-colors duration-200 text-gray-200"
                        onClick={() => setIsStatusOpen(true)}
                        title="Status"
                    >
                        <CircleDashed size={20} className="text-white" />
                        <span className="hidden md:flex px-2 font-medium">Status</span>
                    </button>
                </div>

                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight cursor-default">
                    Talk-A-Tive
                </h2>

                <div className="flex items-center space-x-2">
                    {/* Theme Toggle */}
                    <ThemeToggle />

                    <div className="relative">
                        <button
                            className="flex items-center space-x-2 focus:outline-none"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <div className="relative ">
                                <img
                                    src={user.pic}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/50 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                                />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0f172a]"></div>
                            </div>
                            <i className={`fas fa-chevron-down text-gray-400 text-sm transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}></i>
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsDropdownOpen(false)}
                                ></div>
                                <div className="absolute right-0 mt-2 w-48 bg-[#1e293b] rounded-xl shadow-xl py-2 z-20 border border-gray-700 transform origin-top-right transition-all duration-200 animate-in fade-in zoom-in-95">
                                    <div className="px-4 py-2 border-b border-gray-700">
                                        <p className="text-sm font-semibold text-gray-200 truncate">{user.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsProfileOpen(true);
                                            setIsDropdownOpen(false);
                                        }}
                                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 w-full text-left transition-colors"
                                    >
                                        My Profile
                                    </button>
                                    <button
                                        onClick={logoutHandler}
                                        className="block px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 w-full text-left transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Drawer */}
            {isDrawerOpen && (
                <div className="fixed inset-0 z-[100] flex">
                    <div
                        className="fixed inset-0 bg-black/60 "
                        onClick={() => setIsDrawerOpen(false)}
                    ></div>
                    <div className="relative z-50 w-80 bg-[#0f172a] h-full shadow-2xl p-4 flex flex-col border-r border-gray-800">
                        <div className="border-b border-gray-800 pb-4 mb-4 text-white font-semibold text-lg">Search Users</div>
                        <div className="flex pb-4">
                            <input
                                placeholder="Search by name or email"
                                className="mr-2 p-2 bg-white/5 border border-gray-700 rounded-lg w-full text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button
                                onClick={handleSearch}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Go
                            </button>
                        </div>
                        {loading ? (
                            <div className="flex justify-center mt-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto space-y-2">
                                {searchResult?.map((user) => (
                                    <div
                                        key={user._id}
                                        onClick={() => accessChat(user._id)}
                                        className="cursor-pointer bg-white/5 hover:bg-indigo-600/20 hover:border-indigo-500/50 border border-transparent w-full flex items-center px-3 py-3 rounded-lg transition-all"
                                    >
                                        <img
                                            src={user.pic}
                                            alt={user.name}
                                            className="w-10 h-10 rounded-full mr-3 object-cover"
                                        />
                                        <div>
                                            <div className="font-semibold text-gray-200">{user.name}</div>
                                            <div className="text-xs text-gray-400">
                                                <b>Email : </b>
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {loadingChat && <div className="mt-4 text-center text-indigo-400 animate-pulse">Loading chat...</div>}
                    </div>
                </div>
            )}

            {/* Status Drawer */}
            <StatusDrawer isOpen={isStatusOpen} onClose={() => setIsStatusOpen(false)} />

            {/* Profile Modal */}
            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={user}
                isOwnProfile={true}
            />
        </>
    );
};

export default SideDrawer;
