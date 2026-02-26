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
        const { adminUid } = body;

        // 8️⃣ Security Check
        if (!adminUid || !(await isAdmin(adminUid))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // 4️⃣ Delete All Voting Codes - Handle batch limit
        const votingCodesRef = db.collection("votingCodes");
        const snapshot = await votingCodesRef.get();

        if (snapshot.empty) {
            return NextResponse.json({ success: true, message: "No codes to delete." });
        }

        const batches = [];
        let currentBatch = db.batch();
        let count = 0;

        for (const doc of snapshot.docs) {
            currentBatch.delete(doc.ref);
            count++;

            if (count === 500) {
                batches.push(currentBatch.commit());
                currentBatch = db.batch();
                count = 0;
            }
        }

        if (count > 0) {
            batches.push(currentBatch.commit());
        }

        await Promise.all(batches);

        return NextResponse.json({ success: true, deletedCount: snapshot.size });
    } catch (error: any) {
        console.error("Delete All Codes Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
