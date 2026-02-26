import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    try {
        const teamsSnap = await db.collection("teams")
            .where("eliminated", "==", false)
            .get();

        const teams = teamsSnap.docs.map(d => ({
            id: d.id,
            teamName: d.data().teamName,
            collegeName: d.data().collegeName,
        }));

        return NextResponse.json({ teams });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
