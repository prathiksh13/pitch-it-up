import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const teamId = (searchParams.get("teamId") || "").trim().toLowerCase();

        if (!teamId) return NextResponse.json({ error: "teamId required" }, { status: 400 });

        const teamRef = db.collection("teams").doc(teamId);
        const teamSnap = await teamRef.get();

        if (!teamSnap.exists) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        const teamData = teamSnap.data();
        // Remove password for security
        if (teamData) delete teamData.teamPassword;

        // Fetch queries subcollection
        const queriesSnap = await teamRef.collection("queries").orderBy("createdAt", "desc").get();
        const queries = queriesSnap.docs.map(d => ({
            id: d.id,
            ...d.data(),
            createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : d.data().createdAt
        }));

        // Fetch investments from top-level collection
        const investmentsSnap = await db.collection("investments")
            .where("teamId", "==", teamId)
            .orderBy("createdAt", "desc")
            .get();

        const investments = investmentsSnap.docs.map(d => ({
            id: d.id,
            ...d.data(),
            createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : d.data().createdAt
        }));

        return NextResponse.json({
            team: { id: teamSnap.id, ...teamData },
            queries,
            investments
        });
    } catch (error: any) {
        console.error("Fetch team details error", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST to update query status (e.g. resolve)
export async function POST(req: NextRequest) {
    try {
        const { teamId, queryId, status } = await req.json();
        if (!teamId || !queryId || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

        await db.collection("teams").doc(teamId).collection("queries").doc(queryId).update({ status });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
