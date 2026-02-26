"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogIn, ArrowRight, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
    const [rollNo, setRollNo] = useState("");
    const [error, setError] = useState("");
    const [loadingLocal, setLoadingLocal] = useState(false);
    const { loginWithRollNo } = useAuth();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoadingLocal(true);

        try {
            await loginWithRollNo(rollNo.toUpperCase());
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to login. Please check your roll number.");
        } finally {
            setLoadingLocal(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold font-outfit mb-2">Welcome Back</h1>
                    <p className="text-slate-500 text-sm">Log in with your roll number to access your dashboard</p>
                </div>

                <div className="glass p-8 rounded-2xl shadow-xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label htmlFor="rollNo" className="block text-sm font-medium mb-2">
                                Roll Number
                            </label>
                            <input
                                id="rollNo"
                                type="text"
                                value={rollNo}
                                onChange={(e) => setRollNo(e.target.value)}
                                placeholder="e.g. 21CS001"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 outline-none transition-all uppercase"
                            />
                        </div>

                        {error && (
                            <p className="text-red-500 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loadingLocal}
                            className="btn-primary w-full py-3 text-lg"
                        >
                            {loadingLocal ? (
                                "Verifying..."
                            ) : (
                                <>
                                    Log In <LogIn className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Admin login link removed for security as requested */}
                </div>

                <p className="mt-8 text-center text-xs text-slate-500">
                    Don't have a team yet? <Link href="/register" className="text-blue-600 font-semibold hover:underline">Register here</Link>
                </p>
            </motion.div>
        </div>
    );
}

// Separate component for Link to avoid import error in this block if not imported
import Link from "next/link";
