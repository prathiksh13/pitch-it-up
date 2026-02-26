"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { GraduationCap, Coins, Wallet, History, ArrowLeft, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Transaction {
    id: string;
    amount: number;
    teamName: string;
    type: string;
    timestamp: any;
}

export default function VoterProfile() {
    const { userData } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTransactions() {
            if (userData?.rollNo) {
                const q = query(
                    collection(db, "transactions"),
                    where("voterId", "==", userData.rollNo),
                    orderBy("timestamp", "desc")
                );
                const querySnapshot = await getDocs(q);
                const items = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Transaction));
                setTransactions(items);
            }
            setLoading(false);
        }
        fetchTransactions();
    }, [userData]);

    if (!userData || userData.role === "admin" || userData.role === "participant") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Voter Credentials Required</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 md:p-12 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-4xl mx-auto space-y-10">
                <Link href="/vote/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Market
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-3xl bg-emerald-600 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20 font-black text-2xl">
                            {userData.name?.charAt(0) || "I"}
                        </div>
                        <div>
                            <h1 className="text-4xl font-black font-outfit uppercase tracking-tight">{userData.name || "Investor"}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-emerald-600 font-black uppercase text-[10px] tracking-widest bg-emerald-600/10 px-3 py-1 rounded-full flex items-center gap-1">
                                    <GraduationCap className="w-3 h-3" /> ID: {userData.rollNo}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass p-8 rounded-[2.5rem] border-emerald-500/20 flex items-center justify-between">
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 font-outfit">Liquid Assets</div>
                            <div className="text-3xl font-black text-emerald-600">🪙 {userData.tokensAvailable?.toLocaleString()}</div>
                        </div>
                        <div className="p-4 bg-emerald-600/10 rounded-2xl text-emerald-600">
                            <Wallet className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="glass p-8 rounded-[2.5rem] border-blue-500/20 flex items-center justify-between">
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 font-outfit">Total Invested</div>
                            <div className="text-3xl font-black text-blue-600">🪙 {userData.tokensSpent?.toLocaleString()}</div>
                        </div>
                        <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-600">
                            <Coins className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <section className="glass rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                            <History className="w-4 h-4" /> Investment History
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="p-12 flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                            </div>
                        ) : transactions.length > 0 ? (
                            <table className="w-full text-left">
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500">
                                                        <ArrowUpRight className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black tracking-tight">Invested in {tx.teamName}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase">
                                                            {tx.timestamp?.toDate ? format(tx.timestamp.toDate(), "MMM dd, yyyy • HH:mm") : "Processing"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="text-sm font-black text-red-500">- 🪙 {tx.amount.toLocaleString()}</div>
                                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Equity Tokens</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-20 text-center space-y-4">
                                <History className="w-12 h-12 text-slate-200 mx-auto" />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No transaction logs identified.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
