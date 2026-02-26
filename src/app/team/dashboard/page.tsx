"use client";

import React, { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Rocket, LogOut, LayoutDashboard, Send, HelpCircle, User, Edit3, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

const Overview = dynamic(() => import("../components/Overview"));
const Submissions = dynamic(() => import("../components/Submissions"));
const Queries = dynamic(() => import("../components/Queries"));
const EditDetails = dynamic(() => import("../components/EditDetails"));
const Profile = dynamic(() => import("../components/Profile"));
const Investors = dynamic(() => import("../components/Investors"));

export default function TeamDashboardPage() {
    const router = useRouter();
    const [teamId, setTeamId] = useState<string | null>(null);
    const [session, setSession] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<string>("overview");

    useEffect(() => {
        try {
            const raw = localStorage.getItem("teamSession");
            if (!raw) {
                router.push("/team/login");
                return;
            }
            const parsed = JSON.parse(raw);
            const id = (parsed.id || parsed.teamId || "").toLowerCase();
            if (!id) {
                router.push("/team/login");
                return;
            }
            setSession(parsed);
            setTeamId(id);
        } catch (err) {
            console.error("Invalid team session", err);
            router.push("/team/login");
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("teamSession");
        router.push("/team/login");
    };

    if (!teamId) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    const tabs = [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "submissions", label: "Submissions", icon: Send },
        { id: "investors", label: "Investors", icon: Coins },
        { id: "queries", label: "Queries", icon: HelpCircle },
        { id: "edit", label: "Edit Team", icon: Edit3 },
        { id: "profile", label: "Founder Profile", icon: User },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                            <Rocket className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white">
                                {session?.teamName || "Founders"} Dashboard
                            </h1>
                            <p className="text-slate-500 font-medium tracking-wide">
                                Central Mission Control • {activeTab.toUpperCase()}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 text-red-500 font-black uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all duration-300"
                    >
                        <LogOut className="w-4 h-4" /> Terminate Session
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex flex-wrap items-center gap-3 p-2 bg-slate-200/50 dark:bg-slate-900/50 rounded-2xl w-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 font-black uppercase tracking-widest text-[10px]",
                                activeTab === tab.id
                                    ? "bg-white dark:bg-slate-800 text-blue-600 shadow-xl shadow-blue-500/10 scale-105"
                                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="mt-8 transition-all duration-500">
                    <Suspense fallback={
                        <div className="p-12 glass rounded-[2.5rem] flex flex-col items-center justify-center space-y-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="text-xs font-black uppercase text-slate-400">Loading Module...</p>
                        </div>
                    }>
                        {activeTab === "overview" && <Overview teamId={teamId} />}
                        {activeTab === "submissions" && <Submissions teamId={teamId} />}
                        {activeTab === "investors" && <Investors teamId={teamId} />}
                        {activeTab === "queries" && <Queries teamId={teamId} />}
                        {activeTab === "edit" && <EditDetails teamId={teamId} />}
                        {activeTab === "profile" && <Profile teamId={teamId} />}
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
