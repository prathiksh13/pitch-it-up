"use client";

import React, { useState, useEffect } from "react";
import {
    FileText,
    Upload,
    Trash2,
    CheckCircle,
    XCircle,
    ExternalLink,
    Plus,
    Loader2
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

interface ProblemStatement {
    id: string;
    title: string;
    description: string;
    pdfUrl: string;
    isActive: boolean;
    createdAt?: any;
}

export default function ProblemStatementsControl() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [psList, setPsList] = useState<ProblemStatement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "problemStatements"), orderBy("createdAt", "desc"));
        const unsub = onSnapshot(q, (snap) => {
            setPsList(snap.docs.map(d => ({ id: d.id, ...d.data() } as ProblemStatement)));
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description || !file) return alert("All fields required");

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("file", file);

            const res = await fetch("/api/admin-upload-ps", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            setTitle("");
            setDescription("");
            setFile(null);
            const fileInput = document.getElementById("ps-file") as HTMLInputElement;
            if (fileInput) fileInput.value = "";
            alert("Problem Statement synchronized successfully!");
        } catch (err: any) {
            alert(err.message);
        } finally {
            setUploading(false);
        }
    };

    const toggleStatus = async (psId: string, current: boolean) => {
        try {
            await fetch("/api/admin-upload-ps", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ psId, isActive: !current }),
            });
        } catch (err) {
            console.error(err);
        }
    };

    const deletePs = async (psId: string) => {
        if (!confirm("Are you sure? This will delete the mission brief permanently.")) return;
        try {
            const res = await fetch(`/api/admin-upload-ps?psId=${psId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Deletion failed");
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <header className="flex flex-col gap-2 border-b border-slate-200 dark:border-slate-800 pb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20 text-white">
                        <FileText className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white">
                            Mission <span className="text-blue-600">Briefs</span>
                        </h1>
                        <p className="text-slate-500 font-medium">Coordinate and deploy problem statements for participants</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Upload Section */}
                <section className="glass p-10 rounded-[2.5rem] border-white/20 space-y-8 h-fit">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Deployment
                    </h2>

                    <form onSubmit={handleUpload} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Brief Title</label>
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Fintech Innovation Hub"
                                className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 transition-all font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Narrative Description</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Briefly describe the challenge scope..."
                                className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 transition-all font-medium h-32 resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">PDF Documentation</label>
                            <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 transition-all hover:border-blue-500/30 group">
                                <input
                                    id="ps-file"
                                    type="file"
                                    accept=".pdf"
                                    onChange={e => setFile(e.target.files?.[0] || null)}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center justify-center text-center">
                                    <Upload className="w-8 h-8 text-slate-300 group-hover:text-blue-500 mb-2 transition-colors" />
                                    <p className="text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-tight">
                                        {file ? file.name : "Select Asset Brief"}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest font-black">PDF Only • Max 10MB</p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={uploading}
                            className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            {uploading ? "Deploying Asset..." : "Execute Deployment"}
                        </button>
                    </form>
                </section>

                {/* List Section */}
                <section className="space-y-6">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 ml-4 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Live Briefing Room ({psList.length})
                    </h2>

                    <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 scrollbar-thin">
                        {loading && (
                            <div className="py-20 flex flex-col items-center gap-4 glass rounded-[2.5rem]">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Briefs...</span>
                            </div>
                        )}

                        {!loading && psList.length === 0 && (
                            <div className="py-20 text-center glass rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No active deployments found.</p>
                            </div>
                        )}

                        {psList.map((ps) => (
                            <div key={ps.id} className="glass p-8 rounded-[2rem] border-white/20 group hover:bg-white/[0.04] transition-all relative overflow-hidden">
                                {!ps.isActive && <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] z-10 flex items-center justify-center pointer-events-none">
                                    <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Deactivated</span>
                                </div>}

                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white leading-tight pr-4">
                                        {ps.title}
                                    </h3>
                                    <div className="flex items-center gap-2 z-20">
                                        <button
                                            onClick={() => toggleStatus(ps.id, ps.isActive)}
                                            className={`p-2 rounded-xl transition-all ${ps.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}
                                        >
                                            {ps.isActive ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                        </button>
                                        <button
                                            onClick={() => deletePs(ps.id)}
                                            className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500 mb-6 font-medium leading-relaxed">{ps.description}</p>
                                <div className="flex items-center gap-4">
                                    <a
                                        href={ps.pdfUrl}
                                        target="_blank"
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                                    >
                                        <ExternalLink className="w-3 h-3" /> View Document
                                    </a>
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">UID: {ps.id.slice(0, 8)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
