import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const teamId = (body?.teamId || "").trim().toLowerCase();
    const message = (body?.message || "").trim();

    if (!teamId || !message) return NextResponse.json({ error: "teamId and message required" }, { status: 400 });

    const teamRef = db.collection("teams").doc(teamId);
    const teamSnap = await teamRef.get();
    if (!teamSnap.exists) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    const queriesRef = teamRef.collection("queries");
    await queriesRef.add({
      message,
      status: "open",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("team-query error", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
