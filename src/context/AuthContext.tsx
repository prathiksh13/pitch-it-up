"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

interface UserData {
    rollNo: string;
    name: string;
    role: "admin" | "participant" | "student" | "teacher" | "judge";
    tokensAvailable: number;
    tokensSpent: number;
    hasClaimed: boolean;
    teamId?: string;
}

interface AuthContextType {
    user: FirebaseUser | null;
    userData: UserData | null;
    loading: boolean;
    loginWithRollNo: (rollNo: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    // ✅ Proper dependency array - only runs on mount
    useEffect(() => {
        // ✅ Set up auth listener (will handle auth state changes)
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            
            if (firebaseUser) {
                try {
                    // ✅ Fetch user doc first
                    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
                    if (userDoc.exists()) {
                        setUserData(userDoc.data() as UserData);
                        setLoading(false);
                        return;
                    }

                    // ✅ If no user doc, check for team doc
                    const teamDoc = await getDoc(
                        doc(db, "teams", firebaseUser.uid)
                    );
                    if (teamDoc.exists()) {
                        const teamData = teamDoc.data();
                        setUserData({
                            rollNo: "TEAM",
                            name: teamData.teamName,
                            role: "participant",
                            tokensAvailable: teamData.totalTokens || 0,
                            tokensSpent: 0,
                            hasClaimed: true,
                            teamId: firebaseUser.uid,
                        });
                        setLoading(false);
                        return;
                    }

                    // ✅ No docs found, clear user data
                    setUserData(null);
                } catch (error) {
                    console.error("❌ Error fetching user data:", error);
                    setUserData(null);
                } finally {
                    setLoading(false);
                }
            } else {
                // ✅ User logged out, check localStorage sessions
                const teamSession = localStorage.getItem("teamSession");
                const voterSession = localStorage.getItem("voterSession");

                if (teamSession) {
                    const teamData = JSON.parse(teamSession);
                    setUserData({
                        rollNo: "TEAM",
                        name: teamData.teamName,
                        role: "participant",
                        tokensAvailable: teamData.totalTokens || 0,
                        tokensSpent: 0,
                        hasClaimed: true,
                        teamId: teamData.id,
                    });
                } else if (voterSession) {
                    const voterData = JSON.parse(voterSession);
                    setUserData({
                        rollNo: voterData.id || voterData.rollNo,
                        name: voterData.name || voterData.id || voterData.rollNo,
                        role: voterData.role || "student",
                        tokensAvailable: voterData.tokensAvailable || 0,
                        tokensSpent: voterData.tokensSpent || 0,
                        hasClaimed: true,
                    });
                } else {
                    setUserData(null);
                }

                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []); // ✅ Empty dependency array - only set up listener once

    const loginWithRollNo = async (rollNo: string) => {
        setLoading(true);
        try {
            const voterRef = doc(db, "voters", rollNo);
            const voterSnap = await getDoc(voterRef);
            if (voterSnap.exists()) {
                const voterData = { id: rollNo, ...voterSnap.data() } as any;
                localStorage.setItem("voterSession", JSON.stringify(voterData));
                setUserData({
                    rollNo: voterData.id,
                    name: voterData.name || voterData.id,
                    role: voterData.role || "student",
                    tokensAvailable: voterData.tokensAvailable || 0,
                    tokensSpent: voterData.tokensSpent || 0,
                    hasClaimed: true,
                });
            } else {
                throw new Error("User not found");
            }
        } catch (error) {
            console.error("❌ Login error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await auth.signOut();
        } catch (error) {
            console.error("❌ Logout Firebase error:", error);
        }

        // ✅ Clean up all session data
        localStorage.removeItem("voterRollNo"); // Legacy
        localStorage.removeItem("voterSession");
        localStorage.removeItem("teamSession");
        setUserData(null);
        setUser(null);
        setLoading(false);
    };

    return (
        <AuthContext.Provider
            value={{ user, userData, loading, loginWithRollNo, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
