"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    getDocs,
    query,
    orderBy,
    doc,
    deleteDoc,
    writeBatch,
    where,
    limit
} from "firebase/firestore";
import {
    Users,
    Download,
    Search,
    CheckCircle,
    XCircle,
    Star,
    Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Team {
    id: string;
    teamName: string;
    leaderName: string;
    leaderEmail: string;
    collegeName: string;
    totalTokens: number;
    shortlisted: boolean;
    approved: boolean;
    members: string[];
}

export default function AdminTeamsList() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const q = query(collection(db, "teams"), orderBy("createdAt", "desc"), limit(200));
                const snap = await getDocs(q);
                const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
                setTeams(data);
            } catch (err) {
                console.error("Fetch teams error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTeams();
    }, []);

    const handleDeleteTeam = async (teamId: string, teamName: string) => {
        if (!window.confirm("Are you sure you want to delete this team?")) {
            return;
        }

        setDeletingId(teamId);
        try {
            // Delete Team Document
            await deleteDoc(doc(db, "teams", teamId));

            // Also delete related transactions (keep feature from previous step)
            const transQ = query(collection(db, "transactions"), where("teamId", "==", teamId));
            const transSnap = await getDocs(transQ);
            const batch = writeBatch(db);
            transSnap.forEach((transDoc) => {
                batch.delete(transDoc.ref);
            });
            await batch.commit();

            alert("Team deleted successfully");
        } catch (err: any) {
            console.error("Deletion failed:", err);
            alert("Deletion failed. Please try again.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleExport = () => {
        window.location.href = "/api/export-teams";
    };

    const filteredTeams = teams.filter(t =>
        t.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.leaderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.collegeName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="p-10 flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black font-outfit uppercase tracking-tight flex items-center gap-3">
                        <Users className="text-blue-600" /> Startup Reservoir
                    </h1>
                    <p className="text-slate-500">Managing all {teams.length} ventures in the ecosystem.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="btn-primary bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 flex items-center gap-2"
                    >
                        <Download className="w-5 h-5" /> Export to Excel
                    </button>
                </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-4 bg-blue-600/10 rounded-xl text-blue-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-black font-outfit">{teams.length}</div>
                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Total Teams</div>
                    </div>
                </div>
                <div className="glass p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-4 bg-yellow-500/10 rounded-xl text-yellow-500">
                        <Star className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-black font-outfit">{teams.filter(t => t.shortlisted).length}</div>
                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Shortlisted</div>
                    </div>
                </div>
                <div className="glass p-6 rounded-2xl relative overflow-hidden flex items-center px-6 border-blue-500/20">
                    <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search ventures, founders, or colleges..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 ring-blue-500"
                    />
                </div>
            </div>

            <div className="glass rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Startup / Founder</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Institution</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Capital</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Members</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredTeams.map((team) => (
                                <tr key={team.id} className="hover:bg-blue-600/5 transition-colors group">
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center gap-2">
                                            {team.approved ? (
                                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-slate-300" />
                                            )}
                                            {team.shortlisted && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 shadow-xl" />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-bold text-sm tracking-tight">{team.teamName}</div>
                                            <div className="text-[10px] text-blue-600 font-bold uppercase">{team.leaderName}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-slate-500 font-medium">{team.collegeName}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-black text-blue-600">🪙 {team.totalTokens?.toLocaleString() || 0}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-[10px] text-slate-400 font-bold uppercase">
                                            {team.members?.length || 0} Co-founders
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDeleteTeam(team.id, team.teamName)}
                                            disabled={deletingId === team.id}
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-xs font-bold uppercase tracking-wider",
                                                deletingId === team.id
                                                    ? "bg-slate-100 text-slate-400 animate-pulse"
                                                    : "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                                            )}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span>Delete</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredTeams.length === 0 && (
                    <div className="p-20 text-center space-y-4">
                        <Users className="w-12 h-12 text-slate-200 mx-auto" />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No matching ventures found in the reservoir.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
