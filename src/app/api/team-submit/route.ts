import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const teamId = (body?.teamId || "").trim().toLowerCase();
    const submissions = body?.submissions || {};

    if (!teamId) return NextResponse.json({ error: "teamId required" }, { status: 400 });

    // Only allow specific keys
    const allowed = ["ppt", "github", "report"];
    const updatePayload: any = {};
    for (const key of allowed) {
      if (typeof submissions[key] === "string") {
        updatePayload[`submissions.${key}`] = submissions[key].trim();
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: "No valid submission fields provided" }, { status: 400 });
    }

    const teamRef = db.collection("teams").doc(teamId);
    const teamSnap = await teamRef.get();
    if (!teamSnap.exists) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    // Use update to only modify submissions
    await teamRef.update(updatePayload);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("team-submit error", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
