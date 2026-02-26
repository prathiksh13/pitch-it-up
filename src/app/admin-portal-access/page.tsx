"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Shield, Lock, Mail, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { user } = await signInWithEmailAndPassword(auth, email, password);
            // Double check role in Firestore for added security
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data().role === "admin") {
                router.push("/admin/dashboard");
            } else {
                await auth.signOut();
                throw new Error("Unauthorized. This account is not an administrator.");
            }
        } catch (err: any) {
            setError(err.message || "Admin login failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <Link href="/login" className="text-slate-500 hover:text-blue-600 flex items-center gap-1 text-sm mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Student Login
                </Link>

                <div className="text-center mb-8">
                    <div className="bg-blue-600/10 p-4 rounded-full w-fit mx-auto mb-4">
                        <Shield className="w-10 h-10 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold font-outfit mb-2 text-blue-600">Admin Control</h1>
                    <p className="text-slate-500 text-sm">Organizer access only</p>
                </div>

                <div className="glass p-8 rounded-2xl shadow-xl border-blue-500/20">
                    <form onSubmit={handleAdminLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 opacity-70">Admin Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@hackathon.com"
                                    required
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 opacity-70">Secret Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-red-500 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-4 text-lg bg-blue-700 hover:bg-blue-800"
                        >
                            {loading ? "Authenticating Master Key..." : "Grant Access"}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
