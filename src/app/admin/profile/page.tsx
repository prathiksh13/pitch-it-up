"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Shield, Mail, Hash, UserCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminProfile() {
    const { user, userData } = useAuth();

    if (!userData || userData.role !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Access Restricted</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 md:p-12 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-4xl mx-auto space-y-10">
                <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>

                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-500/20">
                        <Shield className="w-12 h-12" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black font-outfit uppercase tracking-tight">Admin Profile</h1>
                        <p className="text-slate-500 font-medium">System Core Management</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-8 rounded-[2.5rem] border-white/20 space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 border-b border-blue-600/10 pb-4">Auth Identity</h3>
                        <div className="space-y-4">
                            <InfoItem icon={Mail} label="Official Email" value={user?.email || "N/A"} />
                            <InfoItem icon={Hash} label="System UID" value={user?.uid || "N/A"} />
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-8 rounded-[2.5rem] border-white/20 space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 border-b border-blue-600/10 pb-4">Role Permissions</h3>
                        <div className="space-y-4">
                            <InfoItem icon={UserCircle} label="Access Level" value={userData.role.toUpperCase()} />
                            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed tracking-wider">
                                    You have full read/write access to the ecosystem reservoir, including transaction purges, team management, and system protocols.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ icon: Icon, label, value }: any) {
    return (
        <div className="space-y-1">
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</div>
            <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-black tracking-tight">{value}</span>
            </div>
        </div>
    );
}
