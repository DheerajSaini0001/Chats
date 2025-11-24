import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";

const HomePage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("login");

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("userInfo"));

        if (user) navigate("/chats");
    }, [navigate]);

    return (
        <div className="container max-w-xl mx-auto mt-10 p-4 bg-white rounded-lg shadow-lg">
            <h1 className="text-4xl font-bold text-center mb-4 text-blue-600 font-sans">
                Talk-A-Tive
            </h1>
            <div className="bg-white w-full p-4 rounded-lg border border-gray-200">
                <div className="flex justify-center mb-6 bg-gray-100 p-1 rounded-full">
                    <button
                        onClick={() => setActiveTab("login")}
                        className={`flex-1 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === "login"
                                ? "bg-blue-500 text-white shadow-md"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setActiveTab("signup")}
                        className={`flex-1 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === "signup"
                                ? "bg-blue-500 text-white shadow-md"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Sign Up
                    </button>
                </div>

                <div className="transition-all duration-300 ease-in-out">
                    {activeTab === "login" ? <Login /> : <Signup />}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
