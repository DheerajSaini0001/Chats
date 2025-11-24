import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ChatState } from "../../context/ChatProvider";

const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmpassword, setConfirmpassword] = useState("");
    const [pic, setPic] = useState();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setUser } = ChatState();

    const submitHandler = async () => {
        setLoading(true);
        if (!name || !email || !password || !confirmpassword) {
            alert("Please Fill all the Fields");
            setLoading(false);
            return;
        }
        if (password !== confirmpassword) {
            alert("Passwords Do Not Match");
            return;
        }

        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                },
            };
            const { data } = await axios.post(
                "/api/user",
                { name, email, password, pic },
                config
            );
            alert("Registration Successful");
            localStorage.setItem("userInfo", JSON.stringify(data));
            setUser(data);
            setLoading(false);
            navigate("/chats");
        } catch (error) {
            alert("Error Occured: " + error.response.data.message);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-5 p-6 mt-4 border-t border-gray-100">
            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">Name</label>
                <input
                    placeholder="Enter your name"
                    className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50"
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">Email Address</label>
                <input
                    type="email"
                    placeholder="Enter your email"
                    className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50"
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">Password</label>
                <input
                    type="password"
                    placeholder="Enter your password"
                    className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50"
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">Confirm Password</label>
                <input
                    type="password"
                    placeholder="Confirm your password"
                    className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50"
                    onChange={(e) => setConfirmpassword(e.target.value)}
                />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">Profile Picture (Optional)</label>
                <input
                    type="file"
                    accept="image/*"
                    className="p-2 border border-gray-200 rounded-lg bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={(e) => setPic(e.target.files[0])}
                />
            </div>
            <button
                onClick={submitHandler}
                className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md active:scale-95 transform duration-100 mt-2"
                disabled={loading}
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing Up...
                    </span>
                ) : "Sign Up"}
            </button>
        </div>
    );
};

export default Signup;
