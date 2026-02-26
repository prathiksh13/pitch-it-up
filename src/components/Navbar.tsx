"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { Sun, Moon, Rocket, Trophy, Vote, LayoutDashboard, Menu, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import ProfileDropdown from "./ProfileDropdown";
import { cn } from "@/lib/utils";

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const { userData } = useAuth();
    const [eventTitle, setEventTitle] = useState("HACKSTART");
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const fetchTitle = async () => {
            try {
                const snap = await getDoc(doc(db, "eventSettings", "global"));
                if (snap.exists() && snap.data().eventTitle) {
                    setEventTitle(snap.data().eventTitle.toUpperCase());
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchTitle();
    }, []);

    const navLinks = [
        { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
        { href: "/vote", label: "Vote", icon: Vote },
    ];

    if (userData) {
        navLinks.push({ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard });
    }

    return (
        <nav className="sticky top-0 z-50 w-full glass border-b border-slate-200/10 dark:border-slate-800/10 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 6️⃣ Navbar Responsive Fix */}
                <div className="flex flex-col sm:flex-row items-center justify-between sm:h-20 py-4 sm:py-0 gap-4 sm:gap-0">

                    {/* Logo Area */}
                    <div className="flex items-center justify-between w-full sm:w-auto">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="p-2.5 bg-blue-600 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-blue-500/20">
                                <Rocket className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-black font-outfit tracking-tighter text-slate-900 dark:text-white uppercase">
                                {eventTitle.split(' ').length > 1 ? (
                                    <>
                                        {eventTitle.split(' ')[0]} <span className="text-blue-600">{eventTitle.split(' ').slice(1).join(' ')}</span>
                                    </>
                                ) : (
                                    eventTitle
                                )}
                            </span>
                        </Link>

                        {/* Mobile Toggle */}
                        <button
                            className="sm:hidden p-2 text-slate-500"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>

                    {/* Navigation Links - Hidden on mobile unless toggled, or stacked on mobile if wanted */}
                    <div className={cn(
                        "flex-col sm:flex-row items-center gap-2 sm:gap-8 w-full sm:w-auto",
                        isMenuOpen ? "flex" : "hidden sm:flex"
                    )}>
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2 py-2 sm:py-0"
                            >
                                <link.icon className="w-3.5 h-3.5" /> {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Action Area */}
                    <div className={cn(
                        "flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-end border-t sm:border-t-0 border-slate-200/10 pt-4 sm:pt-0",
                        isMenuOpen ? "flex" : "hidden sm:flex"
                    )}>
                        <button
                            onClick={toggleTheme}
                            className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors border border-transparent dark:border-white/5"
                        >
                            {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-500" />}
                        </button>

                        <div className="flex items-center gap-2">
                            {!userData ? (
                                <>
                                    <Link href="/vote/login" className="hidden lg:flex px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-all">
                                        Voter Entry
                                    </Link>
                                    <Link href="/vote/login" className="btn-primary px-8 py-3 text-[10px] font-black uppercase tracking-widest bg-blue-600 shadow-xl shadow-blue-500/20 active:scale-95 transition-all text-white rounded-xl">
                                        Login
                                    </Link>
                                </>
                            ) : (
                                <ProfileDropdown />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
