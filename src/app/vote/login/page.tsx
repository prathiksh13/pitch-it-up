"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Ticket, ArrowLeft, Loader2, ShieldCheck, Zap, User, Mail } from "lucide-react";
import Link from "next/link";

export default function VoterLoginPage() {
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        // Clear old sessions if any
        localStorage.removeItem("votingSession");
    }, []);

    const handleVoterLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formattedCode = code.trim().toUpperCase();
        if (!formattedCode) {
            setError("Mission access code required.");
            setLoading(false);
            return;
        }
        if (!name.trim()) {
            setError("Identity verification (Name) is mandatory.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/voter-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: formattedCode,
                    voterName: name.trim(),
                    voterEmail: email.trim()
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // Store session
                localStorage.setItem("votingSession", JSON.stringify({
                    code: data.code,
                    voterName: data.voterName,
                    tokensRemaining: data.tokensRemaining,
                    activatedAt: new Date().toISOString()
                }));
                router.push("/vote/dashboard");
            } else {
                setError(data.error || "Authentication failed. Verify code and try again.");
                setLoading(false);
            }
        } catch (err: any) {
            setError("Network interruption. Re-establishing link...");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-lg"
            >
                <div className="mb-12">
                    <Link href="/" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-all group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Abort mission & Exit
                    </Link>
                </div>

                <div className="text-center mb-10 space-y-4">
                    <div className="bg-blue-600 shadow-2xl shadow-blue-500/30 p-5 rounded-[2.5rem] w-fit mx-auto mb-6 relative">
                        <Ticket className="w-10 h-10 text-white" />
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-slate-950 flex items-center justify-center">
                            <Zap className="w-2.5 h-2.5 text-white fill-current" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white">
                            Mission <span className="text-blue-600">Entry</span>
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2">Strategic Investment Identification</p>
                    </div>
                </div>

                <div className="glass p-10 rounded-[3rem] shadow-2xl border-white/20 relative overflow-hidden">
                    <form onSubmit={handleVoterLogin} className="space-y-6 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Access Cipher</label>
                                <div className="relative group">
                                    <Ticket className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600" />
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={e => setCode(e.target.value)}
                                        placeholder="VOTE-XXXXXX"
                                        required
                                        className="w-full pl-12 pr-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 ring-blue-500/10 focus:border-blue-500 transition-all font-black uppercase tracking-widest"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Assigned Name</label>
                                <div className="relative group">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="John Carter"
                                        required
                                        className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 ring-blue-500/10 focus:border-blue-500 transition-all font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Communication Channel (Optional)</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="agent@mission.hq"
                                    className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 ring-blue-500/10 focus:border-blue-500 transition-all font-bold"
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-3"
                            >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 rounded-2xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-black uppercase tracking-[0.2em] hover:scale-[1.01] active:scale-95 transition-all shadow-2xl shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
                            {loading ? "Establishing Link..." : "Initialize Session"}
                        </button>
                    </form>

                    <footer className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                        <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                            <ShieldCheck className="w-3 h-3 text-blue-600" /> Secure Encryption Active
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold leading-relaxed px-4">
                            By entering your cipher, you agree to the strategic simulation protocols. One session per unique identifier.
                        </p>
                    </footer>
                </div>
            </motion.div>
        </div>
    );
}
