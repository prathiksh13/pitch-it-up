"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { Shield, Play, Square, CheckCircle, RefreshCcw, Lock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventStatus {
    registrationOpen: boolean;
    pitchingCompleted: boolean;
    votingRoundActive: boolean;
    resultsFinalized: boolean;
    currentRound: string;
}

export default function EventControlPage() {
    const [status, setStatus] = useState<EventStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            const docRef = doc(db, "eventStatus", "global");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setStatus(docSnap.data() as EventStatus);
            } else {
                const initialStatus = {
                    registrationOpen: true,
                    pitchingCompleted: false,
                    votingRoundActive: false,
                    resultsFinalized: false,
                    currentRound: "Registration",
                };
                await setDoc(docRef, initialStatus);
                setStatus(initialStatus);
            }
            setLoading(false);
        };

        fetchStatus();
    }, []);

    const toggleStatus = async (key: keyof EventStatus) => {
        if (!status) return;
        const newStatus = { ...status, [key]: !status[key] };
        await updateDoc(doc(db, "eventStatus", "global"), { [key]: newStatus[key] });
        setStatus(newStatus);
    };

    if (loading) return <div>Loading status...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-bold font-outfit">Event Control Hub</h1>
                    <p className="text-slate-500">Orchestrate the hackathon flow and rounds.</p>
                </div>
                <div className="bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 border border-emerald-500/20">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live System
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ControlCard
                    title="Team Registration"
                    description="Allow new teams to join the hackathon and verify roll numbers."
                    isActive={status?.registrationOpen}
                    onToggle={() => toggleStatus("registrationOpen")}
                    icon={<Users className="w-5 h-5" />}
                />
                <ControlCard
                    title="Pitching Phase"
                    description="Marking pitching as completed will unlock submission galleries for voters."
                    isActive={status?.pitchingCompleted}
                    onToggle={() => toggleStatus("pitchingCompleted")}
                    icon={<Play className="w-5 h-5" />}
                />
                <ControlCard
                    title="Voting Round"
                    description="Activate the public investment portal. Students can now spend tokens."
                    isActive={status?.votingRoundActive}
                    onToggle={() => toggleStatus("votingRoundActive")}
                    icon={<Lock className="w-5 h-5" />}
                    danger
                />
                <ControlCard
                    title="Finalize Results"
                    description="Freeze the leaderboard and lock all transactions. This is irreversible."
                    isActive={status?.resultsFinalized}
                    onToggle={() => toggleStatus("resultsFinalized")}
                    icon={<CheckCircle className="w-5 h-5" />}
                    danger
                />
            </div>

            <div className="mt-12 glass p-8 rounded-2xl border-blue-500/10">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <RefreshCcw className="w-5 h-5 text-blue-600" /> Administrative Actions
                </h3>
                <div className="flex flex-wrap gap-4">
                    <button className="btn-secondary text-sm">Clear Leaderboard Cache</button>
                    <button className="btn-secondary text-sm">Force Sync Firestore</button>
                    <button className="px-4 py-2 bg-red-600/10 text-red-600 border border-red-600/20 rounded-lg text-sm font-medium hover:bg-red-600/20 transition-all">
                        Reset All Simulation Metrics
                    </button>
                </div>
            </div>
        </div>
    );
}

function ControlCard({ title, description, isActive, onToggle, icon, danger }: any) {
    return (
        <div className={cn(
            "p-6 rounded-2xl border transition-all",
            isActive
                ? "bg-white dark:bg-slate-900 border-emerald-500/30 ring-1 ring-emerald-500/10"
                : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800"
        )}>
            <div className="flex justify-between items-start mb-4">
                <div className={cn(
                    "p-3 rounded-xl",
                    isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                )}>
                    {icon}
                </div>
                <button
                    onClick={onToggle}
                    className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                        isActive ? (danger ? "bg-red-600" : "bg-emerald-500") : "bg-slate-300 dark:bg-slate-700"
                    )}
                >
                    <span className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        isActive ? "translate-x-5" : "translate-x-0"
                    )} />
                </button>
            </div>
            <h3 className="font-bold text-lg mb-1">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{description}</p>
            <div className="flex items-center gap-2">
                <span className={cn(
                    "w-2 h-2 rounded-full",
                    isActive ? "bg-emerald-500" : "bg-slate-400"
                )} />
                <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    isActive ? "text-emerald-500" : "text-slate-400"
                )}>
                    {isActive ? "Status: Active" : "Status: Inactive"}
                </span>
            </div>
        </div>
    );
}
