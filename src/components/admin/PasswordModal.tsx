"use client";

import React from "react";
import { Lock, X } from "lucide-react";
import { motion } from "framer-motion";

interface PasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    password: string;
    setPassword: (val: string) => void;
}

export default function PasswordModal({ isOpen, onClose, onSave, password, setPassword }: PasswordModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md glass p-8 rounded-[2rem] border-white/20 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>
                <div className="mb-6">
                    <h2 className="text-2xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                        <Lock className="text-blue-600" /> Change Password
                    </h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">Update team security credentials.</p>
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">New Security Key</label>
                        <input
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full px-5 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 ring-blue-500 transition-all font-bold text-slate-900 dark:text-white"
                        />
                    </div>
                    <button
                        onClick={onSave}
                        className="btn-primary w-full py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-500/20"
                    >
                        Commit Update
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
