import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const teamId = searchParams.get("teamId");

        if (!teamId) return NextResponse.json({ error: "Team ID required" }, { status: 400 });

        const investmentsSnap = await db.collection("investments")
            .where("teamId", "==", teamId)
            .orderBy("createdAt", "desc")
            .get();

        const investments = investmentsSnap.docs.map(d => ({
            id: d.id,
            ...d.data(),
            createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate().toISOString() : d.data().createdAt
        }));

        return NextResponse.json({ investments });
    } catch (error: any) {
        console.error("Fetch team investors error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
