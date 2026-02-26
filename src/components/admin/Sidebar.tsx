"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart4,
    Users,
    Settings,
    History,
    Trophy,
    BookOpen,
    Shield,
    LogOut,
    Ticket,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const links = [
    { name: "Command Center", href: "/admin/dashboard", icon: BarChart4 },
    { name: "Manage Teams", href: "/admin/manage-teams", icon: Users },
    { name: "Event Control", href: "/admin/dashboard/control", icon: Settings },
    { name: "Mission Briefs", href: "/admin/problem-statements", icon: BookOpen },
    { name: "Voting Access", href: "/admin/voting-codes", icon: Ticket },
    { name: "Voting Control", href: "/admin/voting-control", icon: Zap },
    { name: "Review Queue", href: "/admin/dashboard/shortlist", icon: Trophy },
    { name: "Registration Control", href: "/admin/registration-control", icon: Shield },
    { name: "Audit Logs", href: "/admin/dashboard/logs", icon: History },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 shrink-0 flex flex-col min-h-screen">
            <div className="mb-10 px-4 mt-4 hidden md:flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
                    <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="font-black font-outfit text-sm uppercase tracking-tighter">
                    HQ<span className="text-blue-600">Control</span>
                </div>
            </div>

            <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-4">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                isActive
                                    ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20"
                                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600"
                            )}
                        >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{link.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto space-y-4 px-2">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Terminate Session</span>
                </button>

                <div className="pt-6 border-t border-slate-200 dark:border-slate-800 hidden md:block px-2">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">System Core v2.0</div>
                    <p className="text-[8px] text-slate-500 italic">
                        Node: {process.env.NODE_ENV === "development" ? "Dev_Bypass" : "Production"}
                    </p>
                </div>
            </div>
        </aside>
    );
}
