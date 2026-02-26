import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { teamId } = body || {};

        if (!teamId) {
            return NextResponse.json({ error: "Missing teamId" }, { status: 400 });
        }

        // Delete team doc
        const teamRef = db.collection("teams").doc(teamId);
        const teamSnap = await teamRef.get();
        if (!teamSnap.exists) {
            return NextResponse.json({ message: "Team not found", deleted: false }, { status: 404 });
        }

        // Delete related transactions in batches
        const transRef = db.collection("transactions");

        // Query both directions: where team is source or destination
        const q1 = transRef.where("teamId", "==", teamId).limit(500);
        const q2 = transRef.where("toTeamId", "==", teamId).limit(500);

        // Helper to delete query results in batches
        const deleteQueryBatch = async (queryRef: any) => {
            while (true) {
                const snap = await queryRef.get();
                if (snap.empty) break;
                const batch = db.batch();
                snap.docs.forEach((d: any) => batch.delete(d.ref));
                await batch.commit();
                // continue until no docs
            }
        };

        await deleteQueryBatch(q1);
        await deleteQueryBatch(q2);

        // Finally delete team document
        await teamRef.delete();

        return NextResponse.json({ message: "Team and related transactions deleted", deleted: true });
    } catch (error: any) {
        console.error("Delete Team API Error:", error);
        return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
    }
}
