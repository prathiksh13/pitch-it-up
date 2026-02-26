"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { Coins, Star, Skull, LayoutDashboard, Users as UsersIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Overview({ teamId }: { teamId: string }) {
  const [team, setTeam] = useState<any>(null);

  useEffect(() => {
    const ref = doc(db, "teams", teamId);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setTeam({ id: snap.id, ...snap.data() });
    });
    return () => unsub();
  }, [teamId]);

  if (!team) return (
    <div className="p-12 glass rounded-[2.5rem] flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="text-xs font-black uppercase text-slate-400">Fetching Venture Data...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Equity Tokens"
          value={team?.totalTokens?.toLocaleString() || "0"}
          icon={Coins}
          color="text-yellow-500"
          sub="Current Valuation"
        />
        <StatCard
          label="Status"
          value={team?.shortlisted ? "Shortlisted" : team?.eliminated ? "Eliminated" : "Active"}
          icon={team?.shortlisted ? Star : team?.eliminated ? Skull : LayoutDashboard}
          color={team?.shortlisted ? "text-emerald-500" : team?.eliminated ? "text-red-500" : "text-blue-500"}
          sub="Mission Status"
        />
        <StatCard
          label="Founders"
          value={String((team?.members?.length || 0) + 1)}
          icon={UsersIcon}
          color="text-blue-500"
          sub="Total Headcount"
        />
      </div>

      {/* Identities & Team */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-[2.5rem] border-white/20 space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 border-b border-blue-600/10 pb-4">Venture Identity</h3>
          <div className="space-y-4">
            <InfoRow label="Chief Executive" value={team?.leader?.name} />
            <InfoRow label="Official Email" value={team?.leader?.email} />
            <InfoRow label="Contact Line" value={team?.leader?.phone} />
            <InfoRow label="Institution" value={team?.collegeName} />
          </div>
        </div>

        <div className="glass p-8 rounded-[2.5rem] border-white/20 space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 border-b border-blue-600/10 pb-4">Co-Founding Team</h3>
          <div className="space-y-4">
            {team?.members?.map((m: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-slate-100 dark:bg-slate-900/50">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{m.name}</span>
                <span className="text-[10px] font-black uppercase text-slate-400">{m.rollNo}</span>
              </div>
            )) || <p className="text-sm text-slate-500 italic">No co-founders registered.</p>}
            {team?.members?.length === 0 && (
              <p className="text-sm text-slate-500 italic">Solo venture registered.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, sub }: any) {
  return (
    <div className="glass p-8 rounded-[2.5rem] border-white/20 flex items-center justify-between">
      <div className="space-y-2">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</div>
        <div className={cn("text-3xl font-black", color)}>{value}</div>
        <div className="text-[10px] font-bold text-slate-500 uppercase">{sub}</div>
      </div>
      <div className={cn("p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/50", color)}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: any) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</div>
      <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{value || "N/A"}</div>
    </div>
  );
}
