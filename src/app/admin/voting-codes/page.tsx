"use client";

import React, { useState, useEffect } from "react";
import {
    Ticket,
    Plus,
    RefreshCcw,
    CheckCircle2,
    XCircle,
    Search,
    Download,
    Loader2,
    Coins,
    Trash2,
    Mail,
    Send,
    User,
    Calendar,
    AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface VotingCode {
    id: string;
    tokensRemaining: number;
    used: boolean;
    emailSent: boolean;
    voterName?: string;
    voterEmail?: string;
    activatedAt?: any;
    createdAt?: any;
}

export default function VotingCodesManagement() {
    const { user } = useAuth();
    const adminUid = user?.uid;

    const [numCodes, setNumCodes] = useState(10);
    const [tokensPerCode, setTokensPerCode] = useState(250);
    const [generating, setGenerating] = useState(false);
    const [codesList, setCodesList] = useState<VotingCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Email Dispatch State
    const [emailText, setEmailText] = useState("");
    const [dispatchTokens, setDispatchTokens] = useState(250);
    const [dispatching, setDispatching] = useState(false);

    const fetchCodes = async () => {
        try {
            const res = await fetch("/api/admin-generate-codes");
            const data = await res.json();
            if (data.codes) setCodesList(data.codes);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCodes();
    }, []);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setGenerating(true);
        try {
            const res = await fetch("/api/admin-generate-codes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ numberOfCodes: numCodes, tokensPerCode, adminUid }),
            });
            if (!res.ok) throw new Error("Generation failed");
            await fetchCodes();
            alert(`Successfully generated ${numCodes} mission access codes.`);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setGenerating(false);
        }
    };

    const handleDelete = async (code: string, used: boolean) => {
        if (!window.confirm(`Are you sure you want to delete cipher ${code}?`)) return;

        try {
            const res = await fetch("/api/admin-delete-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, adminUid }),
            });
            if (res.ok) {
                await fetchCodes();
            } else {
                const data = await res.json();
                alert(data.error || "Delete failed");
            }
        } catch (err) {
            alert("Delete failed");
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm("CRITICAL ACTION: This will delete ALL voting codes. This action is irreversible. Proceed?")) return;

        try {
            const res = await fetch("/api/admin-delete-all-codes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminUid }),
            });
            if (res.ok) {
                alert("All mission access codes have been wiped.");
                await fetchCodes();
            } else {
                const data = await res.json();
                alert(data.error || "Mass deletion failed");
            }
        } catch (err) {
            alert("Mass deletion failed.");
        }
    };

    const handleDispatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailText.trim()) return alert("Identify target email(s) first.");

        setDispatching(true);
        try {
            // 🔟 & 9️⃣ Regex will be handled on backend, but we send the raw textarea content
            const res = await fetch("/api/admin-send-codes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailText, tokensPerCode: dispatchTokens, adminUid }),
            });
            const data = await res.json();
            if (res.ok) {
                alert(`Dispatch Complete: ${data.sent} sent successfully, ${data.failed} failed.`);
                setEmailText("");
                await fetchCodes();
            } else {
                alert(data.error || "Dispatch failed.");
            }
        } catch (err) {
            alert("Dispatch failed due to network or SMTP error.");
        } finally {
            setDispatching(false);
        }
    };

    const filteredCodes = codesList.filter(c =>
        c.id.toLowerCase().includes(search.toLowerCase()) ||
        c.voterName?.toLowerCase().includes(search.toLowerCase()) ||
        c.voterEmail?.toLowerCase().includes(search.toLowerCase())
    );

    const downloadCSV = () => {
        const csvContent = "data:text/csv;charset=utf-8," +
            "Voting Code,Initial Tokens,Email Sent,Used Status,Voter Name,Voter Email,Activated At,Created At\n" +
            codesList.map(c => `${c.id},${c.tokensRemaining},${c.emailSent},${c.used ? "Used" : "Unused"},${c.voterName || ""},${c.voterEmail || ""},${c.activatedAt || "N/A"},${c.createdAt || "N/A"}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "voting_codes_audit_trail.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12 animate-in fade-in duration-700 pb-20">
            <div className="max-w-4xl w-full space-y-12">
                {/* Header - Centered */}
                <header className="flex flex-col items-center text-center space-y-6 border-b border-slate-200 dark:border-slate-800 pb-8">
                    <div className="p-4 bg-blue-600 rounded-3xl shadow-2xl shadow-blue-500/20 text-white">
                        <Ticket className="w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white">
                            Mission <span className="text-blue-600">Access</span>
                        </h1>
                        <p className="text-slate-500 font-medium">Strategic intelligence and credentials management</p>
                    </div>
                </header>

                <div className="flex flex-col items-center space-y-8">

                    {/* Tactical Dispatch - Centered & Max 500px */}
                    <section className="glass p-10 rounded-[2.5rem] border-white/20 space-y-8 shadow-xl w-full max-w-[500px]">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center justify-center gap-2">
                            <Mail className="w-4 h-4" /> Tactical Dispatch
                        </h2>
                        <form onSubmit={handleDispatch} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Intelligence (Emails)</label>
                                <textarea
                                    className="w-full h-40 rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-xs resize-none"
                                    placeholder="Paste one or multiple emails (comma, space, line break, any format)"
                                    value={emailText}
                                    onChange={(e) => setEmailText(e.target.value)}
                                />
                                <p className="text-[9px] text-slate-400 italic text-center">Regex parsing enabled: paste any text with emails.</p>
                            </div>
                            <InputField label="Tokens Per Agent" value={dispatchTokens} onChange={setDispatchTokens} type="number" icon={Coins} />
                            <SubmitButton loading={dispatching} icon={Send} label="Send Code(s)" activeLabel="Transmitting..." color="bg-emerald-600" />
                        </form>
                    </section>

                    {/* Manual Issuance */}
                    <section className="glass p-10 rounded-[2.5rem] border-white/20 space-y-8 shadow-xl w-full max-w-[500px]">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" /> Bulk Local Issuance
                        </h2>
                        <form onSubmit={handleGenerate} className="space-y-6">
                            <InputField label="Identifier Count" value={numCodes} onChange={setNumCodes} type="number" />
                            <InputField label="Stake Per Identifier" value={tokensPerCode} onChange={setTokensPerCode} type="number" icon={Coins} />
                            <SubmitButton loading={generating} icon={Ticket} label="Issue Ciphers" activeLabel="Processing..." color="bg-blue-600" />
                        </form>
                    </section>

                    {/* Danger Sector */}
                    <section className="glass p-10 rounded-[2.5rem] border-red-500/20 bg-red-500/5 space-y-6 shadow-xl w-full max-w-[500px]">
                        <div className="flex items-center justify-center gap-3 text-red-500">
                            <AlertTriangle className="w-5 h-5" />
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Danger Sector</h2>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium text-center">Permanently purge all mission access codes from the registry.</p>
                        <button
                            onClick={handleDeleteAll}
                            className="w-full py-4 rounded-2xl bg-red-500 text-white font-black uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 flex items-center justify-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" /> Delete All Voting Codes
                        </button>
                    </section>
                </div>

                {/* Live Manifest Table - Full Width */}
                <section className="space-y-6 mt-12 w-full">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-4">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
                            <Search className="w-4 h-4" /> Live Manifest ({codesList.length})
                        </h2>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input
                                    placeholder="Search by Cipher, Name, or Intelligence..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none text-[10px] font-bold text-slate-600 dark:text-slate-300 focus:ring-2 ring-blue-500/10 transition-all"
                                />
                            </div>
                            <button onClick={downloadCSV} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl hover:bg-slate-200 transition-all">
                                <Download className="w-4 h-4" />
                            </button>
                            <button onClick={fetchCodes} className="p-3 bg-blue-600/10 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                                <RefreshCcw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="glass rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
                        <div className="max-h-[600px] overflow-y-auto scrollbar-thin">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Cipher</th>
                                        <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Identity</th>
                                        <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Stake</th>
                                        <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Comm</th>
                                        <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Status</th>
                                        <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                    {loading ? (
                                        <SkeletonRows count={5} />
                                    ) : filteredCodes.length === 0 ? (
                                        <EmptyState />
                                    ) : filteredCodes.map((code) => (
                                        <tr key={code.id} className="group hover:bg-slate-50 dark:hover:bg-blue-600/5 transition-all">
                                            <td className="px-8 py-6">
                                                <div className="font-black font-mono text-xs text-blue-600 tracking-widest">{code.id}</div>
                                                <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> {code.createdAt ? new Date(code.createdAt).toLocaleDateString() : "Historical"}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="text-xs font-black uppercase text-slate-900 dark:text-white">{code.voterName || "Awaiting Auth"}</div>
                                                <div className="text-[9px] font-bold text-slate-500">{code.voterEmail || "No Email"}</div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className="text-xs font-black text-slate-900 dark:text-slate-100">{(code.tokensRemaining || 0).toLocaleString()}</span>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className={cn(
                                                    "px-2 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest",
                                                    code.emailSent ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent"
                                                )}>
                                                    {code.emailSent ? "Sent" : "None"}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className={cn(
                                                    "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest",
                                                    code.used ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                                                )}>
                                                    {code.used ? "Activated" : "Dormant"}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button
                                                    onClick={() => handleDelete(code.id, code.used)}
                                                    className="p-2 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

function InputField({ label, value, onChange, type = "text", icon: Icon, placeholder }: any) {
    return (
        <div className="space-y-2 w-full">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
            <div className="relative">
                {Icon && <Icon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
                <input
                    type={type}
                    value={value}
                    onChange={e => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
                    placeholder={placeholder}
                    className={cn(
                        "w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-center",
                        Icon && "pl-14 pr-10"
                    )}
                />
            </div>
        </div>
    );
}

function SubmitButton({ loading, icon: Icon, label, activeLabel, color }: any) {
    return (
        <button
            type="submit"
            disabled={loading}
            className={cn(
                "w-full py-5 rounded-2xl text-white font-black uppercase tracking-widest text-xs transition-all shadow-2xl disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95",
                color
            )}
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
            {loading ? activeLabel : label}
        </button>
    );
}

function SkeletonRows({ count }: { count: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-6">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4" />
                    </td>
                </tr>
            ))}
        </>
    );
}

function EmptyState() {
    return (
        <tr>
            <td colSpan={6} className="px-8 py-32 text-center text-slate-400 font-black uppercase tracking-widest text-[10px]">Registry Empty</td>
        </tr>
    );
}
