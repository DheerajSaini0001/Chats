import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ChatState } from "../../context/ChatProvider";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setUser } = ChatState();

    const submitHandler = async () => {
        setLoading(true);
        if (!email || !password) {
            alert("Please Fill all the Fields");
            setLoading(false);
            return;
        }

        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                },
            };

            const { data } = await axios.post(
                "/api/user/login",
                { email, password },
                config
            );

            alert("Login Successful");
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
        <div className="flex flex-col gap-6 p-2">
            
            {/* Email Field */}
            <div className="flex flex-col gap-2 group">
                <label className="text-xs font-bold text-gray-400 tracking-wider uppercase group-focus-within:text-indigo-400 transition-colors">
                    Email Address
                </label>
                <input
                    type="email"
                    placeholder="Enter your email"
                    className="
                        w-full p-4 rounded-xl 
                        bg-black/20 border border-white/10 
                        text-white placeholder-gray-600 
                        focus:outline-none focus:border-indigo-500/50 focus:bg-black/40
                        focus:shadow-[0_0_15px_rgba(99,102,241,0.3)]
                        transition-all duration-300 ease-in-out
                    "
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2 group">
                <label className="text-xs font-bold text-gray-400 tracking-wider uppercase group-focus-within:text-indigo-400 transition-colors">
                    Password
                </label>
                <input
                    type="password"
                    placeholder="Enter your password"
                    className="
                        w-full p-4 rounded-xl 
                        bg-black/20 border border-white/10 
                        text-white placeholder-gray-600 
                        focus:outline-none focus:border-indigo-500/50 focus:bg-black/40
                        focus:shadow-[0_0_15px_rgba(99,102,241,0.3)]
                        transition-all duration-300 ease-in-out
                    "
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            {/* Login Button (Neon Gradient) */}
            <button
                onClick={submitHandler}
                disabled={loading}
                className="
                    mt-2 w-full p-4 rounded-xl font-bold tracking-wide text-white
                    bg-gradient-to-r from-indigo-600 to-violet-600
                    hover:from-indigo-500 hover:to-violet-500
                    shadow-[0_0_20px_rgba(79,70,229,0.4)]
                    hover:shadow-[0_0_30px_rgba(79,70,229,0.6)]
                    active:scale-[0.98]
                    disabled:opacity-70 disabled:cursor-not-allowed
                    transition-all duration-300 transform
                "
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        INITIALIZING...
                    </span>
                ) : "LOGIN"}
            </button>

            {/* Guest Button (Outline Glow) */}
            <button
                onClick={() => {
                    setEmail("guest@example.com");
                    setPassword("123456");
                }}
                className="
                    w-full p-3 rounded-xl font-semibold text-sm
                    bg-rose-500/5 text-rose-400 
                    border border-rose-500/30
                    hover:bg-rose-500/10 hover:border-rose-500/60
                    hover:shadow-[0_0_15px_rgba(244,63,94,0.3)]
                    active:scale-[0.98]
                    transition-all duration-300
                "
            >
                Get Guest User Credentials
            </button>
        </div>
    );
};

export default Login;