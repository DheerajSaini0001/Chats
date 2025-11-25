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
    const [picLoading, setPicLoading] = useState(false);
    const navigate = useNavigate();
    const { setUser } = ChatState();

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
                alert("⚠️ Please configure Cloudinary first!\n\n1. Go to cloudinary.com and create account\n2. Get your Cloud Name from dashboard\n3. Update cloudName in Signup.jsx");
                setPicLoading(false);
                return;
            }

            fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: "post",
                body: data,
            })
                .then((res) => res.json())
                .then((data) => {
                    setPic(data.url.toString());
                    setPicLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                    alert("Error uploading image!");
                    setPicLoading(false);
                });
        } else {
            alert("Please Select an Image (JPEG or PNG)!");
            setPicLoading(false);
            return;
        }
    };

    const submitHandler = async () => {
        setLoading(true);
        if (!name || !email || !password || !confirmpassword) {
            alert("Please Fill all the Fields");
            setLoading(false);
            return;
        }
        if (password !== confirmpassword) {
            alert("Passwords Do Not Match");
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
        <div className="flex flex-col gap-5 p-6 mt-4 border-t border-slate-200 dark:border-white/10">
            <div className="flex flex-col gap-2 group">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors">Name</label>
                <input
                    placeholder="Enter your name"
                    className="
                        w-full p-4 rounded-xl 
                        bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 
                        text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-600 
                        focus:outline-none focus:border-indigo-500/50 focus:bg-white dark:focus:bg-slate-800
                        focus:shadow-[0_0_15px_rgba(99,102,241,0.3)]
                        transition-all duration-300 ease-in-out
                    "
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className="flex flex-col gap-2 group">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors">Email Address</label>
                <input
                    type="email"
                    placeholder="Enter your email"
                    className="
                        w-full p-4 rounded-xl 
                        bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 
                        text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-600 
                        focus:outline-none focus:border-indigo-500/50 focus:bg-white dark:focus:bg-slate-800
                        focus:shadow-[0_0_15px_rgba(99,102,241,0.3)]
                        transition-all duration-300 ease-in-out
                    "
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="flex flex-col gap-2 group">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors">Password</label>
                <input
                    type="password"
                    placeholder="Enter your password"
                    className="
                        w-full p-4 rounded-xl 
                        bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 
                        text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-600 
                        focus:outline-none focus:border-indigo-500/50 focus:bg-white dark:focus:bg-slate-800
                        focus:shadow-[0_0_15px_rgba(99,102,241,0.3)]
                        transition-all duration-300 ease-in-out
                    "
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <div className="flex flex-col gap-2 group">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors">Confirm Password</label>
                <input
                    type="password"
                    placeholder="Confirm your password"
                    className="
                        w-full p-4 rounded-xl 
                        bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 
                        text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-600 
                        focus:outline-none focus:border-indigo-500/50 focus:bg-white dark:focus:bg-slate-800
                        focus:shadow-[0_0_15px_rgba(99,102,241,0.3)]
                        transition-all duration-300 ease-in-out
                    "
                    onChange={(e) => setConfirmpassword(e.target.value)}
                />
            </div>
            <div className="flex flex-col gap-2 group">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors">Profile Picture (Optional)</label>
                <input
                    type="file"
                    accept="image/*"
                    className="
                        w-full p-3 rounded-xl 
                        bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 
                        text-slate-900 dark:text-white 
                        file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 
                        file:text-xs file:font-bold file:uppercase file:tracking-wide
                        file:bg-indigo-100 dark:file:bg-indigo-500/20 file:text-indigo-700 dark:file:text-indigo-300 
                        hover:file:bg-indigo-200 dark:hover:file:bg-indigo-500/30 
                        transition-all duration-300 cursor-pointer
                    "
                    onChange={(e) => postDetails(e.target.files[0])}
                />
                {picLoading && (
                    <div className="flex items-center gap-2 text-sm text-indigo-500 dark:text-indigo-400 animate-pulse font-medium">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading image...
                    </div>
                )}
                {pic && !picLoading && (
                    <div className="flex items-center gap-2 text-sm text-green-500 dark:text-green-400 font-medium">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Image uploaded successfully!
                    </div>
                )}
            </div>
            <button
                onClick={submitHandler}
                className="
                    mt-2 w-full p-4 rounded-xl font-bold tracking-wide text-white
                    bg-gradient-to-r from-indigo-600 to-violet-600
                    hover:from-indigo-500 hover:to-violet-500
                    shadow-lg shadow-indigo-500/30
                    hover:shadow-indigo-500/50
                    active:scale-[0.98]
                    disabled:opacity-70 disabled:cursor-not-allowed
                    transition-all duration-300 transform
                "
                disabled={loading || picLoading}
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
