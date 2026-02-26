"use client";

import React from "react";
import Link from "next/link";
import LeaderboardTable from "@/components/LeaderboardTable";
import { Trophy, Rocket, TrendingUp } from "lucide-react";

export default function PublicLeaderboard() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="text-center mb-16">
                <div className="flex justify-center gap-4 mb-6">
                    <div className="p-4 bg-yellow-500/10 rounded-2xl">
                        <Trophy className="w-10 h-10 text-yellow-500" />
                    </div>
                </div>
                <h1 className="text-5xl font-bold font-outfit mb-4">Elite Standings</h1>
                <p className="text-slate-500 max-w-xl mx-auto text-lg">
                    Witness the rise of the next tech giants. Rankings update instantly as investment flows in from students and teachers.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                <div className="lg:col-span-3">
                    <LeaderboardTable isAdmin={false} />
                </div>

                <div className="space-y-8">
                    <Card
                        icon={<Rocket className="w-5 h-5 text-blue-600" />}
                        title="Market Cap"
                        value="₹1.2M"
                        desc="Total ecosystem valuation across all startups."
                    />
                    <Card
                        icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
                        title="Daily Volatility"
                        value="+18.4%"
                        desc="Market movement in the last 24 hours."
                    />

                    <div className="p-6 rounded-3xl bg-slate-900 text-white dark:bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold mb-2">Want to invest?</h3>
                            <p className="text-slate-400 text-xs mb-4">Login with your roll number to receive your initial token grant.</p>
                            <Link href="/login" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                Go to Voting Portal →
                            </Link>
                        </div>
                        <div className="absolute -bottom-6 -right-6 opacity-10">
                            <Trophy className="w-24 h-24" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Card({ icon, title, value, desc }: any) {
    return (
        <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50">
            <div className="bg-slate-100 dark:bg-slate-800 w-fit p-3 rounded-xl mb-4">
                {icon}
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
            <div className="text-2xl font-black font-outfit mb-2">{value}</div>
            <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
        </div>
    );
}
