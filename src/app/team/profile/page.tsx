"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Rocket, User, Mail, Phone, School, Coins, Star, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Member {
    name: string;
    rollNo: string;
    phone: string;
    email: string;
}

interface TeamData {
    teamName: string;
    leader: {
        name: string;
        phone: string;
        email: string;
    };
    collegeName: string;
    members: Member[];
    shortlisted: boolean;
    totalTokens: number;
}

export default function TeamProfile() {
    const { userData } = useAuth();
    const [team, setTeam] = useState<TeamData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTeam() {
            if (userData?.teamId) {
                const teamDoc = await getDoc(doc(db, "teams", userData.teamId));
                if (teamDoc.exists()) {
                    setTeam(teamDoc.data() as TeamData);
                }
            }
            setLoading(false);
        }
        fetchTeam();
    }, [userData]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!team) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Venture Not Found</p>
        </div>
    );

    return (
        <div className="min-h-screen p-6 md:p-12 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-5xl mx-auto space-y-10">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-500/20">
                            <Rocket className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black font-outfit uppercase tracking-tight">{team.teamName}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-blue-600 font-bold uppercase text-[10px] tracking-widest bg-blue-600/10 px-3 py-1 rounded-full">Founder: {team.leader.name}</span>
                                {team.shortlisted && (
                                    <span className="text-emerald-500 font-bold uppercase text-[10px] tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-emerald-500" /> Shortlisted
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="glass px-8 py-4 rounded-3xl flex items-center gap-4 border-blue-500/20">
                        <div className="text-right">
                            <div className="text-2xl font-black font-outfit text-blue-600 leading-none">🪙 {team.totalTokens.toLocaleString()}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">Current Valuation</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-8">
                        <section className="glass p-8 rounded-[2.5rem] border-white/20 space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 border-b border-blue-600/10 pb-4">Corporate Identity</h3>
                            <div className="space-y-4">
                                <InfoItem icon={School} label="Institution" value={team.collegeName} />
                                <InfoItem icon={Mail} label="Official Email" value={team.leader.email} />
                                <InfoItem icon={Phone} label="Contact Line" value={team.leader.phone} />
                            </div>
                        </section>
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                        <section className="glass p-8 rounded-[2.5rem] border-white/20 space-y-6">
                            <div className="flex justify-between items-center border-b border-blue-600/10 pb-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Board of Directors</h3>
                                <span className="text-[10px] font-black p-2 bg-blue-600/5 text-blue-600 rounded-lg">{team.members.length} Co-Founders</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {team.members.map((member, i) => (
                                    <div key={i} className="bg-slate-100 dark:bg-slate-900/50 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div className="font-black text-sm uppercase tracking-tight">{member.name}</div>
                                            <div className="text-[9px] font-black px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-500">{member.rollNo}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                                                <Mail className="w-3 h-3" /> {member.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                                                <Phone className="w-3 h-3" /> {member.phone}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ icon: Icon, label, value }: any) {
    return (
        <div className="space-y-1">
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</div>
            <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-black tracking-tight">{value}</span>
            </div>
        </div>
    );
}
