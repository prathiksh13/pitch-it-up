"use client";

import React, { useState, useEffect } from "react";
import {
    Settings,
    Upload,
    Link as LinkIcon,
    CheckCircle2,
    AlertCircle,
    FileUp,
    Info,
    ExternalLink,
    Loader2,
    Database,
    Trash2,
    TriangleAlert
} from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

interface ImportStats {
    imported: number;
    skipped: number;
    errors: number;
}

export default function RegistrationControlPage() {
    // Section 1: Google Form Link
    const [googleFormLink, setGoogleFormLink] = useState("");
    const [isSavingLink, setIsSavingLink] = useState(false);
    const [linkMessage, setLinkMessage] = useState({ type: "", text: "" });

    // Section 2: CSV Import
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [importStats, setImportStats] = useState<ImportStats | null>(null);
    const [importError, setImportError] = useState("");

    // Section 3: Reset Teams
    const [isClearing, setIsClearing] = useState(false);
    const [showConfirmReset, setShowConfirmReset] = useState(false);
    const [resetMessage, setResetMessage] = useState("");

    // Initial Load
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, "settings", "registration");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setGoogleFormLink(docSnap.data().googleFormLink || "");
                }
            } catch (err) {
                console.error("Error fetching settings:", err);
            }
        };
        fetchSettings();
    }, []);

    // Save Google Form Link
    const handleSaveLink = async () => {
        if (!googleFormLink.trim()) {
            setLinkMessage({ type: "error", text: "Link cannot be empty" });
            return;
        }

        setIsSavingLink(true);
        setLinkMessage({ type: "", text: "" });

        try {
            const docRef = doc(db, "settings", "registration");
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                await updateDoc(docRef, { googleFormLink: googleFormLink.trim() });
            } else {
                await setDoc(docRef, { googleFormLink: googleFormLink.trim() });
            }

            setLinkMessage({ type: "success", text: "Settings updated successfully!" });
            setTimeout(() => setLinkMessage({ type: "", text: "" }), 3000);
        } catch (err: any) {
            setLinkMessage({ type: "error", text: `Error: ${err.message}` });
        } finally {
            setIsSavingLink(false);
        }
    };

    // Handle CSV Upload
    const handleCsvUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!csvFile) {
            setImportError("Please select a CSV file first");
            return;
        }

        setIsUploading(true);
        setImportError("");
        setImportStats(null);

        try {
            const formData = new FormData();
            formData.append("file", csvFile);

            const response = await fetch("/api/import-teams", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to import teams");
            }

            setImportStats({
                imported: result.imported,
                skipped: result.skipped,
                errors: result.errors,
            });
            setCsvFile(null);
            // Reset file input
            const fileInput = document.getElementById("csv-upload") as HTMLInputElement;
            if (fileInput) fileInput.value = "";

        } catch (err: any) {
            setImportError(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    // Handle Reset Teams
    const handleResetTeams = async () => {
        setIsClearing(true);
        setResetMessage("");
        try {
            const response = await fetch("/api/clear-teams", {
                method: "POST",
            });
            const result = await response.json();

            if (!response.ok) throw new Error(result.error || "Failed to clear teams");

            setResetMessage(`Successfully cleared ${result.deletedCount} teams.`);
            setShowConfirmReset(false);
            setTimeout(() => setResetMessage(""), 5000);
        } catch (err: any) {
            setResetMessage(`Error: ${err.message}`);
        } finally {
            setIsClearing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <header className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                        <Settings className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-black font-outfit uppercase tracking-tighter">
                        Registration <span className="text-blue-600">Control</span>
                    </h1>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium ml-1">
                    Manage entry points and team synchronization
                </p>
            </header>

            <div className="grid grid-cols-1 gap-8">

                {/* SECTION 1: GOOGLE FORM LINK */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <LinkIcon className="w-24 h-24" />
                    </div>

                    <div className="flex items-center gap-2 mb-6 text-blue-600">
                        <LinkIcon className="w-5 h-5" />
                        <h2 className="text-sm font-black uppercase tracking-widest">Google Form Integration</h2>
                    </div>

                    <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                        Control the registration redirect for participants. This link will be used when registration is active.
                    </p>

                    <div className="space-y-4">
                        <div className="relative group">
                            <input
                                type="url"
                                value={googleFormLink}
                                onChange={(e) => setGoogleFormLink(e.target.value)}
                                placeholder="https://forms.gle/xxxxx"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                            />
                            {googleFormLink && (
                                <a
                                    href={googleFormLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            )}
                        </div>

                        <button
                            onClick={handleSaveLink}
                            disabled={isSavingLink}
                            className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20"
                        >
                            {isSavingLink ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Synchronizing...
                                </>
                            ) : (
                                "Update Link Configuration"
                            )}
                        </button>

                        <AnimatePresence>
                            {linkMessage.text && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`flex items-center gap-2 mt-4 p-4 rounded-xl text-sm font-medium ${linkMessage.type === "success"
                                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                            : "bg-red-500/10 text-red-600 border border-red-500/20"
                                        }`}
                                >
                                    {linkMessage.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                    {linkMessage.text}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.section>

                {/* SECTION 2: CSV TEAM IMPORT */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Database className="w-24 h-24" />
                    </div>

                    <div className="flex items-center gap-2 mb-6 text-purple-600">
                        <FileUp className="w-5 h-5" />
                        <h2 className="text-sm font-black uppercase tracking-widest">CSV Team Ingestion</h2>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-8 flex gap-3 items-start">
                        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed font-medium">
                            Ensure your CSV includes: <strong>Team Name</strong>, <strong>College Name</strong>, <strong>Leader Email</strong>.
                            Duplicates based on <span className="underline decoration-2 text-slate-900 dark:text-white">Team Name (ID)</span> or <span className="underline decoration-2 text-slate-900 dark:text-white">Leader Email</span> will be skipped.
                        </div>
                    </div>

                    <form onSubmit={handleCsvUpload} className="space-y-6">
                        <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-10 flex flex-col items-center justify-center transition-all hover:border-blue-500/50 group">
                            <input
                                id="csv-upload"
                                type="file"
                                accept=".csv"
                                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                disabled={isUploading}
                            />
                            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
                            </div>
                            <p className="text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-tight">
                                {csvFile ? csvFile.name : "Select CSV System File"}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-[0.2em]">
                                Drag & drop or click to browse
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={!csvFile || isUploading}
                            className="w-full px-8 py-5 bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-2xl"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing Batch Import...
                                </>
                            ) : (
                                <>
                                    <Database className="w-4 h-4" />
                                    Execute Batch Ingestion
                                </>
                            )}
                        </button>
                    </form>

                    {/* Results Display */}
                    <AnimatePresence>
                        {(importStats || importError) && (
                            <motion.div
                                initial={{ opacity: 0, filter: "blur(10px)" }}
                                animate={{ opacity: 1, filter: "blur(0px)" }}
                                className="mt-8 space-y-4"
                            >
                                <div className="h-px bg-slate-200 dark:bg-slate-800" />

                                {importError && (
                                    <div className="flex items-center gap-2 p-4 bg-red-500/10 text-red-600 border border-red-500/20 rounded-2xl text-sm font-medium">
                                        <AlertCircle className="w-4 h-4" />
                                        {importError}
                                    </div>
                                )}

                                {importStats && (
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 text-center">
                                            <p className="text-[10px] text-emerald-600/70 font-black uppercase tracking-widest mb-1">Imported</p>
                                            <p className="text-2xl font-black text-emerald-600">{importStats.imported}</p>
                                        </div>
                                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 text-center">
                                            <p className="text-[10px] text-amber-600/70 font-black uppercase tracking-widest mb-1">Skipped</p>
                                            <p className="text-2xl font-black text-amber-600">{importStats.skipped}</p>
                                        </div>
                                        <div className="bg-slate-500/5 border border-slate-500/20 rounded-2xl p-4 text-center">
                                            <p className="text-[10px] text-slate-600/70 font-black uppercase tracking-widest mb-1">Errors</p>
                                            <p className="text-2xl font-black text-slate-600">{importStats.errors}</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.section>

                {/* SECTION 3: SYSTEM RESET */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-red-500/5 border border-red-500/10 rounded-3xl p-8 overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                        <Trash2 className="w-24 h-24 text-red-600" />
                    </div>

                    <div className="flex items-center gap-2 mb-6 text-red-600">
                        <Trash2 className="w-5 h-5" />
                        <h2 className="text-sm font-black uppercase tracking-widest">Danger Zone</h2>
                    </div>

                    <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed max-w-2xl">
                        Purge all registered teams from the database. This action is irreversible and will reset the entire team registry.
                    </p>

                    {!showConfirmReset ? (
                        <button
                            onClick={() => setShowConfirmReset(true)}
                            className="px-8 py-4 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white border border-red-600/20 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-500/5"
                        >
                            Clear All Teams (Reset)
                        </button>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3 p-4 bg-red-600 text-white rounded-2xl animate-shake">
                                <TriangleAlert className="w-5 h-5 shrink-0" />
                                <p className="text-xs font-bold uppercase tracking-wide">Are you absolutely sure? This cannot be undone.</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleResetTeams}
                                    disabled={isClearing}
                                    className="flex-1 px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isClearing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, Purge Everything"}
                                </button>
                                <button
                                    onClick={() => setShowConfirmReset(false)}
                                    disabled={isClearing}
                                    className="px-8 py-4 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <AnimatePresence>
                        {resetMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`mt-6 p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${resetMessage.includes("Error")
                                        ? "bg-red-500/10 text-red-600 border border-red-500/20"
                                        : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                    }`}
                            >
                                {resetMessage.includes("Error") ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                {resetMessage}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.section>

            </div>
        </div>
    );
}
