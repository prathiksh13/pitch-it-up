"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, Loader2, Rocket, Type, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export default function EventSettingsManagement() {
    const { user } = useAuth();
    const adminUid = user?.uid;

    const [eventTitle, setEventTitle] = useState("");
    const [eventTagline, setEventTagline] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/admin-event-settings");
                const data = await res.json();
                setEventTitle(data.eventTitle || "");
                setEventTagline(data.eventTagline || "");
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventTitle) return alert("Title is required.");

        setSaving(true);
        setSuccess(false);
        try {
            const res = await fetch("/api/admin-event-settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eventTitle, eventTagline, adminUid }),
            });
            if (res.ok) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                const data = await res.json();
                alert(data.error || "Save failed");
            }
        } catch (err) {
            alert("Save failed");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
    );

    return (
        <div className="flex flex-col items-center justify-start min-h-screen p-6 md:p-12 animate-in fade-in duration-700">
            <div className="max-w-xl w-full space-y-12">
                <header className="flex flex-col items-center text-center space-y-6">
                    <div className="p-4 bg-blue-600 rounded-3xl shadow-2xl shadow-blue-500/20 text-white">
                        <Settings className="w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white">
                            Event <span className="text-blue-600">Settings</span>
                        </h1>
                        <p className="text-slate-500 font-medium">Global branding and configuration control</p>
                    </div>
                </header>

                <section className="glass p-10 rounded-[2.5rem] border-white/20 space-y-8 shadow-xl">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 flex items-center justify-center gap-2">
                        <Pencil className="w-4 h-4" /> Branding Parameters
                    </h2>

                    <form onSubmit={handleSave} className="space-y-8">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Event Master Title</label>
                                <div className="relative">
                                    <Type className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={eventTitle}
                                        onChange={(e) => setEventTitle(e.target.value)}
                                        placeholder="e.g. THE RUNWAY"
                                        className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-center"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mission Tagline</label>
                                <div className="relative">
                                    <Rocket className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={eventTagline}
                                        onChange={(e) => setEventTagline(e.target.value)}
                                        placeholder="e.g. Where Ideas Turn Into Unicorns"
                                        className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-center"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className={cn(
                                "w-full py-5 rounded-2xl text-white font-black uppercase tracking-widest text-xs transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95",
                                success ? "bg-emerald-500 shadow-emerald-500/30" : "bg-blue-600 shadow-blue-500/30",
                                saving && "opacity-50"
                            )}
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? "Updating Archives..." : success ? "Branding Applied Successfully!" : "Deploy Changes"}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}
