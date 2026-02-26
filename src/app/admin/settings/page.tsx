"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { Link as LinkIcon, Save, ArrowLeft, Loader2, CheckCircle, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function AdminSettings() {
    const { userData, loading: authLoading } = useAuth();
    const [googleFormLink, setGoogleFormLink] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docSnap = await getDoc(doc(db, "settings", "registration"));
                if (docSnap.exists()) {
                    setGoogleFormLink(docSnap.data().googleFormLink || "");
                }
            } catch (err) {
                console.error("Error fetching settings:", err);
            } finally {
                setLoading(false);
            }
        };

        if (userData?.role === "admin") {
            fetchSettings();
        }
    }, [userData]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        try {
            const docRef = doc(db, "settings", "registration");
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                await updateDoc(docRef, { googleFormLink });
            } else {
                await setDoc(docRef, { googleFormLink });
            }

            setMessage("Link updated successfully!");
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            console.error("Error saving settings:", err);
            setMessage("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || (userData && loading)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!userData || userData.role !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
                <div className="glass p-12 rounded-[3rem] text-center max-w-md border-red-500/20">
                    <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
                    <h1 className="text-3xl font-black font-outfit uppercase mb-4">Access Denied</h1>
                    <p className="text-slate-500 mb-8 font-medium">Only administrators can access registration settings.</p>
                    <Link href="/" className="btn-primary inline-flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Go Back
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 md:p-12 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-2xl mx-auto space-y-12">
                <div className="space-y-4">
                    <Link href="/admin/dashboard" className="text-sm font-bold text-slate-500 hover:text-blue-600 flex items-center gap-2 transition-all">
                        <ArrowLeft className="w-4 h-4" /> Admin Dashboard
                    </Link>
                    <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter">Registration <span className="text-blue-600">Settings</span></h1>
                    <p className="text-slate-500 font-medium">Configure where teams are directed when clicking 'Register'.</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-8 rounded-[2.5rem] border-white/20 shadow-2xl"
                >
                    <form onSubmit={handleSave} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                                <LinkIcon className="w-3 h-3" /> Google Form Redirect Link
                            </label>
                            <input
                                type="url"
                                value={googleFormLink}
                                onChange={(e) => setGoogleFormLink(e.target.value)}
                                placeholder="https://forms.gle/..."
                                required
                                className="w-full px-6 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 ring-blue-500 transition-all font-bold"
                            />
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1">
                                Users will be sent to this URL when clicking the register button.
                            </p>
                        </div>

                        {message && (
                            <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${message.includes("Failed") ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"}`}>
                                {message.includes("Failed") ? null : <CheckCircle className="w-5 h-5" />}
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-primary w-full py-5 text-lg font-black uppercase tracking-widest shadow-xl shadow-blue-500/30 flex items-center justify-center gap-3"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Updating Registry...
                                </>
                            ) : (
                                <>
                                    <Save className="w-6 h-6" />
                                    Save Configuration
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
