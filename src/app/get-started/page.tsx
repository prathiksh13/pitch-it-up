"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, Rocket, ArrowLeft, ArrowRight, ShieldCheck, Coins } from "lucide-react";

export default function GetStartedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[120px] rounded-full -z-10" />

            <div className="w-full max-w-4xl space-y-12">
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-4"
                    >
                        <ShieldCheck className="w-3 h-3" /> Identity Verification Required
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-6xl font-black font-outfit tracking-tighter"
                    >
                        Choose Your <span className="text-blue-600">Portal</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 max-w-lg mx-auto font-medium"
                    >
                        Select the authentication gateway corresponding to your role in the simulation.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Team Login Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Link href="/team/login" className="group">
                            <div className="glass p-10 rounded-[2.5rem] border border-white/10 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 h-full flex flex-col items-center text-center space-y-6">
                                <div className="p-6 bg-blue-600/10 rounded-3xl group-hover:bg-blue-600 transition-colors duration-500">
                                    <Rocket className="w-12 h-12 text-blue-600 group-hover:text-white transition-colors duration-500" />
                                </div>
                                <div className="space-y-3">
                                    <h2 className="text-3xl font-black font-outfit uppercase tracking-tight">Team Login</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                        For registered startup teams to access dashboard and manage venture metrics.
                                    </p>
                                </div>
                                <div className="mt-auto pt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 group-hover:translate-x-2 transition-transform">
                                    Access Founder Suite <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Voter Login Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Link href="/vote/login" className="group">
                            <div className="glass p-10 rounded-[2.5rem] border border-white/10 hover:border-emerald-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10 h-full flex flex-col items-center text-center space-y-6">
                                <div className="p-6 bg-emerald-600/10 rounded-3xl group-hover:bg-emerald-600 transition-colors duration-500">
                                    <Coins className="w-12 h-12 text-emerald-600 group-hover:text-white transition-colors duration-500" />
                                </div>
                                <div className="space-y-3">
                                    <h2 className="text-3xl font-black font-outfit uppercase tracking-tight">Voter Login</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                        For students and teachers to invest tokens in teams and participate in the market.
                                    </p>
                                </div>
                                <div className="mt-auto pt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 group-hover:translate-x-2 transition-transform">
                                    Access Investor Deck <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-center"
                >
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors font-bold uppercase tracking-widest px-6 py-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                        <ArrowLeft className="w-4 h-4" /> Return to Welcome Page
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
