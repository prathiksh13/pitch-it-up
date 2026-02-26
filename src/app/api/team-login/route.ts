import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // 🔥 Normalize teamName for lookup
        const teamNameInput = (body?.teamName || "").trim();
        const password = (body?.password || "").trim();

        if (!teamNameInput) {
            return NextResponse.json({ error: "teamName is required" }, { status: 400 });
        }

        if (!password) {
            return NextResponse.json({ error: "password is required" }, { status: 400 });
        }

        // 🔥 Must match import normalization
        const normalizedTeamId = teamNameInput.toLowerCase();

        const teamRef = db.collection("teams").doc(normalizedTeamId);
        const teamSnap = await teamRef.get();

        if (!teamSnap.exists) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        const teamData = teamSnap.data() || {};

        const storedPassword = String(teamData.teamPassword || "").trim();

        if (!storedPassword) {
            return NextResponse.json({ error: "Team has no password configured" }, { status: 400 });
        }

        if (storedPassword !== password) {
            return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        }

        const sanitized = {
            id: teamSnap.id,
            teamName: teamData.teamName || teamNameInput,
            collegeName: teamData.collegeName || "",
            leader: teamData.leader || {},
            totalTokens: teamData.totalTokens || 0,
        };

        return NextResponse.json({ success: true, team: sanitized });
    } catch (error: any) {
        console.error("Team Login API Error:", error);
        return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
    }
}