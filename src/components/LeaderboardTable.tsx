"use client";

import React, { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  limit,
  doc,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ArrowUp, Minus, Star, ShieldCheck } from "lucide-react";
import { cn } from "../lib/utils";

interface Team {
  id: string;
  teamName: string;
  totalTokens: number;
  rank?: number;
}

/**
 * ✅ OPTIMIZED: Uses onSnapshot() only because leaderboard needs REAL-TIME updates
 * This component ONLY listens to teams (sorted by tokens) and event status
 * - Limits to 50 teams for admin, 10 for public (prevents full collection load)
 * - Event status listening keeps the finalization banner up-to-date
 */
export default function LeaderboardTable({ isAdmin = false }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventStatus, setEventStatus] = useState<any>(null);

  useEffect(() => {
    // ✅ Only listen to event status (minimal data)
    const statusUnsub = onSnapshot(
      doc(db, "eventStatus", "global"),
      (snap) => {
        if (snap.exists()) {
          setEventStatus(snap.data());
        }
      },
      (error) => {
        console.error("❌ Error listening to event status:", error);
      }
    );

    // ✅ Listen to leaderboard (real-time token updates)
    const q = query(
      collection(db, "teams"),
      orderBy("totalTokens", "desc"),
      limit(isAdmin ? 50 : 10)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const teamData: Team[] = [];
        snapshot.forEach((doc) => {
          teamData.push({
            id: doc.id,
            teamName: doc.data().teamName || "",
            totalTokens: doc.data().totalTokens || 0,
          } as Team);
        });
        setTeams(teamData);
        setLoading(false);
      },
      (error) => {
        console.error("❌ Error listening to leaderboard:", error);
        setLoading(false);
      }
    );

    return () => {
      statusUnsub();
      unsubscribe();
    };
  }, [isAdmin]);

  if (loading)
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl"
          />
        ))}
      </div>
    );

  return (
    <div className="w-full">
      {eventStatus?.resultsFinalized && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8 p-6 rounded-3xl bg-blue-600 text-white flex items-center justify-between shadow-xl shadow-blue-600/20"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black font-outfit uppercase tracking-tight">
                Final Results Certified
              </h3>
              <p className="text-blue-100 text-sm">
                The simulation has concluded. Congratulations to the founders!
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-12 gap-4 px-6 py-4 mb-4 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl">
        <div className="col-span-1">Rank</div>
        <div className="col-span-1">Trend</div>
        <div className="col-span-6">Startup Brand</div>
        <div className="col-span-4 text-right">Market Cap</div>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {teams.map((team, index) => (
            <motion.div
              layout
              key={team.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
              className={cn(
                "grid grid-cols-12 gap-4 items-center px-6 py-5 rounded-2xl glass transition-all relative overflow-hidden",
                index === 0
                  ? " ring-2 ring-yellow-500/50 bg-yellow-500/5"
                  : index === 1
                    ? "ring-2 ring-slate-400/30 bg-slate-400/5"
                    : index === 2
                      ? "ring-2 ring-orange-500/30 bg-orange-500/5"
                      : ""
              )}
            >
              <div className="col-span-1 text-center">
                <div className="text-[14px] font-black text-slate-900 dark:text-white">
                  #{index + 1}
                </div>
              </div>
              <div className="col-span-1 flex justify-center">
                {index === 0 ? (
                  <ArrowUp className="w-4 h-4 text-emerald-500 animate-pulse" />
                ) : (
                  <Minus className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div className="col-span-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-black text-[10px]">
                    {team.teamName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">
                      {team.teamName}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="col-span-4 flex items-center justify-end gap-2">
                <div className="text-right">
                  <div className="font-black text-lg text-slate-900 dark:text-white">
                    ₹{(team.totalTokens || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400">
                    Market Valuation
                  </div>
                </div>
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {teams.length === 0 && (
        <div className="text-center py-16">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">
            No teams yet. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
}
