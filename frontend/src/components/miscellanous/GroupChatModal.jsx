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
                        className="fixed inset-0 bg-black opacity-50"
                        onClick={() => setIsOpen(false)}
                    ></div>
                    <div className="relative bg-white p-6 rounded-lg shadow-xl w-96 z-50">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-sans">Create Group Chat</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                X
                            </button>
                        </div>

                        <div className="flex flex-col gap-3">
                            <input
                                placeholder="Chat Name"
                                className="p-2 border rounded"
                                onChange={(e) => setGroupChatName(e.target.value)}
                            />
                            <input
                                placeholder="Add Users eg: John, Piyush, Jane"
                                className="p-2 border rounded"
                                onChange={(e) => handleSearch(e.target.value)}
                            />

                            <div className="flex flex-wrap gap-1">
                                {selectedUsers.map((u) => (
                                    <div
                                        key={u._id}
                                        className="bg-purple-500 text-white px-2 py-1 rounded-full text-sm flex items-center"
                                    >
                                        {u.name}
                                        <span
                                            className="ml-2 cursor-pointer"
                                            onClick={() => handleDelete(u)}
                                        >
                                            X
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {loading ? (
                                <div>Loading...</div>
                            ) : (
                                searchResult
                                    ?.slice(0, 4)
                                    .map((user) => (
                                        <div
                                            key={user._id}
                                            onClick={() => handleGroup(user)}
                                            className="cursor-pointer bg-gray-100 hover:bg-blue-500 hover:text-white p-2 rounded flex items-center"
                                        >
                                            <img
                                                src={user.pic}
                                                alt={user.name}
                                                className="w-8 h-8 rounded-full mr-2"
                                            />
                                            <div>
                                                <div className="font-semibold">{user.name}</div>
                                                <div className="text-xs">{user.email}</div>
                                            </div>
                                        </div>
                                    ))
                            )}

                            <button
                                onClick={handleSubmit}
                                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mt-2"
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
