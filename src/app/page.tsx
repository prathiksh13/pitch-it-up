"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Rocket, Trophy, Users, ShieldCheck, ArrowRight, UserCircle, Briefcase, Download, FileText, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

export default function LandingPage() {
    const [psList, setPsList] = useState<any[]>([]);
    const [settings, setSettings] = useState({
        eventTitle: "Startup Simulation 2026",
        eventTagline: "Where Ideas Turn Into Unicorns"
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 3️⃣ Fetch dynamic settings
                const settingsSnap = await getDoc(doc(db, "eventSettings", "global"));
                if (settingsSnap.exists()) {
                    setSettings({
                        eventTitle: settingsSnap.data().eventTitle || "Startup Simulation 2026",
                        eventTagline: settingsSnap.data().eventTagline || "Where Ideas Turn Into Unicorns"
                    });
                }

                // Fetch Problem Statements
                const q = query(collection(db, "problemStatements"), where("isActive", "==", true));
                const snap = await getDocs(q);
                setPsList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (err) {
                console.error("Fetch Data Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleRegisterClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            const snap = await getDoc(doc(db, "settings", "registration"));
            if (snap.exists() && snap.data().googleFormLink) {
                window.location.href = snap.data().googleFormLink;
            } else {
                alert("Registration not currently available.");
            }
        } catch (err) {
            console.error(err);
            alert("Connection error. Try again later.");
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
    );

    return (
        // 5️⃣ Full Responsive Structure Fix
        <div className="min-h-screen w-full px-4 sm:px-6 lg:px-8 bg-slate-950 relative overflow-x-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-600/10 blur-[120px] rounded-full -z-10" />

            <div className="max-w-7xl mx-auto space-y-24 py-20 lg:py-32">

                {/* Hero Section */}
                <div className="text-center max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-8"
                    >
                        <span className="px-4 py-1.5 text-[10px] font-black tracking-widest text-blue-600 uppercase bg-blue-600/10 rounded-full inline-block border border-blue-600/20">
                            Authorized Entry: {settings.eventTitle}
                        </span>
                        <h1 className="text-5xl lg:text-8xl font-black font-outfit tracking-tighter uppercase leading-[0.9]">
                            {settings.eventTitle.split(' ').slice(0, -1).join(' ')} <span className="text-blue-600">{settings.eventTitle.split(' ').slice(-1)}</span>
                        </h1>
                        <p className="text-xl lg:text-2xl text-slate-400 font-black font-outfit uppercase tracking-tight max-w-2xl mx-auto opacity-80">
                            {settings.eventTagline}
                        </p>
                        <p className="text-base lg:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
                            Build, pitch, and grow your virtual startup. Compete for tokens from investors and students in the most immersive simulation hackathon experience.
                        </p>
                    </motion.div>
                </div>

                {/* Portal Cards Section */}
                <div id="get-started" className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <div onClick={handleRegisterClick} className="cursor-pointer">
                        <PortalCard
                            href="#"
                            title="Register Team"
                            description="Apply to enter the reservoir as a venture and start building your legacy."
                            icon={<Briefcase className="w-8 h-8" />}
                            color="bg-blue-600"
                            delay={0.1}
                        />
                    </div>
                    <PortalCard
                        href="/team/login"
                        title="Team Access"
                        description="Enter foundations dashboard to manage operations and view valuation."
                        icon={<Rocket className="w-8 h-8" />}
                        color="bg-indigo-600"
                        delay={0.2}
                    />
                    <PortalCard
                        href="/vote/login"
                        title="Voter Entry"
                        description="Access the mission as an investor to back promising startups."
                        icon={<UserCircle className="w-8 h-8" />}
                        color="bg-emerald-600"
                        delay={0.3}
                    />
                </div>

                {/* Mission assets (Problem Statements) */}
                {psList.length > 0 && (
                    <div className="space-y-12">
                        <div className="text-center">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-4 flex items-center justify-center gap-2">
                                <FileText className="w-4 h-4" /> Venture Missions
                            </h2>
                            <h3 className="text-4xl font-black font-outfit tracking-tight uppercase">Strategic Briefings</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {psList.map((ps, idx) => (
                                <PSCard key={ps.id} ps={ps} delay={0.1 * idx} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Features Grid - 4️⃣ Removed Debug Text and 5️⃣ Cleaned Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <FeatureCard
                        icon={<Rocket className="w-6 h-6 text-blue-600" />}
                        title="Real-time Economy"
                        description="Experience a live economy where every decision impacts your valuation."
                    />
                    <FeatureCard
                        icon={<Users className="w-6 h-6 text-purple-600" />}
                        title="Equity Backing"
                        description="Engage students and teachers to invest their tokens in your vision."
                    />
                    <FeatureCard
                        icon={<Trophy className="w-6 h-6 text-yellow-500" />}
                        title="Live Ranking"
                        description="Watch the standings shift instantly with every capital injection."
                    />
                    <FeatureCard
                        icon={<ShieldCheck className="w-6 h-6 text-emerald-500" />}
                        title="Verified Intel"
                        description="Advanced encryption systems ensure fair play for all ventures."
                    />
                </div>
            </div>
        </div>
    );
}

function PortalCard({ href, title, description, icon, color, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="h-full"
        >
            <Link href={href} className="group block h-full">
                <div className="glass p-8 rounded-[3rem] border border-white/10 h-full flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 relative overflow-hidden backdrop-blur-xl bg-white/[0.02]">
                    <div className={`absolute -right-10 -top-10 w-32 h-32 ${color} opacity-0 group-hover:opacity-10 blur-[80px] transition-opacity duration-500`} />
                    <div className={`w-16 h-16 rounded-[1.5rem] ${color} flex items-center justify-center text-white mb-8 shadow-2xl`}>
                        {icon}
                    </div>
                    <h3 className="text-2xl font-black font-outfit uppercase tracking-tighter mb-4 group-hover:text-blue-500 transition-colors">
                        {title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8 flex-grow">
                        {description}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 group-hover:translate-x-2 transition-transform">
                        Initiate Connection <ArrowRight className="w-3 h-3" />
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

function FeatureCard({ icon, title, description }: any) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="p-10 glass rounded-[2.5rem] flex flex-col gap-6 text-left border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all"
        >
            <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-2xl w-fit shadow-inner">
                {icon}
            </div>
            <div className="space-y-3">
                <h3 className="text-lg font-black font-outfit uppercase tracking-tight">{title}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-500 leading-relaxed font-bold uppercase tracking-wide">
                    {description}
                </p>
            </div>
        </motion.div>
    );
}

function PSCard({ ps, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="glass p-10 rounded-[3rem] border border-white/10 flex flex-col h-full hover:bg-white/[0.02] transition-colors group relative overflow-hidden"
        >
            <div className="flex justify-between items-start mb-8">
                <div className="p-4 bg-blue-600/10 text-blue-600 rounded-2xl">
                    <FileText className="w-7 h-7" />
                </div>
                <div className="px-3 py-1 bg-slate-900 rounded-full border border-white/10 text-[8px] font-black uppercase text-slate-400 tracking-[0.2em]">
                    Mission Asset
                </div>
            </div>
            <h4 className="text-2xl font-black font-outfit uppercase tracking-tighter mb-4 group-hover:text-blue-600 transition-colors leading-tight">
                {ps.title}
            </h4>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-10 flex-grow">
                {ps.description}
            </p>
            <a
                href={ps.pdfUrl}
                target="_blank"
                className="w-full py-5 rounded-[1.5rem] bg-blue-600 text-white font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
            >
                <Download className="w-4 h-4" /> Download Intelligence (.PDF)
            </a>
        </motion.div>
    );
}
