"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { User, LogOut, ChevronDown, UserCircle, Shield, Briefcase, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function ProfileDropdown() {
    const { userData, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!userData) return null;

    const handleLogout = async () => {
        const role = userData.role;
        await logout();
        setIsOpen(false);
        if (role === 'admin') router.push("/admin/login");
        else if (role === 'participant') router.push("/team/login");
        else router.push("/vote/login");
    };

    const getProfileRoute = () => {
        if (userData.role === 'admin') return "/admin/profile";
        if (userData.role === 'participant') return "/team/profile";
        return "/vote/profile";
    };

    const getRoleIcon = () => {
        if (userData.role === 'admin') return <Shield className="w-3 h-3 text-red-500" />;
        if (userData.role === 'participant') return <Briefcase className="w-3 h-3 text-blue-500" />;
        return <GraduationCap className="w-3 h-3 text-emerald-500" />;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
            >
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                    <User className="w-5 h-5" />
                </div>
                <div className="hidden sm:flex flex-col items-start mr-1">
                    <span className="text-[10px] font-black uppercase text-blue-600 leading-none mb-1 flex items-center gap-1">
                        {getRoleIcon()} {userData.role}
                    </span>
                    <span className="text-sm font-bold truncate max-w-[100px] leading-none">{userData.name}</span>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 glass rounded-2xl shadow-2xl border border-white/20 p-2 z-[60] animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-3 py-4 border-b border-slate-200/20 mb-2">
                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Identified As</div>
                        <div className="font-bold text-sm truncate">{userData.name}</div>
                        <div className="text-[9px] font-medium text-slate-500 truncate">{userData.rollNo}</div>
                    </div>

                    <Link
                        href={getProfileRoute()}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-all group"
                    >
                        <UserCircle className="w-4 h-4" />
                        <span>Profile Settings</span>
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500 hover:text-white transition-all mt-1"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Terminate Session</span>
                    </button>
                </div>
            )}
        </div>
    );
}
