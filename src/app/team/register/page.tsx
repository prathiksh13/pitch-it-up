"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { Rocket, UserPlus, Mail, Lock, Plus, Minus } from "lucide-react";
import Link from "next/link";

export default function TeamRegister() {
    const [teamName, setTeamName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [members, setMembers] = useState([""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const addMember = () => setMembers([...members, ""]);
    const removeMember = (index: number) => setMembers(members.filter((_, i) => i !== index));

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 1. Create Firebase Auth User
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;

            // 2. Save Team Details in Firestore using UID as Document ID
            await setDoc(doc(db, "teams", uid), {
                teamName,
                leaderEmail: email,
                members: members.filter(m => m.trim() !== ""),
                shortlisted: false,
                totalTokens: 0,
                problemStatement: "", // Initially empty
                createdAt: new Date(),
                role: "team"
            });

            router.push("/team/dashboard");
        } catch (err: any) {
            setError(err.message || "Registration failed");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                <div className="text-center mb-8">
                    <div className="bg-blue-600 p-4 rounded-2xl w-fit mx-auto mb-4 shadow-xl shadow-blue-600/20">
                        <Rocket className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-black font-outfit">Team Registration</h1>
                    <p className="text-slate-500 mt-2">Create your startup profile for the hackathon</p>
                </div>

                <div className="glass p-8 rounded-3xl shadow-2xl space-y-8 border-white/20">
                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Startup Name</label>
                                <div className="relative">
                                    <Rocket className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={teamName}
                                        onChange={e => setTeamName(e.target.value)}
                                        placeholder="e.g. Phoenix AI"
                                        required
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 ring-blue-500 transition-all font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Leader Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="leader@startup.com"
                                        required
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 ring-blue-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 ring-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Founding Members</label>
                                <button type="button" onClick={addMember} className="text-[10px] font-black uppercase bg-blue-600/10 text-blue-600 px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-blue-600 hover:text-white transition-all">
                                    <Plus className="w-3 h-3" /> Add Member
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {members.map((m, i) => (
                                    <div key={i} className="flex gap-2 group">
                                        <input
                                            type="text"
                                            value={m}
                                            onChange={e => {
                                                const newM = [...members];
                                                newM[i] = e.target.value;
                                                setMembers(newM);
                                            }}
                                            placeholder={`Founder Name`}
                                            className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 ring-blue-500 transition-all text-sm"
                                        />
                                        {members.length > 1 && (
                                            <button type="button" onClick={() => removeMember(i)} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl">
                                                <Minus className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-5 text-lg font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30"
                        >
                            {loading ? "Initializing Startup..." : "Register Team"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500">
                        Already have a team? <Link href="/team/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
