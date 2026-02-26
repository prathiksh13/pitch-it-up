import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    try {
        const statusDoc = await db.collection("eventStatus").doc("global").get();
        const status = statusDoc.exists ? statusDoc.data() : { votingActive: false };

        const teamsSnap = await db.collection("teams").orderBy("totalTokens", "desc").get();
        const leaderboard = teamsSnap.docs.map(d => ({
            id: d.id,
            teamName: d.data().teamName,
            totalTokens: d.data().totalTokens || 0,
            shortlisted: d.data().shortlisted,
            eliminated: d.data().eliminated,
        }));

        const investmentsSnap = await db.collection("investments").orderBy("createdAt", "desc").limit(50).get();
        const recentInvestments = investmentsSnap.docs.map(d => ({
            id: d.id,
            ...d.data(),
            createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : d.data().createdAt
        }));

        return NextResponse.json({ status, leaderboard, recentInvestments });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { votingActive } = await req.json();

        await db.collection("eventStatus").doc("global").set({
            votingActive: !!votingActive,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        return NextResponse.json({ success: true, votingActive: !!votingActive });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
