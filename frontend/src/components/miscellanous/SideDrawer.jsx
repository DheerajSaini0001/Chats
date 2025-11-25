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
            <div className="flex justify-between items-center w-full px-5 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/10 sticky top-0 z-10 transition-all duration-300">
                <div className="flex items-center gap-3">
                    <button
                        className="flex items-center px-4 py-2.5 bg-slate-100/50 dark:bg-slate-800/50 rounded-full hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 shadow-sm hover:shadow-md transition-all duration-300 group"
                        onClick={() => setIsDrawerOpen(true)}
                    >
                        <Search size={18} className="text-slate-500 dark:text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        <span className="hidden md:flex px-2 font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white text-sm">Search</span>
                    </button>
                    <button
                        className="flex items-center px-4 py-2.5 bg-slate-100/50 dark:bg-slate-800/50 rounded-full hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 shadow-sm hover:shadow-md transition-all duration-300 group"
                        onClick={() => setIsStatusOpen(true)}
                        title="Status"
                    >
                        <CircleDashed size={18} className="text-slate-500 dark:text-slate-400 group-hover:text-pink-500 transition-colors" />
                        <span className="hidden md:flex px-2 font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white text-sm">Status</span>
                    </button>
                </div>

                <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text drop-shadow-sm cursor-default hover:scale-105 transition-transform duration-300">
                    Talk-A-Tive
                </h2>

                <div className="flex items-center space-x-4">
                    {/* Theme Toggle */}
                    <div className="hover:scale-110 transition-transform duration-200">
                        <ThemeToggle />
                    </div>

                    <div className="relative">
                        <button
                            className="flex items-center space-x-2 focus:outline-none group"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <div className="relative">
                                <img
                                    src={user.pic}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/50 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 shadow-md group-hover:ring-indigo-500 transition-all duration-300"
                                />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"></div>
                            </div>
                            <i className={`fas fa-chevron-down text-slate-400 dark:text-slate-500 text-xs transition-transform duration-300 group-hover:text-slate-600 dark:group-hover:text-slate-300 ${isDropdownOpen ? "rotate-180" : ""}`}></i>
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsDropdownOpen(false)}
                                ></div>
                                <div className="absolute right-0 mt-3 w-56 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl py-2 z-20 border border-slate-200/50 dark:border-slate-700/50 transform origin-top-right transition-all duration-200 animate-in fade-in zoom-in-95">
                                    <div className="px-5 py-3 border-b border-slate-200/50 dark:border-slate-700/50">
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{user.email}</p>
                                    </div>
                                    <div className="p-1">
                                        <button
                                            onClick={() => {
                                                setIsProfileOpen(true);
                                                setIsDropdownOpen(false);
                                            }}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 w-full text-left rounded-xl transition-all"
                                        >
                                            <i className="fas fa-user text-xs opacity-70"></i>
                                            My Profile
                                        </button>
                                        <button
                                            onClick={logoutHandler}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 w-full text-left rounded-xl transition-all"
                                        >
                                            <i className="fas fa-sign-out-alt text-xs opacity-70"></i>
                                            Logout
                                        </button>
                                    </div>
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsDrawerOpen(false)}
                    ></div>
                    <div className="relative z-50 w-80 bg-white dark:bg-slate-900 h-full shadow-2xl p-4 flex flex-col border-r border-slate-200 dark:border-slate-800 transition-colors duration-300">
                        <div className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-4 text-slate-900 dark:text-white font-semibold text-lg">Search Users</div>
                        <div className="flex pb-4">
                            <input
                                placeholder="Search by name or email"
                                className="mr-2 p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg w-full text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
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
                                        className="cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-600/20 hover:border-indigo-500/50 border border-transparent w-full flex items-center px-3 py-3 rounded-lg transition-all"
                                    >
                                        <img
                                            src={user.pic}
                                            alt={user.name}
                                            className="w-10 h-10 rounded-full mr-3 object-cover"
                                        />
                                        <div>
                                            <div className="font-semibold text-slate-800 dark:text-slate-200">{user.name}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">
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
