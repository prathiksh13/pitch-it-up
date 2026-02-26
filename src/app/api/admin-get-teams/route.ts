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

export async function GET(req: NextRequest) {
  try {
    const uid = req.headers.get("x-admin-uid") || "";
    if (!(await isAdmin(uid))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const snapshot = await db.collection("teams").orderBy("createdAt", "desc").get();
    const teams = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        teamName: data.teamName || d.id,
        collegeName: data.collegeName || "",
        totalTokens: data.totalTokens || 0,
        shortlisted: !!data.shortlisted,
        eliminated: !!data.eliminated,
        leader: data.leader || {},
        submissions: data.submissions || { ppt: "", github: "", report: "" },
        createdAt: data.createdAt || null,
      };
    });

    return NextResponse.json({ teams });
  } catch (err: any) {
    console.error("admin-get-teams error", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
