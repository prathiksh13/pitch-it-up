"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Lock, Rocket, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TeamLoginPage() {
    const [teamName, setTeamName] = useState("");
    const [teamPassword, setTeamPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/team-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    teamName: teamName.trim(),
                    password: teamPassword.trim()
                }),
            });

            const payload = await res.json();

            if (!res.ok) {
                throw new Error(payload?.error || "Invalid credentials. Access Denied.");
            }

            // Store session in localStorage
            // payload.team contains sanitized team data from API
            localStorage.setItem("teamSession", JSON.stringify(payload.team));

            router.push("/team/dashboard");
        } catch (err: any) {
            setError(err.message || "Authentication failed. Try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                </div>

                <div className="text-center mb-10">
                    <div className="bg-blue-600/10 p-5 rounded-3xl w-fit mx-auto mb-6">
                        <Shield className="w-12 h-12 text-blue-600" />
                    </div>
                    <h1 className="text-4xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white">Team Portal</h1>
                    <p className="text-slate-500 mt-2 font-medium">Startup Founders Login</p>
                </div>

                <div className="glass p-8 rounded-3xl shadow-2xl border-white/20">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Venture Name</label>
                            <div className="relative">
                                <Rocket className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={teamName}
                                    onChange={e => setTeamName(e.target.value)}
                                    placeholder="e.g. Nexus Lab"
                                    required
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 ring-blue-500 transition-all font-bold text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Team Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    value={teamPassword}
                                    onChange={e => setTeamPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 ring-blue-500 transition-all font-bold text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white w-full py-5 rounded-2xl text-lg font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 transition-all disabled:opacity-50"
                        >
                            {loading ? "Verifying Credentials..." : "Access Founders Suite"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-8">
                        No venture yet? <Link href="/register" className="text-blue-600 font-bold hover:underline">Apply for registration</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
