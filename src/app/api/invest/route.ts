import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const { code, teamId, amount } = await req.json();
        const normalizedCode = (code || "").trim().toUpperCase();
        const normalizedTeamId = (teamId || "").trim().toLowerCase();
        const tokenAmount = Number(amount);

        if (!normalizedCode || !normalizedTeamId || isNaN(tokenAmount) || tokenAmount <= 0) {
            return NextResponse.json({ error: "Invalid investment parameters" }, { status: 400 });
        }

        const result = await db.runTransaction(async (transaction) => {
            // Check global voting status
            const statusRef = db.collection("eventStatus").doc("global");
            const statusSnap = await transaction.get(statusRef);
            if (!statusSnap.exists || !statusSnap.data()?.votingActive) {
                throw new Error("Voting is NOT active.");
            }

            // Fetch voting code
            const codeRef = db.collection("votingCodes").doc(normalizedCode);
            const codeSnap = await transaction.get(codeRef);
            if (!codeSnap.exists) throw new Error("Invalid voting code.");

            const codeData = codeSnap.data();
            if ((codeData?.tokensRemaining || 0) < tokenAmount) {
                throw new Error("Insufficient tokens to complete this investment.");
            }

            // Fetch team
            const teamRef = db.collection("teams").doc(normalizedTeamId);
            const teamSnap = await transaction.get(teamRef);
            if (!teamSnap.exists) throw new Error("Venture not identified.");

            // Deduct tokens from code and increment team tokens
            transaction.update(codeRef, {
                tokensRemaining: admin.firestore.FieldValue.increment(-tokenAmount)
            });

            transaction.update(teamRef, {
                totalTokens: admin.firestore.FieldValue.increment(tokenAmount)
            });

            // Create investment record
            const investmentRef = db.collection("investments").doc();
            transaction.set(investmentRef, {
                votingCode: normalizedCode,
                voterName: codeData?.voterName || "Anonymous Investor",
                teamId: normalizedTeamId,
                teamName: teamSnap.data()?.teamName,
                tokens: tokenAmount,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            return { newBalance: (codeData?.tokensRemaining || 0) - tokenAmount };
        });

        return NextResponse.json({ success: true, ...result });
    } catch (error: any) {
        console.error("Investment Transaction Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const code = (searchParams.get("code") || "").trim().toUpperCase();

        if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

        const snap = await db.collection("investments")
            .where("votingCode", "==", code)
            .orderBy("createdAt", "desc")
            .get();

        const history = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        return NextResponse.json({ history });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
