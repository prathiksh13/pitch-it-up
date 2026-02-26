"use client";

import React, { useState, useEffect } from "react";
import {
    Zap,
    ShieldAlert,
    ShieldCheck,
    Trophy,
    Activity,
    Coins,
    Star,
    Skull,
    RefreshCcw,
    Play,
    Pause,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export default function VotingControlCenter() {
    const [votingActive, setVotingActive] = useState(false);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [recentInvestments, setRecentInvestments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const fetchData = async () => {
        try {
            const res = await fetch("/api/admin-voting-control");
            const data = await res.json();
            setVotingActive(data.status?.votingActive || false);
            setLeaderboard(data.leaderboard || []);
            setRecentInvestments(data.recentInvestments || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Polling for live updates
        return () => clearInterval(interval);
    }, []);

    const toggleVoting = async () => {
        setUpdating(true);
        try {
            const res = await fetch("/api/admin-voting-control", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ votingActive: !votingActive }),
            });
            const data = await res.json();
            if (data.success) setVotingActive(data.votingActive);
        } catch (err) {
            alert("Control toggle failed.");
        } finally {
            setUpdating(false);
        }
    };

    const totalEquity = leaderboard.reduce((sum, t) => sum + (t.totalTokens || 0), 0);

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Control Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-slate-200 dark:border-slate-800 pb-8">
                <div className="flex items-center gap-6">
                    <div className={cn(
                        "p-4 rounded-3xl shadow-2xl transition-all duration-500",
                        votingActive ? "bg-emerald-500 shadow-emerald-500/20 text-white animate-pulse" : "bg-red-500 shadow-red-500/20 text-white"
                    )}>
                        {votingActive ? <Zap className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
                    </div>
                    <div>
                        <h1 className="text-4xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white">
                            Investment <span className="text-blue-600">Command</span>
                        </h1>
                        <p className="text-slate-500 font-medium">Strategic oversight for token distribution and equity valuation</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status Protocol</div>
                        <div className={cn("text-xs font-black uppercase tracking-widest", votingActive ? "text-emerald-500" : "text-red-500")}>
                            {votingActive ? "Ready for Transactions" : "Protocols Locked"}
                        </div>
                    </div>
                    <button
                        onClick={toggleVoting}
                        disabled={updating}
                        className={cn(
                            "group px-8 py-4 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest transition-all shadow-2xl",
                            votingActive
                                ? "bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white shadow-red-500/10"
                                : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white shadow-emerald-500/10"
                        )}
                    >
                        {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : votingActive ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                        {votingActive ? "Freeze Investment Protocol" : "Initialize Investment Protocol"}
                    </button>
                </div>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatBox
                    label="Total Equity Deployed"
                    value={totalEquity.toLocaleString()}
                    icon={Coins}
                    color="text-yellow-500"
                    bg="bg-yellow-500/5"
                />
                <StatBox
                    label="Active Ventures"
                    value={leaderboard.filter(t => !t.eliminated).length.toString()}
                    icon={Activity}
                    color="text-blue-500"
                    bg="bg-blue-500/5"
                />
                <StatBox
                    label="High Net Worth"
                    value={leaderboard[0]?.teamName || "N/A"}
                    icon={Trophy}
                    color="text-emerald-500"
                    bg="bg-emerald-500/5"
                    subtitle="Valuation Leader"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Real-time Leaderboard */}
                <section className="space-y-6">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 px-4 flex items-center gap-2">
                        <Trophy className="w-4 h-4" /> Valuation Index
                    </h2>
                    <div className="glass rounded-[2.5rem] p-4 border-white/10 overflow-hidden shadow-2xl">
                        <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2 scrollbar-thin p-2">
                            {leaderboard.map((team, idx) => (
                                <div key={team.id} className={cn(
                                    "p-6 rounded-3xl border transition-all flex items-center justify-between group",
                                    team.eliminated ? "bg-slate-500/5 opacity-50 border-transparent grayscale" : "bg-white/50 dark:bg-slate-900/50 border-white/5 hover:scale-[1.02] shadow-sm hover:shadow-blue-500/10"
                                )}>
                                    <div className="flex items-center gap-6">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs",
                                            idx === 0 ? "bg-yellow-50 text-yellow-600 border border-yellow-200" :
                                                idx === 1 ? "bg-slate-100 text-slate-600 border border-slate-200" :
                                                    idx === 2 ? "bg-orange-50 text-orange-600 border border-orange-200" :
                                                        "bg-slate-200/50 text-slate-400"
                                        )}>
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <div className="text-sm font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                                                {team.teamName}
                                                {team.shortlisted && <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />}
                                                {team.eliminated && <Skull className="w-3.5 h-3.5 text-red-500" />}
                                            </div>
                                            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Venture UID: {team.id}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black font-outfit text-blue-600 tracking-tighter">
                                            {(team.totalTokens || 0).toLocaleString()}
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tokens</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Investment Log */}
                <section className="space-y-6">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 px-4 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Live Transaction Feed
                    </h2>
                    <div className="glass rounded-[2.5rem] p-8 border-white/10 h-fit max-h-[730px] overflow-hidden flex flex-col">
                        <div className="space-y-6 overflow-y-auto pr-2 scrollbar-thin">
                            {recentInvestments.map((inv) => (
                                <div key={inv.id} className="flex gap-4 items-start relative before:absolute before:left-2 before:top-8 before:bottom-[-24px] before:w-[1px] before:bg-slate-200 last:before:hidden dark:before:bg-slate-800">
                                    <div className="w-4 h-4 rounded-full bg-blue-600 shrink-0 mt-1 shadow-lg shadow-blue-500/40 relative z-10" />
                                    <div className="space-y-2 flex-grow">
                                        <div className="flex justify-between items-center">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                {inv.createdAt ? formatDistanceToNow(new Date(inv.createdAt)) + " ago" : "Real-time"}
                                            </div>
                                            <div className="text-[9px] font-black uppercase text-blue-600 bg-blue-600/5 px-2 py-0.5 rounded-md">#{inv.votingCode}</div>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-white/5">
                                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                                                Strategic injection of <span className="text-blue-600 font-black">+{inv.tokens} tokens</span> into <span className="text-slate-900 dark:text-white font-black uppercase">{inv.teamName}</span> module.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {recentInvestments.length === 0 && (
                                <div className="py-20 text-center space-y-4">
                                    <RefreshCcw className="w-8 h-8 text-slate-300 mx-auto animate-reverse-spin" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Monitoring Transmission Streams...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

function StatBox({ label, value, icon: Icon, color, bg, subtitle }: any) {
    return (
        <div className="glass p-8 rounded-[2.5rem] border-white/20 flex items-center justify-between">
            <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{label}</div>
                <div className={cn("text-3xl font-black font-outfit tracking-tighter", color)}>{value}</div>
                {subtitle && <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subtitle}</div>}
            </div>
            <div className={cn("p-4 rounded-2xl", bg)}>
                <Icon className={cn("w-6 h-6", color)} />
            </div>
        </div>
    );
}
