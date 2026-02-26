"use client";

import React, { useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    getDocs,
    getDoc,
    query,
    orderBy,
    doc,
    updateDoc,
    limit,
    where,
} from "firebase/firestore";
import {
    Shield,
    Users,
    Rocket,
    Trophy,
    Settings,
    Star,
    AlertCircle,
    CheckCircle2,
    Play,
    Square,
    Eye,
    TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchDashboardSummary } from "@/lib/firestoreOptimized";

export default function AdminDashboard() {
    const [teams, setTeams] = useState<any[]>([]);
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

    // ✅ Memoized fetch function to prevent recreating on every render
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { teams: fetchedTeams, status: fetchedStatus } =
                await fetchDashboardSummary(50);
            
            setTeams(fetchedTeams);
            setStatus(fetchedStatus);
        } catch (err) {
            console.error("❌ Dashboard fetch error:", err);
            setStatus({
                registrationOpen: true,
                votingRoundActive: false,
                resultsFinalized: false,
            });
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ Fetch data only once on mount (empty dependency array)
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const toggleShortlist = async (teamId: string, currentStatus: boolean) => {
        try {
            await updateDoc(doc(db, "teams", teamId), {
                shortlisted: !currentStatus,
            });
            // ✅ Update local state immediately
            setTeams((prev) =>
                prev.map((t) =>
                    t.id === teamId ? { ...t, shortlisted: !currentStatus } : t
                )
            );
        } catch (err) {
            console.error("❌ Update failed:", err);
            alert("Update failed");
        }
    };

    const toggleVoting = async () => {
        try {
            const newState = !status?.votingRoundActive;
            await updateDoc(doc(db, "eventStatus", "global"), {
                votingRoundActive: newState,
            });
            // ✅ Update local state immediately
            setStatus((prev: any) => ({
                ...prev,
                votingRoundActive: newState,
            }));
        } catch (err) {
            console.error("❌ Status update failed:", err);
            alert("Status update failed");
        }
    };

    const togglePass = (id: string) => {
        setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    if (loading)
        return (
            <div className="p-10 text-center font-bold font-outfit uppercase tracking-widest text-slate-500 animate-pulse">
                Initializing Dashboard...
            </div>
        );

    const leaderboardTeams = [...teams].sort(
        (a, b) => b.totalTokens - a.totalTokens
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter flex items-center gap-3">
                        <Shield className="text-blue-600" /> Command Central
                    </h1>
                    <p className="text-slate-500">Infrastructure Management & Oversight</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleVoting}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all",
                            status?.votingRoundActive
                                ? "bg-red-600 text-white shadow-lg shadow-red-500/30"
                                : "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                        )}
                    >
                        {status?.votingRoundActive ? (
                            <Square className="w-3 h-3" />
                        ) : (
                            <Play className="w-3 h-3" />
                        )}
                        {status?.votingRoundActive
                            ? "Freeze Market"
                            : "Activate Market"}
                    </button>
                    <div className="glass px-4 py-3 rounded-2xl border-white/20 flex items-center gap-3">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-xl font-black font-mono tracking-tighter">
                            {teams.length}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Teams List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <Rocket className="w-5 h-5 text-blue-600" />
                        <h3 className="text-xl font-black uppercase tracking-tight">
                            Venture Registry
                        </h3>
                    </div>

                    <div className="glass rounded-[2rem] overflow-hidden border border-white/10">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500">
                                        Startup / Founder
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500">
                                        Capital
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-right text-slate-500">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {teams.map((team) => (
                                    <tr
                                        key={team.id}
                                        className="group hover:bg-white/50 dark:hover:bg-white/[0.02] transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={cn(
                                                        "w-2 h-2 rounded-full",
                                                        team.shortlisted
                                                            ? "bg-emerald-500 shadow-lg shadow-emerald-500/50"
                                                            : "bg-slate-300"
                                                    )}
                                                />
                                                <div>
                                                    <div className="font-bold tracking-tight">
                                                        {team.teamName}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 uppercase">
                                                        {team.collegeName || "N/A"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-mono font-bold">
                                                🪙 {team.totalTokens?.toLocaleString() || 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() =>
                                                    toggleShortlist(team.id, team.shortlisted)
                                                }
                                                className={cn(
                                                    "p-2 rounded-xl transition-all",
                                                    team.shortlisted
                                                        ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                                                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-emerald-500 hover:text-white"
                                                )}
                                                title={
                                                    team.shortlisted
                                                        ? "Remove from shortlist"
                                                        : "Add to shortlist"
                                                }
                                            >
                                                <Star
                                                    className={cn(
                                                        "w-4 h-4",
                                                        team.shortlisted && "fill-current"
                                                    )}
                                                />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Live Leaderboard */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        <h3 className="text-xl font-black uppercase tracking-tight">
                            Market Cap Leaderboard
                        </h3>
                    </div>

                    <div className="glass p-8 rounded-[2.5rem] border-emerald-500/20 bg-emerald-500/[0.02] space-y-6">
                        {leaderboardTeams.slice(0, 5).map((team, index) => (
                            <div key={team.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div
                                        className={cn(
                                            "w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all",
                                            index === 0
                                                ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/20"
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                        )}
                                    >
                                        {index + 1}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm tracking-tight">
                                            {team.teamName}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm font-black font-mono">
                                    🪙 {team.totalTokens?.toLocaleString() || 0}
                                </div>
                            </div>
                        ))}

                        {teams.length === 0 && (
                            <div className="text-center py-12 text-slate-400 italic text-sm">
                                No market data available.
                            </div>
                        )}

                        <div className="pt-6 border-t border-emerald-500/10 text-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/50">
                                Tracking {teams.length} global entities
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
