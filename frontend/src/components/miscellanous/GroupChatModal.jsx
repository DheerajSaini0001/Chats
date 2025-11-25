import React, { useState } from "react";
import { ChatState } from "../../context/ChatProvider";
import axios from "axios";

const GroupChatModal = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [groupChatName, setGroupChatName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);

    const { user, chats, setChats } = ChatState();

    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) {
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.get(`/api/user?search=${query}`, config);
            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            alert("Error Occured: " + error.message);
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!groupChatName || !selectedUsers) {
            alert("Please fill all the fields");
            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.post(
                "/api/chat/group",
                {
                    name: groupChatName,
                    users: JSON.stringify(selectedUsers.map((u) => u._id)),
                },
                config
            );

            setChats([data, ...chats]);
            setIsOpen(false);
            alert("New Group Chat Created!");
        } catch (error) {
            alert("Failed to Create the Chat: " + error.response.data);
        }
    };

    const handleGroup = (userToAdd) => {
        if (selectedUsers.includes(userToAdd)) {
            alert("User already added");
            return;
        }
        setSelectedUsers([...selectedUsers, userToAdd]);
    };

    const handleDelete = (delUser) => {
        setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
    };

    return (
        <>
            <span onClick={() => setIsOpen(true)}>{children}</span>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    ></div>
                    <div className="relative bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl w-96 z-50 border border-slate-200 dark:border-white/10 transition-colors duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-sans font-bold text-slate-900 dark:text-white">Create Group Chat</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        <div className="flex flex-col gap-3">
                            <input
                                placeholder="Chat Name"
                                className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                onChange={(e) => setGroupChatName(e.target.value)}
                            />
                            <input
                                placeholder="Add Users eg: John, Piyush, Jane"
                                className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                onChange={(e) => handleSearch(e.target.value)}
                            />

                            <div className="flex flex-wrap gap-2">
                                {selectedUsers.map((u) => (
                                    <div
                                        key={u._id}
                                        className="bg-indigo-500 text-white px-3 py-1 rounded-full text-sm flex items-center shadow-md"
                                    >
                                        {u.name}
                                        <span
                                            className="ml-2 cursor-pointer hover:text-red-200"
                                            onClick={() => handleDelete(u)}
                                        >
                                            <i className="fas fa-times"></i>
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {loading ? (
                                <div className="text-center text-indigo-500 dark:text-indigo-400 animate-pulse">Loading...</div>
                            ) : (
                                searchResult
                                    ?.slice(0, 4)
                                    .map((user) => (
                                        <div
                                            key={user._id}
                                            onClick={() => handleGroup(user)}
                                            className="cursor-pointer bg-slate-50 dark:bg-slate-800/30 hover:bg-indigo-500 dark:hover:bg-indigo-600 hover:text-white p-2 rounded-lg flex items-center transition-colors border border-transparent hover:border-indigo-400"
                                        >
                                            <img
                                                src={user.pic}
                                                alt={user.name}
                                                className="w-8 h-8 rounded-full mr-2 object-cover"
                                            />
                                            <div>
                                                <div className="font-semibold text-sm">{user.name}</div>
                                                <div className="text-xs opacity-80">{user.email}</div>
                                            </div>
                                        </div>
                                    ))
                            )}

                            <button
                                onClick={handleSubmit}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg font-semibold shadow-lg shadow-indigo-500/30 transition-all mt-2"
                            >
                                Create Chat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GroupChatModal;
