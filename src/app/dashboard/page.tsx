"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
    Rocket,
    Users,
    ExternalLink,
    CheckCircle2,
    AlertCircle,
    Trophy,
    BookOpen
} from "lucide-react";
import { cn } from "../../lib/utils";

export default function ParticipantDashboard() {
    const { userData, loading: authLoading } = useAuth();
    const [team, setTeam] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [links, setLinks] = useState({
        demo: "",
        github: "",
        ppt: ""
    });

    useEffect(() => {
        const fetchTeam = async () => {
            if (!authLoading && userData?.teamId) {
                try {
                    const snap = await getDoc(doc(db, "teams", userData.teamId));
                    if (snap.exists()) {
                        const data = snap.data();
                        setTeam(data);
                        setLinks({
                            demo: data.submissionLinks?.demo || "",
                            github: data.submissionLinks?.github || "",
                            ppt: data.submissionLinks?.ppt || ""
                        });
                    }
                } catch (err) {
                    console.error("Dashboard fetch error:", err);
                } finally {
                    setLoading(false);
                }
            } else if (!authLoading) {
                setLoading(false);
            }
        };
        fetchTeam();
    }, [userData, authLoading]);

    const saveLinks = async () => {
        if (!userData?.teamId) return;
        setSaving(true);
        try {
            await updateDoc(doc(db, "teams", userData.teamId), {
                submissionLinks: links
            });
            alert("Links updated successfully!");
        } catch (e) {
            alert("Error saving links.");
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loading) return <div className="p-10 text-center">Loading dashboard...</div>;

    if (!userData?.teamId) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                <AlertCircle className="w-16 h-16 text-slate-400 mb-6" />
                <h1 className="text-3xl font-bold mb-4">No Team Linked</h1>
                <p className="text-slate-500">Your account isn't associated with a team yet. Please contact the admin or register your team.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Rocket className="text-blue-600" />
                        <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Startup Lab</span>
                    </div>
                    <h1 className="text-4xl font-bold font-outfit">{team?.teamName}</h1>
                    <p className="text-slate-500 mt-1">Refining disruption, one pivot at a time.</p>
                </div>

                <div className="flex gap-4">
                    <StatMini label="Capital Raised" value={`🪙 ${team?.totalTokens?.toLocaleString() || 0}`} />
                    <StatMini label="Current Rank" value="#3" /> {/* Rank logic can be added */}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Status Alert */}
                    {team?.shortlisted ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl flex items-center gap-4">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            <div>
                                <h3 className="text-emerald-500 font-bold text-lg">Shortlisted!</h3>
                                <p className="text-emerald-500/70 text-sm">Your team has advanced to the final pitching round. Prepare your deck!</p>
                            </div>
                        </div>
                    ) : team?.eliminated ? (
                        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex items-center gap-4">
                            <AlertCircle className="w-10 h-10 text-red-500" />
                            <div>
                                <h3 className="text-red-500 font-bold text-lg">Eliminated</h3>
                                <p className="text-red-500/70 text-sm">You didn't make the cut this time. Thank you for participating!</p>
                            </div>
                        </div>
                    ) : null}

                    {/* Assigned Problem Statement */}
                    <ProblemCard problemId={team?.problemId} />

                    {/* Submissions */}
                    <section className="glass p-8 rounded-3xl">
                        <h2 className="text-2xl font-bold font-outfit mb-6 flex items-center gap-2">
                            <ExternalLink className="w-5 h-5 text-blue-600" /> Deliverables
                        </h2>
                        <div className="space-y-6">
                            <LinkInput
                                label="Product Demo (Link)"
                                value={links.demo}
                                onChange={(v) => setLinks({ ...links, demo: v })}
                                placeholder="https://vimeo.com/..."
                            />
                            <LinkInput
                                label="GitHub Repository"
                                value={links.github}
                                onChange={(v) => setLinks({ ...links, github: v })}
                                placeholder="https://github.com/..."
                            />
                            <LinkInput
                                label="Pitch Deck (Google Drive/Canva)"
                                value={links.ppt}
                                onChange={(v) => setLinks({ ...links, ppt: v })}
                                placeholder="https://canva.com/..."
                            />
                            <button
                                onClick={saveLinks}
                                disabled={saving}
                                className="btn-primary w-full py-3 mt-4"
                            >
                                {saving ? "Deploying Updates..." : "Sync All Submissions"}
                            </button>
                        </div>
                    </section>
                </div>

                <div className="space-y-8">
                    {/* Team Members */}
                    <section className="glass p-6 rounded-3xl">
                        <h2 className="text-xl font-bold font-outfit mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" /> Founders
                        </h2>
                        <div className="space-y-3">
                            {team?.members?.map((m: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                                    <span className="font-medium">{m.name}</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">{m.rollNo}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Quick Actions */}
                    <section className="glass p-6 rounded-3xl">
                        <h2 className="text-xl font-bold font-outfit mb-4 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-blue-600" /> Simulation Vitals
                        </h2>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-blue-600/5 border border-blue-600/10">
                                <p className="text-[10px] uppercase font-bold text-blue-600">Investment Sentiment</p>
                                <div className="text-xl font-black mt-1">BULLISH 📈</div>
                            </div>
                            <div className="p-4 rounded-xl bg-orange-600/5 border border-orange-600/10">
                                <p className="text-[10px] uppercase font-bold text-orange-600">Runway Status</p>
                                <div className="text-xl font-black mt-1">8 Months</div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function StatMini({ label, value }: { label: string, value: string }) {
    return (
        <div className="glass px-6 py-4 rounded-2xl">
            <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">{label}</p>
            <div className="text-2xl font-black font-outfit">{value}</div>
        </div>
    );
}

function ProblemCard({ problemId }: { problemId?: string }) {
    const [problem, setProblem] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProblem = async () => {
            if (!problemId) {
                setLoading(false);
                return;
            }
            try {
                const snap = await getDoc(doc(db, "problemStatements", problemId));
                if (snap.exists()) setProblem(snap.data());
            } catch (err) {
                console.error("Problem fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProblem();
    }, [problemId]);

    if (loading) return <div className="glass p-8 rounded-3xl animate-pulse h-40" />;

    if (!problemId || !problem) {
        return (
            <div className="glass p-8 rounded-3xl border-orange-500/20 bg-orange-500/5">
                <h3 className="text-sm font-bold uppercase tracking-widest text-orange-600 mb-2 flex items-center gap-2">
                    <Rocket className="w-4 h-4" /> Operations Pending
                </h3>
                <p className="text-slate-500 text-sm">Waiting for organizers to assign your startup's problem statement.</p>
            </div>
        );
    }

    return (
        <section className="glass p-8 rounded-3xl border-blue-600/20 bg-blue-600/5 relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-600/10 px-2 py-1 rounded">
                            {problem.domain}
                        </span>
                        <h2 className="text-2xl font-bold font-outfit mt-3">{problem.title}</h2>
                    </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-2xl italic">
                    "{problem.description}"
                </p>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <BookOpen className="w-32 h-32" />
            </div>
        </section>
    );
}

function LinkInput({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder: string }) {
    return (
        <div>
            <label className="block text-sm font-medium mb-2 opacity-70">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 outline-none transition-all text-sm"
            />
        </div>
    );
}
