"use client";

import React, { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload,
    FileText,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ArrowLeft,
    Database,
    ShieldAlert,
    BarChart3
} from "lucide-react";
import Link from "next/link";

export default function ImportTeamsPage() {
    const { userData, loading: authLoading } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [stats, setStats] = useState<{ imported: number, skipped: number, errors: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Security Check: Only admins allowed
    if (authLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
    );

    if (!userData || userData.role !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
                <div className="glass p-12 rounded-[3rem] text-center max-w-md border-red-500/20 shadow-2xl">
                    <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
                    <h1 className="text-3xl font-black font-outfit uppercase mb-4">Unauthorised Access</h1>
                    <p className="text-slate-500 mb-8 font-medium">Administrator privileges are required to access this protocol.</p>
                    <Link href="/" className="btn-primary inline-flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Return Home
                    </Link>
                </div>
            </div>
        );
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.name.endsWith(".csv")) {
                setFile(selectedFile);
                setError(null);
                setStats(null);
            } else {
                setError("Only .csv files are supported.");
                setFile(null);
            }
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);
        setStats(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/import-teams", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Import failed");
            }

            const data = await res.json();
            setStats(data);
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500 blur-[120px] rounded-full" />
                <div className="absolute top-[60%] -right-[10%] w-[30%] h-[30%] bg-emerald-500 blur-[100px] rounded-full" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10 space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-3">
                        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-all group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Dashboard
                        </Link>
                        <h1 className="text-5xl md:text-6xl font-black font-outfit uppercase tracking-tighter">
                            Batch <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Import</span>
                        </h1>
                        <p className="text-slate-500 font-medium max-w-md">Rapidly onboard teams using CSV exports from Google Form registrations.</p>
                    </div>
                    <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
                        <Database className="w-10 h-10 text-blue-600" />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {/* Upload Card */}
                    <div className="glass p-10 rounded-[2.5rem] border-white/20 shadow-2xl space-y-8">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600">
                                <Upload className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold font-outfit">Manifest Upload</h2>
                        </div>

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-[2rem] p-12 text-center cursor-pointer transition-all ${file
                                    ? 'border-emerald-500/50 bg-emerald-500/5'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                                }`}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".csv"
                                className="hidden"
                            />
                            <div className="space-y-4">
                                <div className={`w-20 h-20 rounded-2xl mx-auto flex items-center justify-center transition-all ${file ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                    {file ? <FileText className="w-10 h-10" /> : <Upload className="w-10 h-10" />}
                                </div>
                                <div>
                                    <p className="font-extrabold font-outfit text-2xl tracking-tight">
                                        {file ? file.name : "Select Registration CSV"}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-2 font-medium">
                                        {file ? `${(file.size / 1024).toFixed(1)} KB` : "Click to browse or drag & drop"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 shrink-0" /> {error}
                            </motion.div>
                        )}

                        <button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest text-lg transition-all shadow-2xl flex items-center justify-center gap-3 ${!file || uploading
                                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-600/40 active:scale-[0.98]'
                                }`}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Synchronizing Database...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-6 h-6" />
                                    Initiate Import
                                </>
                            )}
                        </button>
                    </div>

                    {/* Stats Card */}
                    <AnimatePresence>
                        {stats && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass p-10 rounded-[2.5rem] border-emerald-500/20 shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <BarChart3 className="w-32 h-32 text-emerald-600" />
                                </div>

                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-600/10 flex items-center justify-center text-emerald-600">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-bold font-outfit uppercase tracking-wider">Analysis complete</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <StatItem label="Imported" value={stats.imported} color="emerald" />
                                    <StatItem label="Skipped (Dupes)" value={stats.skipped} color="amber" />
                                    <StatItem label="Failed Records" value={stats.errors} color="red" />
                                </div>

                                <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
                                    <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">
                                        Database synchronisation successful at {new Date().toLocaleTimeString()}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function StatItem({ label, value, color }: { label: string, value: number, color: 'emerald' | 'amber' | 'red' }) {
    const colors = {
        emerald: "bg-emerald-600/10 border-emerald-600/20 text-emerald-600",
        amber: "bg-amber-600/10 border-amber-600/20 text-amber-600",
        red: "bg-red-600/10 border-red-600/20 text-red-600"
    };

    return (
        <div className={`p-8 rounded-3xl border ${colors[color]} relative group hover:scale-[1.02] transition-transform`}>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">{label}</div>
            <div className="text-5xl font-black font-outfit tracking-tighter">{value}</div>
        </div>
    );
}
