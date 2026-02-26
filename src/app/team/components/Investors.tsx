"use client";

import React, { useState, useEffect } from "react";
import { Coins, History, Loader2, User, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Investors({ teamId }: { teamId: string }) {
    const [investments, setInvestments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvestors = async () => {
            try {
                // We'll create a dedicated API or use a query on investments
                const res = await fetch(`/api/team-investors?teamId=${teamId}`);
                const data = await res.json();
                setInvestments(data.investments || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (teamId) fetchInvestors();
    }, [teamId]);

    if (loading) return (
        <div className="p-12 glass rounded-[2.5rem] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Investor Manifest...</p>
        </div>
    );

    const totalEquity = investments.reduce((sum, inv) => sum + (inv.tokens || 0), 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass p-8 rounded-[2.5rem] border-white/20 flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Total Backers</div>
                        <div className="text-3xl font-black font-outfit text-slate-900 dark:text-white">{investments.length}</div>
                    </div>
                    <div className="p-4 bg-blue-600/10 text-blue-600 rounded-2xl">
                        <User className="w-6 h-6" />
                    </div>
                </div>
                <div className="glass p-8 rounded-[2.5rem] border-white/20 flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Total Equity Injection</div>
                        <div className="text-3xl font-black font-outfit text-emerald-500">{totalEquity.toLocaleString()}</div>
                    </div>
                    <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                        <Coins className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Investors List */}
            <div className="glass rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                            <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Backer Identity</th>
                            <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Injection Value</th>
                            <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Activity Log</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {investments.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-8 py-20 text-center">
                                    <History className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4 opacity-50" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Awaiting capital infusion commitments.</p>
                                </td>
                            </tr>
                        ) : (
                            investments.map((inv) => (
                                <tr key={inv.id} className="group hover:bg-slate-50 dark:hover:bg-blue-600/5 transition-all">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-tight">{inv.voterName || "Anonymous Backer"}</div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <Coins className="w-3.5 h-3.5 text-emerald-500" />
                                            <span className="text-sm font-black text-emerald-500">+{inv.tokens?.toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-end gap-1">
                                            <Clock className="w-3 h-3" />
                                            {inv.createdAt ? formatDistanceToNow(new Date(inv.createdAt)) : "Real-time"} ago
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
