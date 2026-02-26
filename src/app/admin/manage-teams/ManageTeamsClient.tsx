"use client";

import React, { useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
  where,
  getDocs,
  writeBatch,
  limit,
} from "firebase/firestore";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Trash2,
  Star,
  Skull,
  RefreshCcw,
  Phone,
  School,
  Coins,
  Calendar,
  CheckCircle2,
  XCircle,
  Mail,
  Key,
  User,
  Info,
  Lock,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fetchTeamsForManagement } from "@/lib/firestoreOptimized";

const PasswordModal = dynamic(() => import("@/components/admin/PasswordModal"), {
  loading: () => <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm" />,
  ssr: false,
});

interface Member {
  name: string;
  rollNo: string;
  phone: string;
  email: string;
}

interface Team {
  id: string;
  teamName: string;
  leader: {
    name: string;
    phone: string;
    email: string;
  };
  collegeName: string;
  members: Member[];
  teamPassword?: string;
  shortlisted: boolean;
  eliminated: boolean;
  totalTokens: number;
  createdAt: any;
  selectedProblemStatement?: {
    title: string;
    psId: string;
  };
}

export default function ManageTeamsClient() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (!authLoading) {
      if (!userData || userData.role !== "admin") {
        router.push("/admin/login");
      }
    }
  }, [userData, authLoading, router]);

  // ✅ Fetch teams only when auth resolves and user is admin
  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin-get-teams", {
        method: "GET",
        headers: { "x-admin-uid": user?.uid || "" },
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Failed to fetch");
      setTeams(payload.teams || []);
    } catch (error) {
      console.error("❌ Fetch teams failed:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ✅ Proper dependency array - only fetch when auth resolves
  useEffect(() => {
    if (authLoading) return;
    if (!userData || userData.role !== "admin") return;

    fetchTeams();
  }, [authLoading, userData, fetchTeams]);

  const handleDelete = async (teamId: string) => {
    if (!window.confirm("Are you sure you want to delete this team?")) return;

    setDeletingId(teamId);
    try {
      // Use server-side API to handle heavy delete work (batches)
      const res = await fetch("/api/delete-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Delete failed");

      alert(payload?.message || "Team deleted successfully");
      // Refresh list after server confirms deletion
      await fetchTeams();
    } catch (error) {
      console.error("❌ Delete failed:", error);
      alert("Deletion failed.");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleShortlist = async (teamId: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin-team/${teamId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-uid": user?.uid || "" },
        body: JSON.stringify({ action: "toggleShortlist" }),
      });
      const p = await res.json();
      if (!res.ok) throw new Error(p?.error || "Update failed");
      setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, shortlisted: !!p.shortlisted } : t)));
    } catch (error) {
      console.error("❌ Update failed:", error);
      alert("Update failed.");
    }
  };

  const toggleElimination = async (teamId: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin-team/${teamId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-uid": user?.uid || "" },
        body: JSON.stringify({ action: "toggleEliminate" }),
      });
      const p = await res.json();
      if (!res.ok) throw new Error(p?.error || "Update failed");
      setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, eliminated: !!p.eliminated } : t)));
    } catch (error) {
      console.error("❌ Update failed:", error);
      alert("Update failed.");
    }
  };

  const handlePasswordChange = async () => {
    if (!selectedTeamId || !newPassword) return;
    try {
      const res = await fetch(`/api/admin-team/${selectedTeamId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-uid": user?.uid || "" },
        body: JSON.stringify({ action: "setPassword", password: newPassword }),
      });
      const p = await res.json();
      if (!res.ok) throw new Error(p?.error || "Update failed");
      alert("Password updated successfully");
      setIsPasswordModalOpen(false);
      setNewPassword("");
      setTeams((prev) => prev.map((t) => (t.id === selectedTeamId ? { ...t, teamPassword: "[REDACTED]" } : t)));
    } catch (error) {
      console.error("❌ Password update failed:", error);
      alert("Update failed.");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black font-outfit uppercase tracking-tight flex items-center gap-3 text-slate-900 dark:text-white">
            <Users className="text-blue-600" /> Administrative Console
          </h1>
          <p className="text-slate-500 font-medium">
            Manage {teams.length} ventures currently active in the reservoir.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchTeams()}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold"
            title="Refresh"
          >
            Refresh
          </button>
          <div className="glass px-6 py-3 rounded-2xl flex items-center gap-4 border-blue-500/20 bg-blue-600/5">
            <div className="text-right">
              <div className="text-2xl font-black font-outfit leading-none text-slate-900 dark:text-white">
                {teams.length}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Total Teams
              </div>
            </div>
            <Users className="w-8 h-8 text-blue-600 opacity-20" />
          </div>
        </div>
      </div>

      <div className="glass rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Venture & ID
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Founder Details
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Institution
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Selected PS
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Capital
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Status
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {teams.map((team) => (
                <React.Fragment key={team.id}>
                  <tr
                    className={cn(
                      "transition-colors group hover:bg-slate-50 dark:hover:bg-slate-900/30",
                      team.eliminated && "opacity-60 grayscale-[0.5]"
                    )}
                  >
                    <td className="px-6 py-4">
                      <div className="font-black text-sm tracking-tight text-slate-900 dark:text-white">
                        {team.teamName}
                      </div>
                      <div className="font-mono text-[9px] text-slate-400 mt-1">
                        {team.id}
                      </div>
                      <div className="text-[9px] flex items-center gap-1 text-slate-500 font-bold uppercase tracking-tighter mt-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {team.createdAt?.toDate
                          ? format(team.createdAt.toDate(), "MMM dd, HH:mm")
                          : "Pending"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="text-[10px] text-blue-600 font-bold uppercase">
                          {team.leader?.name}
                        </div>
                        <div className="text-[9px] flex items-center gap-1 text-slate-500 font-medium">
                          <Mail className="w-2.5 h-2.5" /> {team.leader?.email}
                        </div>
                        <div className="text-[9px] flex items-center gap-1 text-slate-500 font-medium">
                          <Phone className="w-2.5 h-2.5" /> {team.leader?.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[10px] flex items-center gap-1.5 text-slate-500 font-medium italic">
                        <School className="w-3 h-3" /> {team.collegeName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[10px] font-bold text-blue-600 truncate max-w-[150px]">
                        {team.selectedProblemStatement?.title || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                          {team.totalTokens?.toLocaleString() || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <div
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit",
                            team.shortlisted
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-slate-100 text-slate-400 font-medium"
                          )}
                        >
                          {team.shortlisted ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3 font-medium" />
                          )}
                          {team.shortlisted ? "Shortlisted" : "Standard"}
                        </div>
                        <div
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit",
                            team.eliminated
                              ? "bg-red-500/10 text-red-600"
                              : "bg-blue-500/10 text-blue-600"
                          )}
                        >
                          {team.eliminated ? (
                            <Skull className="w-3 h-3" />
                          ) : (
                            <RefreshCcw className="w-3 h-3" />
                          )}
                          {team.eliminated ? "Eliminated" : "Active"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/admin/team/${team.id}`)}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-blue-600 transition-all font-bold"
                          title="View Intelligence Brief"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTeamId(team.id);
                            setIsPasswordModalOpen(true);
                          }}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-yellow-600 transition-all"
                          title="Change Password"
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            toggleShortlist(team.id, team.shortlisted)
                          }
                          className={cn(
                            "p-2 rounded-xl transition-all",
                            team.shortlisted
                              ? "bg-emerald-500 text-white shadow-lg"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-emerald-500"
                          )}
                          title="Shortlist"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            toggleElimination(team.id, team.eliminated)
                          }
                          className={cn(
                            "p-2 rounded-xl transition-all",
                            team.eliminated
                              ? "bg-red-600 text-white shadow-lg"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500"
                          )}
                          title="Eliminate"
                        >
                          <Skull className="w-4 h-4" />
                        </button>
                        <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-800 mx-1" />
                        <button
                          onClick={() => handleDelete(team.id)}
                          disabled={deletingId === team.id}
                          className={cn(
                            "p-2.5 rounded-xl transition-all",
                            deletingId === team.id
                              ? "bg-slate-100 animate-pulse"
                              : "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                          )}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedTeamId === team.id && (
                    <tr className="bg-slate-100/50 dark:bg-slate-900/50 border-x border-blue-500/20">
                      <td colSpan={6} className="px-6 py-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-2 duration-300">
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                              <Key className="w-3 h-3" /> Access Credentials
                            </h4>
                            <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                              <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">
                                Venture Key
                              </div>
                              <div className="text-xl font-black font-mono text-blue-600 tracking-widest">
                                {team.teamPassword || "N/A"}
                              </div>
                            </div>
                            <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                              <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">
                                Leader Details
                              </div>
                              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                {team.leader?.name} (
                                {team.leader?.email}, {team.leader?.phone})
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                              <User className="w-3 h-3" /> Founding Members (
                              {team.members?.length || 0})
                            </h4>
                            <div className="grid grid-cols-1 gap-2">
                              {team.members?.map((m, i) => (
                                <div
                                  key={i}
                                  className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center group/member"
                                >
                                  <div>
                                    <div className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">
                                      {m.name}
                                    </div>
                                    <div className="text-[9px] font-bold text-slate-400 mt-0.5">
                                      {m.rollNo}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-[9px] font-bold text-slate-500">
                                      {m.email}
                                    </div>
                                    <div className="text-[9px] font-bold text-slate-500">
                                      {m.phone}
                                    </div>
                                  </div>
                                </div>
                              )) ||
                                (
                                  <p className="text-[10px] font-bold text-slate-400 uppercase italic">
                                    No members identified.
                                  </p>
                                )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {teams.length === 0 && (
          <div className="p-32 text-center space-y-4">
            <Users className="w-16 h-16 text-slate-200 mx-auto" />
            <h3 className="text-sm font-black uppercase text-slate-500 tracking-[0.2em]">
              Ecosystem Empty
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              No startup ventures have been identified in the reservoir yet.
            </p>
          </div>
        )}
      </div>

      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSave={handlePasswordChange}
        password={newPassword}
        setPassword={setNewPassword}
      />
    </div>
  );
}
