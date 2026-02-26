"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Coins,
    Rocket,
    Zap,
    RefreshCcw,
    History,
    LogOut,
    Loader2,
    MessageSquare,
    Send,
    LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export default function VoterDashboard() {
    const router = useRouter();
    const [session, setSession] = useState<any>(null);
    const [teams, setTeams] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [amount, setAmount] = useState<string>("");
    const [selectedTeam, setSelectedTeam] = useState<string>("");
    const [view, setView] = useState<"teams" | "history">("teams");

    useEffect(() => {
        const checkSession = () => {
            const stored = localStorage.getItem("votingSession");
            if (!stored) {
                router.push("/vote/login");
                return null;
            }
            return JSON.parse(stored);
        };

        const loadData = async () => {
            const s = checkSession();
            if (!s) return;
            setSession(s);

            try {
                const [teamsRes, historyRes] = await Promise.all([
                    fetch("/api/voter-get-teams"),
                    fetch(`/api/invest?code=${s.code}`)
                ]);
                const tData = await teamsRes.json();
                const hData = await historyRes.json();
                setTeams(tData.teams || []);
                setHistory(hData.history || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [router]);

    const handleInvest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTeam || !amount || Number(amount) <= 0) return;
        if (Number(amount) > session.tokensRemaining) {
            alert("Insufficient equity tokens for this injection.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/invest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: session.code,
                    teamId: selectedTeam,
                    amount: Number(amount)
                }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                const newSession = { ...session, tokensRemaining: data.newBalance };
                setSession(newSession);
                localStorage.setItem("votingSession", JSON.stringify(newSession));

                // Refresh data
                const hRes = await fetch(`/api/invest?code=${session.code}`);
                const hData = await hRes.json();
                setHistory(hData.history || []);

                setAmount("");
                setSelectedTeam("");
                alert("Strategic injection successful. Venture equity updated.");
            } else {
                alert(data.error || "Injection failed.");
            }
        } catch (err) {
            alert("Network disruption. Transaction aborted.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("votingSession");
        router.push("/");
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-slate-50 dark:bg-slate-950">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Intelligence Streams...</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12 animate-in fade-in duration-700 pb-24">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Dashboard Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-slate-100 dark:border-slate-800 pb-8">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-blue-600 rounded-[2rem] shadow-2xl shadow-blue-500/20 text-white relative">
                            <Zap className="w-8 h-8 fill-current" />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white ring-2 ring-emerald-500/20" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white leading-none mb-1">
                                Investor <span className="text-blue-600">Terminal</span>
                            </h1>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] bg-slate-200 dark:bg-slate-900 px-2 py-0.5 rounded-lg font-black uppercase tracking-widest text-slate-500 border border-slate-300 dark:border-white/5">Cipher: {session.code}</span>
                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><RefreshCcw className="w-2.5 h-2.5" /> High Integrity Feed</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600/5 dark:bg-blue-600/10 p-6 rounded-[2.5rem] border border-blue-600/10 flex items-center gap-6 shadow-xl">
                            <div className="text-right">
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1">Equity Remaining</div>
                                <div className="text-4xl font-black font-outfit text-slate-900 dark:text-white tracking-tighter leading-none">
                                    {session.tokensRemaining?.toLocaleString()}
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <Coins className="w-6 h-6" />
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all group shadow-sm"
                        >
                            <LogOut className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Interaction Area */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Tab Switcher */}
                        <div className="flex items-center gap-2 p-1.5 bg-slate-200/50 dark:bg-slate-900/50 rounded-[1.5rem] w-fit border border-white/5 shadow-inner">
                            <button
                                onClick={() => setView("teams")}
                                className={cn(
                                    "px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                    view === "teams" ? "bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xl" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                )}
                            >
                                <LayoutDashboard className="w-3.5 h-3.5" /> Discovery Node
                            </button>
                            <button
                                onClick={() => setView("history")}
                                className={cn(
                                    "px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                    view === "history" ? "bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xl" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                )}
                            >
                                <History className="w-3.5 h-3.5" /> Transaction Log
                            </button>
                        </div>

                        {view === "teams" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {teams.map((team) => (
                                    <div
                                        key={team.id}
                                        onClick={() => setSelectedTeam(team.id)}
                                        className={cn(
                                            "glass p-8 rounded-[2.5rem] border transition-all cursor-pointer relative group",
                                            selectedTeam === team.id
                                                ? "border-blue-600 bg-blue-600/5 ring-4 ring-blue-500/10"
                                                : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={cn(
                                                "p-3 rounded-2xl transition-all",
                                                selectedTeam === team.id ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                            )}>
                                                <Rocket className="w-5 h-5" />
                                            </div>
                                            {selectedTeam === team.id && (
                                                <div className="animate-in zoom-in duration-300">
                                                    <Zap className="w-5 h-5 text-emerald-500 fill-current" />
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                            {team.teamName}
                                        </h3>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">
                                            {team.collegeName}
                                        </p>
                                    </div>
                                ))}
                                {teams.length === 0 && (
                                    <div className="col-span-full py-20 text-center space-y-4 glass rounded-[2.5rem] border-dashed border-2 border-white/5">
                                        <RefreshCcw className="w-10 h-10 text-slate-300 mx-auto animate-spin" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Awaiting Venture Uplink...</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {history.map((inv) => (
                                    <div key={inv.id} className="glass p-8 rounded-[2.5rem] border-white/10 flex items-center justify-between group hover:bg-white/[0.02] transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                                                <History className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">{inv.teamName}</h4>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Injection Protocol Complete</p>
                                            </div>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <div className="text-xl font-black font-outfit text-emerald-500 tracking-tighter leading-none">+{inv.tokens}</div>
                                            <div className="text-[8px] font-bold text-slate-500 uppercase">
                                                {inv.createdAt ? formatDistanceToNow(new Date(inv.createdAt)) : "Real-time"} ago
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {history.length === 0 && (
                                    <div className="py-20 text-center space-y-4 glass rounded-[3rem] border-white/5">
                                        <MessageSquare className="w-10 h-10 text-slate-300 mx-auto opacity-20" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No Transaction History Detected.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Strategic Injection */}
                    <div className="space-y-8">
                        <section className="glass p-10 rounded-[3rem] border-white/20 sticky top-12 space-y-10 shadow-3xl">
                            <div>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-6 flex items-center gap-2">
                                    <Zap className="w-4 h-4 fill-current" /> Strategic Injection
                                </h2>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">Select a venture from the discovery node and identify desired equity allocation.</p>
                            </div>

                            <form onSubmit={handleInvest} className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Allocated Capital</label>
                                    <div className="relative group">
                                        <Coins className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={e => setAmount(e.target.value)}
                                            placeholder="Injection Value"
                                            className="w-full pl-16 pr-6 py-5 rounded-[1.5rem] bg-slate-100 dark:bg-slate-950/50 border-2 border-slate-100 dark:border-slate-800 outline-none focus:ring-4 ring-blue-500/10 focus:border-blue-500 transition-all font-black text-xl tracking-tighter"
                                        />
                                    </div>
                                </div>

                                <div className="p-6 rounded-[1.5rem] bg-blue-600/5 border border-blue-600/10 space-y-1">
                                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Target Module</div>
                                    <div className="text-sm font-black uppercase tracking-tight text-blue-600">
                                        {selectedTeam ? teams.find(t => t.id === selectedTeam)?.teamName : "Protocol: Identify Target"}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting || !selectedTeam || !amount}
                                    className="w-full py-6 rounded-[1.5rem] bg-slate-900 dark:bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-blue-500/30 disabled:opacity-50 flex items-center justify-center gap-3 group"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                                    {submitting ? "Processing..." : "Authorize Injection"}
                                </button>
                            </form>

                            <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 animate-pulse">
                                    <Zap className="w-3 h-3 fill-current" />
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Real-time valuation synchronization active.</span>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
