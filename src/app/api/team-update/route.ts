import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const teamId = (body?.teamId || "").trim().toLowerCase();

    if (!teamId) return NextResponse.json({ error: "teamId required" }, { status: 400 });

    // Allowed fields only
    const payload: any = {};
    if (typeof body.collegeName === "string") payload.collegeName = body.collegeName.trim();
    if (typeof body.leader === "object" && body.leader !== null) {
      const leader = {
        name: (body.leader.name || "").trim(),
        email: (body.leader.email || "").trim().toLowerCase(),
        phone: (body.leader.phone || "").trim(),
      };
      payload.leader = leader;
    }
    if (Array.isArray(body.members)) {
      const members = body.members
        .map((m: any) => ({
          name: (m.name || "").trim(),
          email: (m.email || "").trim().toLowerCase(),
          phone: (m.phone || "").trim(),
          rollNo: (m.rollNo || "").trim(),
        }))
        .filter((m: any) => m.name || m.email);
      payload.members = members;
    }

    if (Object.keys(payload).length === 0) return NextResponse.json({ error: "No updatable fields" }, { status: 400 });

    const teamRef = db.collection("teams").doc(teamId);
    const teamSnap = await teamRef.get();
    if (!teamSnap.exists) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    // Prevent protected fields from being changed by client SDKs - server enforces allowed keys
    await teamRef.update(payload);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("team-update error", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
