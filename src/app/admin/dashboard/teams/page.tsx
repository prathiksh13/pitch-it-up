"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, updateDoc, getDocs } from "firebase/firestore";
import { Users, CheckCircle2, XCircle, Star, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface Team {
    id: string;
    teamName: string;
    members: Array<{ name: string, rollNo: string }>;
    shortlisted: boolean;
    totalTokens: number;
    approved: boolean;
    problemId?: string;
}

interface Problem {
    id: string;
    title: string;
}

export default function AdminTeamsPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const teamsSnap = await getDocs(collection(db, "teams"));
                const tdata: Team[] = [];
                teamsSnap.forEach(d => tdata.push({ id: d.id, ...d.data() } as Team));
                if (mounted) setTeams(tdata);

                const problemsSnap = await getDocs(collection(db, "problemStatements"));
                const pdata: Problem[] = [];
                problemsSnap.forEach(d => pdata.push({ id: d.id, title: d.data().title } as Problem));
                if (mounted) setProblems(pdata);
            } catch (err) {
                console.error('Fetch failed', err);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => { mounted = false; };
    }, []);

    const toggleShortlist = async (teamId: string, current: boolean) => {
        await updateDoc(doc(db, "teams", teamId), { shortlisted: !current });
    };

    const setApproval = async (teamId: string, status: boolean) => {
        await updateDoc(doc(db, "teams", teamId), { approved: status });
    };

    const assignProblem = async (teamId: string, problemId: string) => {
        await updateDoc(doc(db, "teams", teamId), { problemId });
    };

    if (loading) return <div>Loading startup index...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold font-outfit">Startup Ecosystem</h1>
                    <p className="text-slate-500">Manage registrations, approvals, and problem assignments.</p>
                </div>
                <div className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">
                    Total: {teams.length} Teams
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Startup Name</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Problem Statement</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Capital</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {teams.map((team) => (
                                <tr key={team.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase",
                                            team.approved ? "bg-emerald-500/10 text-emerald-600" : "bg-orange-500/10 text-orange-600"
                                        )}>
                                            {team.approved ? "Verified" : "Pending"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-bold flex items-center gap-2">
                                                {team.teamName}
                                                {team.shortlisted && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />}
                                            </div>
                                            <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[150px]">
                                                {team.members?.map(m => m.name).join(", ")}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={team.problemId || ""}
                                            onChange={(e) => assignProblem(team.id, e.target.value)}
                                            className="bg-slate-100 dark:bg-slate-800 text-xs p-2 rounded-lg outline-none border-none focus:ring-1 ring-blue-500 w-full max-w-[180px]"
                                        >
                                            <option value="">Unassigned</option>
                                            {problems.map(p => (
                                                <option key={p.id} value={p.id}>{p.title}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-blue-600 text-sm">
                                        🪙 {team.totalTokens?.toLocaleString() || 0}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <ActionBtn
                                                onClick={() => toggleShortlist(team.id, team.shortlisted)}
                                                icon={<Star className={cn("w-4 h-4", team.shortlisted && "fill-white")} />}
                                                label="Shortlist"
                                                active={team.shortlisted}
                                                activeColor="bg-yellow-500"
                                            />
                                            <ActionBtn
                                                onClick={() => setApproval(team.id, true)}
                                                icon={<CheckCircle2 className="w-4 h-4" />}
                                                label="Approve"
                                                active={team.approved}
                                                activeColor="bg-emerald-600"
                                            />
                                            <ActionBtn
                                                onClick={() => setApproval(team.id, false)}
                                                icon={<XCircle className="w-4 h-4" />}
                                                label="Reject"
                                                color="red"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function ActionBtn({ icon, label, onClick, color = "blue", active = false, activeColor }: any) {
    const colors: any = {
        blue: "hover:bg-blue-600 hover:text-white text-blue-600 border-blue-600/20",
        red: "hover:bg-red-600 hover:text-white text-red-600 border-red-600/20"
    };

    return (
        <button
            onClick={onClick}
            title={label}
            className={cn(
                "p-2 rounded-lg border transition-all shadow-sm",
                active ? `${activeColor} text-white border-transparent` : colors[color]
            )}
        >
            {icon}
        </button>
    );
}
