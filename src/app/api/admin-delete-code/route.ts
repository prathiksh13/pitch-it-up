import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

async function isAdmin(uid: string) {
    if (!uid) return false;
    const userDoc = await db.collection("users").doc(uid).get();
    return userDoc.exists && userDoc.data()?.role === "admin";
}

export async function POST(req: NextRequest) {
    try {
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }
        const { code, adminUid } = body;

        // 8️⃣ Security Check
        if (!adminUid || !(await isAdmin(adminUid))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        if (!code) {
            return NextResponse.json({ error: "Code required" }, { status: 400 });
        }

        // 5️⃣ Delete Single Code
        await db.collection("votingCodes").doc(code).delete();

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete code error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
