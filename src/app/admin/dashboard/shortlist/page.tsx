"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, limit } from "firebase/firestore";
import { Trophy, Star, ExternalLink, MessageSquare, Save, Users, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Team {
    id: string;
    teamName: string;
    submissionLinks?: { demo: string, github: string, ppt: string };
    shortlisted: boolean;
    totalTokens: number;
}

export default function JudgingSuitePage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTeam, setActiveTeam] = useState<Team | null>(null);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const teamsQuery = query(collection(db, "teams"), limit(100));
                const snap = await getDocs(teamsQuery);
                const data: Team[] = [];
                snap.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Team));
                setTeams(data);
                if (data.length > 0 && !activeTeam) setActiveTeam(data[0]);
            } catch (err) {
                console.error("Teams fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTeams();
    }, []);

    const toggleShortlist = async (teamId: string, current: boolean) => {
        await updateDoc(doc(db, "teams", teamId), { shortlisted: !current });
    };

    if (loading) return <div>Synchronizing judge metrics...</div>;

    return (
        <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-160px)]">
            {/* Team List Sidebar */}
            <div className="lg:w-80 flex flex-col glass rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                    <h3 className="font-bold flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" /> Review Queue
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {teams.map(team => (
                        <button
                            key={team.id}
                            onClick={() => setActiveTeam(team)}
                            className={cn(
                                "w-full px-5 py-4 text-left transition-all hover:bg-blue-600/5 flex flex-col gap-1",
                                activeTeam?.id === team.id ? "bg-blue-600/10 border-r-4 border-blue-600" : "bg-transparent"
                            )}
                        >
                            <div className="font-bold text-sm flex items-center justify-between">
                                {team.teamName}
                                {team.shortlisted && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                            </div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-tighter">
                                Tokens: {team.totalTokens || 0}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Judging Panel */}
            <div className="flex-1 flex flex-col space-y-6 overflow-y-auto pr-2">
                {activeTeam ? (
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
                            <div>
                                <h1 className="text-3xl font-black font-outfit uppercase tracking-tight">{activeTeam.teamName}</h1>
                                <p className="text-slate-500 mt-1">Reviewing submissions and simulation performance.</p>
                            </div>
                            <button
                                onClick={() => toggleShortlist(activeTeam.id, activeTeam.shortlisted)}
                                className={cn(
                                    "btn-primary px-6 flex items-center gap-2",
                                    activeTeam.shortlisted ? "bg-yellow-500 hover:bg-yellow-600" : "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-700"
                                )}
                            >
                                <Star className={cn("w-5 h-5", activeTeam.shortlisted && "fill-white")} />
                                {activeTeam.shortlisted ? "Shortlisted" : "Shortlist for Finale"}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass p-8 rounded-3xl space-y-6">
                                <h3 className="font-bold text-lg flex items-center gap-2 mb-2">
                                    <ExternalLink className="w-5 h-5 text-blue-600" /> Deliverables
                                </h3>
                                <LinkCard label="Pitch Deck" url={activeTeam.submissionLinks?.ppt} />
                                <LinkCard label="GitHub Repository" url={activeTeam.submissionLinks?.github} />
                                <LinkCard label="Product Demo" url={activeTeam.submissionLinks?.demo} />
                            </div>

                            <div className="glass p-8 rounded-3xl flex flex-col">
                                <h3 className="font-bold text-lg flex items-center gap-2 mb-6">
                                    <MessageSquare className="w-5 h-5 text-blue-600" /> Internal Notes
                                </h3>
                                <textarea
                                    placeholder="Private judge comments (not visible to team)..."
                                    className="w-full flex-1 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 ring-blue-500 text-sm resize-none"
                                />
                                <button className="btn-primary mt-6 w-full flex items-center justify-center gap-2">
                                    <Save className="w-4 h-4" /> Save Scorecard
                                </button>
                            </div>
                        </div>

                        <div className="p-8 rounded-3xl border border-blue-500/10 bg-blue-600/5">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-blue-600" /> Simulation Intelligence
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <ScoreMini label="Capital Raised" value={`🪙 ${activeTeam.totalTokens || 0}`} />
                                <ScoreMini label="Community Rank" value="#3" />
                                <ScoreMini label="Growth Delta" value="1.2x" />
                                <ScoreMini label="Final score" value="88.5" />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                        <AlertCircle className="w-16 h-16 mb-4" />
                        <h2 className="text-xl font-bold">Select a team from the queue to start judging</h2>
                    </div>
                )}
            </div>
        </div>
    );
}

function LinkCard({ label, url }: { label: string, url?: string }) {
    if (!url) return (
        <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 opacity-50 flex justify-between items-center">
            <span className="text-xs font-bold uppercase">{label}</span>
            <span className="text-[10px] italic">Not submitted</span>
        </div>
    );

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-blue-600/10 border border-blue-600/20 text-blue-600 flex justify-between items-center hover:bg-blue-600/20 transition-all font-bold text-xs"
        >
            <span className="uppercase tracking-tight">{label}</span>
            <ExternalLink className="w-4 h-4" />
        </a>
    );
}

function ScoreMini({ label, value }: { label: string, value: string }) {
    return (
        <div>
            <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">{label}</p>
            <div className="text-xl font-black font-outfit">{value}</div>
        </div>
    );
}
