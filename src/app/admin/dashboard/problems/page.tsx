"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { BookOpen, Plus, Trash2, Edit3, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Problem {
    id: string;
    title: string;
    description: string;
    domain: string;
}

export default function AdminProblemsPage() {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newProblem, setNewProblem] = useState({ title: "", description: "", domain: "" });

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const snap = await getDocs(collection(db, "problemStatements"));
                const data: Problem[] = [];
                snap.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Problem));
                setProblems(data);
            } catch (err) {
                console.error("Problems fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProblems();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const docRef = await addDoc(collection(db, "problemStatements"), newProblem);
            setProblems(prev => [...prev, { id: docRef.id, ...newProblem }]);
            setNewProblem({ title: "", description: "", domain: "" });
            setIsAdding(false);
        } catch (err) {
            alert("Failed to add problem.");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this problem statement?")) {
            try {
                await deleteDoc(doc(db, "problemStatements", id));
                setProblems(prev => prev.filter(p => p.id !== id));
            } catch (err) {
                alert("Failed to delete problem.");
            }
        }
    };

    if (loading) return <div>Loading problem bank...</div>;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold font-outfit">Problem Statements</h1>
                    <p className="text-slate-500">Challenges for the next generation of startups.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="btn-primary"
                >
                    <Plus className="w-4 h-4" /> Add Problem
                </button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="glass p-8 rounded-3xl mb-12 border-blue-500/20 shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">New Challenge</h2>
                            <button onClick={() => setIsAdding(false)}><X className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <input
                                placeholder="Title"
                                value={newProblem.title}
                                onChange={e => setNewProblem({ ...newProblem, title: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 ring-blue-500"
                                required
                            />
                            <input
                                placeholder="Domain (e.g. FinTech, AI, GreenTech)"
                                value={newProblem.domain}
                                onChange={e => setNewProblem({ ...newProblem, domain: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 ring-blue-500"
                                required
                            />
                            <textarea
                                placeholder="Description"
                                value={newProblem.description}
                                onChange={e => setNewProblem({ ...newProblem, description: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 ring-blue-500 h-32"
                                required
                            />
                            <button type="submit" className="btn-primary w-full py-4 text-lg">Create Problem Statement</button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {problems.map(p => (
                    <div key={p.id} className="glass p-6 rounded-3xl border-slate-200 dark:border-slate-800 flex flex-col group">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-600/10 px-2 py-1 rounded">
                                {p.domain}
                            </span>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleDelete(p.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold font-outfit mb-2">{p.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed mb-6">{p.description}</p>
                        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-medium flex items-center gap-1 italic">
                                <BookOpen className="w-3 h-3" /> Case Study #{(p.id.slice(0, 4)).toUpperCase()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
