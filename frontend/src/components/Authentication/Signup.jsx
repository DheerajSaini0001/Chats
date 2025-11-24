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
        <div className="flex flex-col gap-5 p-6 mt-4 border-t border-white/10">
            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-300">Name</label>
                <input
                    placeholder="Enter your name"
                    className="glass-input p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-gray-500"
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-300">Email Address</label>
                <input
                    type="email"
                    placeholder="Enter your email"
                    className="glass-input p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-gray-500"
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-300">Password</label>
                <input
                    type="password"
                    placeholder="Enter your password"
                    className="glass-input p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-gray-500"
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-300">Confirm Password</label>
                <input
                    type="password"
                    placeholder="Confirm your password"
                    className="glass-input p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-gray-500"
                    onChange={(e) => setConfirmpassword(e.target.value)}
                />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-300">Profile Picture (Optional)</label>
                <input
                    type="file"
                    accept="image/*"
                    className="p-2 glass-input rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30"
                    onChange={(e) => postDetails(e.target.files[0])}
                />
                {picLoading && (
                    <div className="flex items-center gap-2 text-sm text-indigo-400">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading image...
                    </div>
                )}
                {pic && !picLoading && (
                    <div className="flex items-center gap-2 text-sm text-green-400">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Image uploaded successfully!
                    </div>
                )}
            </div>
            <button
                onClick={submitHandler}
                className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-lg shadow-indigo-500/30 active:scale-95 transform duration-100 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
