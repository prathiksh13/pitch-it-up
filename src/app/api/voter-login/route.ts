import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const { code, voterName } = await req.json();
        const normalizedCode = (code || "").trim().toUpperCase();
        const normalizedName = (voterName || "").trim();

        if (!normalizedCode) return NextResponse.json({ error: "Code required" }, { status: 400 });
        if (!normalizedName) return NextResponse.json({ error: "Voter name required" }, { status: 400 });

        // 3️⃣ Update Voter Login API - Check global status
        const statusDoc = await db.collection("eventStatus").doc("global").get();
        if (!statusDoc.exists || !statusDoc.data()?.votingActive) {
            return NextResponse.json({ error: "Voting is currently frozen." }, { status: 403 });
        }

        const codeRef = db.collection("votingCodes").doc(normalizedCode);
        const codeSnap = await codeRef.get();

        if (!codeSnap.exists) {
            return NextResponse.json({ error: "Invalid voting code" }, { status: 404 });
        }

        const data = codeSnap.data();

        // Reject login if used === true
        if (data?.used) {
            return NextResponse.json({ error: "This code has already been used." }, { status: 403 });
        }

        // Update votingCodes document
        await codeRef.update({
            used: true,
            inUse: true,
            voterName: normalizedName,
            activatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return NextResponse.json({
            success: true,
            tokensRemaining: data?.tokensRemaining || 0,
            code: normalizedCode,
            voterName: normalizedName
        });
    } catch (error: any) {
        console.error("Voter Login Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
