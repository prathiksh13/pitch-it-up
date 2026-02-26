"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { MessageSquare, Send, Clock, CheckCircle2, AlertCircle, HelpCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function Queries({ teamId }: { teamId: string }) {
  const [queries, setQueries] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const qRef = query(
      collection(db, "teams", teamId, "queries"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(qRef, (snap) => {
      setQueries(snap.docs.map((d) => ({
        id: d.id,
        ...d.data()
      })));
    });
    return () => unsub();
  }, [teamId]);

  const handleInviteQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/team-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, message: message.trim() }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Dispatch failed");
      setMessage("");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to transmit query to mission control.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Dispatch Header */}
      <div className="glass p-8 rounded-[2.5rem] border-white/20 space-y-6">
        <div className="flex items-center gap-3 text-blue-600">
          <MessageSquare className="w-5 h-5" />
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Communication Dispatch</h3>
        </div>

        <form onSubmit={handleInviteQuery} className="space-y-4">
          <div className="relative group">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Detail your inquiry or issue for mission control..."
              className="w-full p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm text-slate-900 dark:text-slate-100 min-h-[140px] resize-none"
            />
            <div className="absolute bottom-6 right-6 flex items-center gap-4">
              <span className="text-[10px] font-black uppercase text-slate-400">Secure Transmission Layer</span>
              <button
                type="submit"
                disabled={!message.trim() || loading}
                className="p-4 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 active:scale-95"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Response Logs */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Communication Logs</h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {queries.map((q) => (
            <div key={q.id} className="glass p-6 rounded-[2rem] border-white/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:bg-white/[0.02] transition-colors">
              <div className="space-y-2 flex-grow">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed max-w-2xl">{q.message}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {q.createdAt?.toDate ? format(q.createdAt.toDate(), "MMM dd, HH:mm") : "Syncing..."}
                    </span>
                  </div>
                  <StatusChip status={q.status || "Pending"} />
                </div>
              </div>
              {q.response && (
                <div className="p-4 rounded-2xl bg-blue-600/5 border border-blue-600/10 max-w-xs">
                  <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 italic">“{q.response}”</p>
                </div>
              )}
            </div>
          ))}
          {queries.length === 0 && (
            <div className="py-20 text-center glass rounded-[2.5rem] border-white/20 border-2 border-dashed flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-full">
                <HelpCircle className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">No communication logs recorded</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const isResolved = status.toLowerCase() === "resolved";
  const isPending = status.toLowerCase() === "pending";

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
      isResolved ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
        isPending ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
          "bg-blue-500/10 text-blue-600 border-blue-500/20"
    )}>
      {isResolved ? <CheckCircle2 className="w-3 h-3" /> : isPending ? <Clock className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
      {status}
    </div>
  );
}
