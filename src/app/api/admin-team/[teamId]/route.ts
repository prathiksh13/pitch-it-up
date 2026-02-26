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

export async function GET(req: NextRequest, { params }: { params: { teamId: string } }) {
  try {
    const uid = req.headers.get("x-admin-uid") || "";
    if (!(await isAdmin(uid))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const teamId = (params.teamId || "").trim().toLowerCase();
    if (!teamId) return NextResponse.json({ error: "teamId required" }, { status: 400 });

    const teamRef = db.collection("teams").doc(teamId);
    const teamSnap = await teamRef.get();
    if (!teamSnap.exists) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    const data = teamSnap.data() || {};
    const sanitized = {
      id: teamSnap.id,
      teamName: data.teamName || teamSnap.id,
      collegeName: data.collegeName || "",
      leader: data.leader || {},
      members: data.members || [],
      totalTokens: data.totalTokens || 0,
      shortlisted: !!data.shortlisted,
      eliminated: !!data.eliminated,
      submissions: data.submissions || { ppt: "", github: "", report: "" },
      createdAt: data.createdAt || null,
    };

    // Fetch queries
    const queriesSnap = await teamRef.collection("queries").orderBy("createdAt", "desc").get();
    const queries = queriesSnap.docs.map((q) => ({ id: q.id, ...(q.data() as any) }));

    return NextResponse.json({ team: sanitized, queries });
  } catch (err: any) {
    console.error("admin-team error", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
