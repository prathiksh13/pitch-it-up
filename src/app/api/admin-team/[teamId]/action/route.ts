import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

async function isAdmin(uid?: string) {
  if (!uid) return false;
  const snap = await db.collection("users").doc(uid).get();
  if (!snap.exists) return false;
  const data = snap.data();
  return data?.role === "admin";
}

export async function POST(req: NextRequest, { params }: { params: { teamId: string } }) {
  try {
    const uid = req.headers.get("x-admin-uid") || "";
    if (!(await isAdmin(uid))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const teamId = (params.teamId || "").trim().toLowerCase();
    if (!teamId) return NextResponse.json({ error: "teamId required" }, { status: 400 });

    const body = await req.json();
    const action = body?.action;

    const teamRef = db.collection("teams").doc(teamId);
    const teamSnap = await teamRef.get();
    if (!teamSnap.exists) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    if (action === "toggleShortlist") {
      const current = !!teamSnap.data()?.shortlisted;
      await teamRef.update({ shortlisted: !current });
      return NextResponse.json({ success: true, shortlisted: !current });
    }

    if (action === "toggleEliminate") {
      const current = !!teamSnap.data()?.eliminated;
      await teamRef.update({ eliminated: !current });
      return NextResponse.json({ success: true, eliminated: !current });
    }

    if (action === "setPassword") {
      const newPassword = (body?.password || "").toString();
      if (!newPassword) return NextResponse.json({ error: "password required" }, { status: 400 });
      await teamRef.update({ teamPassword: newPassword });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("admin-team-action error", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
