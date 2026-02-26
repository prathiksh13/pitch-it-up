"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, setDoc, doc, getDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, User, Mail, Plus, Minus, Phone, School, Key, CheckCircle, Lock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Member {
    name: string;
    rollNo: string;
    phone: string;
    email: string;
}

export default function Register() {
    const [teamName, setTeamName] = useState("");
    const [collegeName, setCollegeName] = useState("");
    const [leader, setLeader] = useState({ name: "", phone: "", email: "" });
    const [members, setMembers] = useState<Member[]>([]);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const addMember = () => {
        if (members.length >= 6) {
            setError("Maximum 6 members allowed (excluding leader).");
            return;
        }
        setMembers([...members, { name: "", rollNo: "", phone: "", email: "" }]);
        setError("");
    };

    const removeMember = (index: number) => {
        setMembers(members.filter((_, i) => i !== index));
    };

    const updateMember = (index: number, field: keyof Member, value: string) => {
        const newMembers = [...members];
        newMembers[index][field] = value;
        setMembers(newMembers);
    };

    const validateForm = async () => {
        if (!teamName || !collegeName || !leader.name || !leader.phone || !leader.email || !password || !confirmPassword) {
            return "Please fill all required fields.";
        }

        if (password.length < 6) {
            return "Password must be at least 6 characters.";
        }

        if (password !== confirmPassword) {
            return "Passwords do not match.";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(leader.email)) return "Invalid leader email format.";

        const rollNos = new Set();
        for (let i = 0; i < members.length; i++) {
            const m = members[i];
            if (!m.name || !m.rollNo || !m.phone || !m.email) {
                return `Please fill all fields for member ${i + 1}.`;
            }
            if (!emailRegex.test(m.email)) return `Invalid email for ${m.name}.`;
            if (rollNos.has(m.rollNo)) return `Duplicate Roll Number found: ${m.rollNo}`;
            rollNos.add(m.rollNo);
        }

        // Check if normalized teamId is unique
        const teamId = teamName.trim().toLowerCase();
        const teamSnap = await getDoc(doc(db, "teams", teamId));
        if (teamSnap.exists()) {
            return "This team name is already taken. Please choose another.";
        }

        return null;
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const validationError = await validateForm();
        if (validationError) {
            setError(validationError);
            setLoading(false);
            return;
        }

        try {
            const teamId = teamName.trim().toLowerCase();

            await setDoc(doc(db, "teams", teamId), {
                teamName: teamName.trim(), // Keep original case for display
                collegeName: collegeName.trim(),
                leader: {
                    name: leader.name.trim(),
                    phone: leader.phone.trim(),
                    email: leader.email.trim().toLowerCase()
                },
                members: members.map(m => ({
                    ...m,
                    email: m.email.trim().toLowerCase()
                })),
                teamPassword: password,
                shortlisted: false,
                eliminated: false,
                totalTokens: 0,
                createdAt: serverTimestamp(),
                role: "team"
            });

            alert("Registration successful! Redirecting to login...");
            router.push("/team/login");
        } catch (err: any) {
            console.error(err);
            setError("Registration failed. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 py-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl">
                <div className="text-center mb-12">
                    <div className="bg-blue-600 p-4 rounded-2xl w-fit mx-auto mb-4 shadow-xl shadow-blue-600/20">
                        <Rocket className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-black font-outfit uppercase tracking-tight">Startup Registry</h1>
                    <p className="text-slate-500 mt-2 font-medium">Initiate your venture into the Reservoir ecosystem</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-8">
                    <div className="glass p-8 md:p-10 rounded-[2.5rem] shadow-2xl space-y-10 border-white/20">
                        <section className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 border-b border-blue-600/10 pb-4">Venture Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput label="Startup Name" icon={Rocket} value={teamName} onChange={setTeamName} placeholder="e.g. Apex Systems" />
                                <FormInput label="Institution / College" icon={School} value={collegeName} onChange={setCollegeName} placeholder="University Name" />
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 border-b border-blue-600/10 pb-4">Security Credentials</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput label="Account Password" icon={Lock} value={password} onChange={setPassword} placeholder="Min 6 characters" type="password" />
                                <FormInput label="Confirm Password" icon={Lock} value={confirmPassword} onChange={setConfirmPassword} placeholder="Re-enter password" type="password" />
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 border-b border-blue-600/10 pb-4">Founder Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormInput label="Full Name" icon={User} value={leader.name} onChange={(v: string) => setLeader({ ...leader, name: v })} placeholder="Founder Name" />
                                <FormInput label="Phone Number" icon={Phone} value={leader.phone} onChange={(v: string) => setLeader({ ...leader, phone: v })} placeholder="+91 ..." />
                                <FormInput label="Official Email" icon={Mail} value={leader.email} onChange={(v: string) => setLeader({ ...leader, email: v })} placeholder="leader@startup.com" />
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="flex justify-between items-center border-b border-blue-600/10 pb-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 text-right">Co-Founding Team ({members.length}/6)</h3>
                                <button type="button" onClick={addMember} className="btn-secondary py-2 px-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <Plus className="w-3 h-3" /> Add Founder
                                </button>
                            </div>

                            <div className="space-y-4">
                                <AnimatePresence>
                                    {members.map((m, i) => (
                                        <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="relative bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="md:col-span-4 flex justify-between items-center mb-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Collaborator 0{i + 1}</span>
                                                <button type="button" onClick={() => removeMember(i)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <MemberInput placeholder="Name" value={m.name} onChange={(v: string) => updateMember(i, "name", v)} />
                                            <MemberInput placeholder="Roll No" value={m.rollNo} onChange={(v: string) => updateMember(i, "rollNo", v)} />
                                            <MemberInput placeholder="Phone" value={m.phone} onChange={(v: string) => updateMember(i, "phone", v)} />
                                            <MemberInput placeholder="Email" value={m.email} onChange={(v: string) => updateMember(i, "email", v)} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {members.length === 0 && (
                                    <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No additional founders added.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {error && <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center">{error}</div>}

                        <button type="submit" disabled={loading} className="btn-primary w-full py-5 text-lg font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30">
                            {loading ? "Establishing Node..." : "Initiate Registration"}
                        </button>
                    </div>
                </form>

                <p className="text-center mt-8 text-sm text-slate-500 font-medium">
                    Already part of the ecosystem? <Link href="/team/login" className="text-blue-600 font-black hover:underline">Access Portal</Link>
                </p>
            </motion.div>
        </div>
    );
}

function FormInput({ label, icon: Icon, value, onChange, placeholder, type = "text" }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{label}</label>
            <div className="relative">
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 ring-blue-500 transition-all font-bold text-sm" />
            </div>
        </div>
    );
}

function MemberInput({ placeholder, value, onChange }: any) {
    return (
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 ring-blue-500 transition-all text-sm font-medium" />
    );
}
