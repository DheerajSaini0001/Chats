import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedBackground from "../components/AnimatedBackground"; // See step 2 below

const HomePage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("login");

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("userInfo"));
        if (user) navigate("/chats");
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
            {/* The Floating Particles Background */}
            <div className="absolute inset-0 z-0">
                <AnimatedBackground />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="container max-w-lg w-full relative z-10 flex flex-col gap-6"
            >
                {/* Title Card */}
                <div className="p-8 rounded-2xl text-center shadow-xl dark:shadow-[0_0_30px_rgba(0,0,0,0.3)] border border-white/20 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl relative overflow-hidden group transition-colors duration-300">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-indigo-500 dark:from-cyan-400 dark:to-indigo-400 font-sans tracking-tight drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                        Talk-A-Tive
                    </h1>
                </div>

                {/* Main Auth Container */}
                <div className="p-6 rounded-3xl w-full border border-white/20 dark:border-white/10 bg-white/90 dark:bg-slate-900/80 backdrop-blur-2xl shadow-2xl relative transition-colors duration-300">

                    {/* Sliding Tab Switcher */}
                    <div className="flex justify-center mb-8 bg-slate-100 dark:bg-slate-950/50 p-1 rounded-xl border border-slate-200 dark:border-white/5 relative transition-colors duration-300">
                        <button
                            onClick={() => setActiveTab("login")}
                            className={`flex-1 py-3 rounded-lg text-sm font-bold tracking-wide z-10 transition-colors duration-200 ${activeTab === "login" ? "text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
                        >
                            LOGIN
                        </button>
                        <button
                            onClick={() => setActiveTab("signup")}
                            className={`flex-1 py-3 rounded-lg text-sm font-bold tracking-wide z-10 transition-colors duration-200 ${activeTab === "signup" ? "text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
                        >
                            SIGN UP
                        </button>

                        {/* The Sliding "Pill" Animation */}
                        <div
                            className={`absolute top-1 bottom-1 w-[48%] bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-indigo-600 dark:to-violet-600 rounded-lg shadow-lg shadow-indigo-500/30 transition-all duration-300 ease-out ${activeTab === "login" ? "left-1" : "left-[51%]"}`}
                        ></div>
                    </div>

                    {/* Content Area */}
                    <div className="overflow-hidden min-h-[400px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: activeTab === "login" ? -20 : 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: activeTab === "login" ? 20 : -20 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                                {activeTab === "login" ? <Login /> : <Signup />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default HomePage;