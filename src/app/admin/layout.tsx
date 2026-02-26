"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userData, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Exclude the login page from protection loop
        if (!loading && pathname !== "/admin/login") {
            if (!userData || userData.role !== "admin") {
                router.push("/admin/login");
            }
        }
    }, [userData, loading, router, pathname]);

    // Prefer non-blocking skeleton while auth resolves: render layout with Sidebar
    // so chrome and navigation are available even when auth is still loading.
    if (loading && pathname !== "/admin/login") {
        return (
            <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] overflow-hidden">
                <Sidebar />
                <div className="flex-1 p-6 md:p-10 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
                    <div className="space-y-6">
                        <div className="h-8 w-2/5 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="h-40 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                            <div className="h-40 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                            <div className="h-40 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                        </div>
                        <div className="h-[480px] rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    // If on login page, just render children without sidebar
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    // If not authenticated and not on login page, don't show dashboard content
    if (!userData || userData.role !== "admin") {
        return null;
    }

    return (
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] overflow-hidden">
            <Sidebar />
            <div className="flex-1 p-6 md:p-10 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
                {children}
            </div>
        </div>
    );
}
