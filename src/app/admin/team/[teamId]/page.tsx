"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Rocket,
    Users,
    Link as LinkIcon,
    ExternalLink,
    Coins,
    Star,
    Skull,
    MessageCircle,
    CheckCircle2,
    Loader2,
    FileText,
    Github,
    FileDown,
    Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export default function AdminTeamDetail() {
    const params = useParams();
    const router = useRouter();
    const teamId = params.teamId as string;

    const [team, setTeam] = useState<any>(null);
    const [queries, setQueries] = useState<any[]>([]);
    const [investments, setInvestments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/admin-get-team-details?teamId=${teamId}`);
            if (!res.ok) throw new Error("Fetch failed");
            const data = await res.json();
            setTeam(data.team);
            setQueries(data.queries || []);
            setInvestments(data.investments || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [teamId]);

    const resolveQuery = async (queryId: string) => {
        setUpdating(true);
        try {
            await fetch("/api/admin-get-team-details", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teamId, queryId, status: "resolved" }),
            });
            await fetchData();
        } catch (err) {
            alert("Update failed");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-slate-50 dark:bg-slate-950">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Syncing Intelligence...</span>
        </div>
    );

    if (!team) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400 font-black uppercase tracking-widest gap-4">
            <Skull className="w-12 h-12" />
            Venture target lost in subspace.
            <button onClick={() => router.back()} className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] tracking-widest font-black uppercase shadow-xl">Abort & Return</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12 animate-in fade-in duration-700 pb-20">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-8">
                        <button onClick={() => router.back()} className="p-4 bg-slate-200/50 dark:bg-slate-900/50 rounded-2xl hover:scale-110 transition-all text-slate-600 dark:text-slate-400 group">
                            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-500/20">
                                <Rocket className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white">
                                    {team.teamName}
                                </h1>
                                <p className="text-slate-500 font-bold flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 px-2 py-0.5 bg-blue-600/10 rounded-md">Venture ID:</span> {team.id}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <StatusChip active={team.shortlisted} label="Shortlisted" icon={Star} color="text-emerald-500" bg="bg-emerald-500/10" />
                        <StatusChip active={team.eliminated} label="Eliminated" icon={Skull} color="text-red-500" bg="bg-red-500/10" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Primary Intelligence Section */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Venture Details Card */}
                        <div className="glass p-10 rounded-[2.5rem] border-white/20 space-y-8">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
                                <Users className="w-4 h-4" /> Core Intelligence
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <DetailRow label="Institution" value={team.collegeName} />
                                    <DetailRow label="Strategic Briefing" value={team.selectedProblemStatement?.title || "No Selection"} sub="(Target Problem Statement)" />
                                </div>
                                <div className="space-y-6">
                                    <DetailRow label="Founding Member" value={team.leader?.name} sub={team.leader?.email} />
                                    <DetailRow label="Comm Line" value={team.leader?.phone} />
                                </div>
                            </div>
                        </div>

                        {/* Co-Founders Grid */}
                        <div className="glass p-10 rounded-[2.5rem] border-white/20 space-y-8">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
                                <Users className="w-4 h-4" /> Co-Founding Team ({team.members?.length || 0})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {team.members?.map((m: any, i: number) => (
                                    <div key={i} className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-white/5 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <span className="font-bold text-slate-800 dark:text-slate-100">{m.name}</span>
                                            <span className="text-[10px] bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded-lg font-black uppercase">{m.rollNo}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{m.email}</p>
                                    </div>
                                ))}
                                {(!team.members || team.members.length === 0) && (
                                    <div className="col-span-full py-8 text-center text-slate-400 font-black uppercase tracking-widest text-[10px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">Solo Venture Operation</div>
                                )}
                            </div>
                        </div>

                        {/* Asset Submissions */}
                        <div className="glass p-10 rounded-[2.5rem] border-white/20 space-y-8">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Mission Assets
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <AssetCard label="Venture PPT" value={team.submissions?.ppt} icon={FileText} />
                                <AssetCard label="GitHub Repository" value={team.submissions?.github} icon={Github} />
                                <AssetCard label="Official Report" value={team.submissions?.report} icon={FileDown} />
                            </div>
                        </div>

                        {/* Investment History Section */}
                        <div className="glass p-10 rounded-[2.5rem] border-white/20 space-y-8 shadow-xl">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
                                    <Coins className="w-4 h-4" /> Strategic Investment Ledger
                                </h3>
                                <div className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                                    {investments.length} Total Backers
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="border-b border-slate-100 dark:border-slate-800/50">
                                        <tr>
                                            <th className="pb-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Investor</th>
                                            <th className="pb-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Cipher</th>
                                            <th className="pb-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Equity</th>
                                            <th className="pb-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/20">
                                        {investments.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="py-12 text-center text-[10px] font-black uppercase text-slate-400 italic">No capital injections recorded.</td>
                                            </tr>
                                        ) : (
                                            investments.map((inv: any) => (
                                                <tr key={inv.id} className="group hover:bg-slate-50 dark:hover:bg-blue-600/5 transition-all">
                                                    <td className="py-5">
                                                        <div className="text-xs font-black uppercase text-slate-900 dark:text-white">{inv.voterName || "Anonymous Patient"}</div>
                                                        <div className="text-[9px] text-slate-400 font-bold">Verified Backer</div>
                                                    </td>
                                                    <td className="py-5 text-center">
                                                        <span className="text-[10px] font-mono font-black text-blue-600 tracking-widest bg-blue-600/5 px-2 py-1 rounded-lg">
                                                            {inv.votingCode}
                                                        </span>
                                                    </td>
                                                    <td className="py-5 text-center">
                                                        <div className="flex items-center justify-center gap-1.5 text-emerald-500 font-black">
                                                            <Coins className="w-3 h-3" />
                                                            <span className="text-xs">+{inv.tokens?.toLocaleString()}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-5 text-right">
                                                        <div className="text-[9px] font-bold text-slate-500 flex items-center justify-end gap-1 uppercase">
                                                            <Clock className="w-2.5 h-2.5" />
                                                            {inv.createdAt ? formatDistanceToNow(new Date(inv.createdAt)) + " ago" : "Real-time"}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Side Communication & Financials */}
                    <div className="space-y-8">
                        {/* Financial Station */}
                        <div className="glass p-10 rounded-[2.5rem] border-white/20 space-y-8 bg-blue-600/5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Equity Tokens</h3>
                                <div className="p-2 bg-blue-600 rounded-xl text-white">
                                    <Coins className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <div className="text-5xl font-black font-outfit text-slate-900 dark:text-white tracking-tighter">
                                    {(team.totalTokens || 0).toLocaleString()}
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Current Valuation</p>
                            </div>
                        </div>

                        {/* Intelligence Logs (Queries) */}
                        <div className="glass p-10 rounded-[2.5rem] border-white/20 space-y-8 h-fit">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
                                <MessageCircle className="w-4 h-4" /> Comm Logs ({queries.length})
                            </h3>
                            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                                {queries.map((q: any) => (
                                    <div key={q.id} className="space-y-3 relative group">
                                        <div className="flex justify-between items-start">
                                            <span className={cn(
                                                "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                                                q.status === "open" ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                                            )}>
                                                {q.status}
                                            </span>
                                            <span className="text-[8px] font-bold text-slate-400">
                                                {q.createdAt && formatDistanceToNow(new Date(q.createdAt))} ago
                                            </span>
                                        </div>
                                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-100 dark:bg-slate-900/50 p-4 rounded-2xl rounded-tl-none">{q.message}</p>

                                        {q.status === "open" && (
                                            <button
                                                onClick={() => resolveQuery(q.id)}
                                                disabled={updating}
                                                className="w-full py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                            >
                                                Mark Resolved
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {queries.length === 0 && (
                                    <p className="text-[10px] text-center font-black uppercase text-slate-400 py-10">No active comm logs.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
    return (
        <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{value || "N/A"}</p>
            {sub && <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{sub}</p>}
        </div>
    );
}

function StatusChip({ active, label, icon: Icon, color, bg }: { active: boolean; label: string; icon: any; color: string; bg: string }) {
    if (!active) return null;
    return (
        <div className={cn("flex items-center gap-2 px-4 py-2 rounded-2xl border border-white/10", bg)}>
            <Icon className={cn("w-4 h-4", color)} />
            <span className={cn("text-[10px] font-black uppercase tracking-widest", color)}>{label}</span>
        </div>
    );
}

function AssetCard({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
    const isSubmitted = !!value;
    return (
        <div className={cn(
            "p-6 rounded-3xl border transition-all flex flex-col gap-4",
            isSubmitted ? "bg-emerald-500/5 border-emerald-500/20" : "bg-slate-50 dark:bg-slate-900/50 border-slate-200/50 dark:border-white/5 opacity-60"
        )}>
            <div className="flex justify-between items-start">
                <div className={cn("p-2 rounded-xl", isSubmitted ? "bg-emerald-500/10 text-emerald-600" : "text-slate-400 bg-slate-200/50 dark:bg-slate-800/50")}>
                    <Icon className="w-5 h-5" />
                </div>
                {isSubmitted ? (
                    <span className="text-[8px] font-black uppercase text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full bg-emerald-500/10">Deployed</span>
                ) : (
                    <span className="text-[8px] font-black uppercase text-slate-400 border border-slate-400/20 px-2 py-0.5 rounded-full">Missing</span>
                )}
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                {isSubmitted ? (
                    <a href={value} target="_blank" className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
                        Secure Link <ExternalLink className="w-2 h-2" />
                    </a>
                ) : (
                    <span className="text-[10px] font-bold text-slate-500 italic">No asset uploaded</span>
                )}
            </div>
        </div>
    );
}
