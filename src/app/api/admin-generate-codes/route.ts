import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

export const runtime = "nodejs";

// Helper to check admin role
async function isAdmin(uid: string) {
    if (!uid) return false;
    const userDoc = await db.collection("users").doc(uid).get();
    return userDoc.exists && userDoc.data()?.role === "admin";
}

function generateCode(length = 6) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return "VOTE-" + result;
}

export async function POST(req: NextRequest) {
    try {
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const { numberOfCodes, tokensPerCode, adminUid } = body;

        // 8️⃣ Security Check
        if (!adminUid || !(await isAdmin(adminUid))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        if (!numberOfCodes || !tokensPerCode) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const batch = db.batch();
        const codesGenerated = [];

        for (let i = 0; i < numberOfCodes; i++) {
            let code = generateCode();
            const ref = db.collection("votingCodes").doc(code);

            // 2️⃣ Match updated votingCodes structure
            batch.set(ref, {
                tokensRemaining: Number(tokensPerCode),
                used: false,
                inUse: false,
                emailSent: false, // Bulk generated, not emailed yet
                voterName: "",
                voterEmail: "",
                activatedAt: null,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            codesGenerated.push(code);
        }

        await batch.commit();

        return NextResponse.json({ success: true, count: codesGenerated.length });
    } catch (error: any) {
        console.error("Generate Codes Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        // No admin check for listing, but limit for security
        const snap = await db.collection("votingCodes").orderBy("createdAt", "desc").limit(1000).get();
        const codes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        return NextResponse.json({ codes });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
