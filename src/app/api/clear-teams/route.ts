import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        // Verification (minimal admin check could be added here if needed, 
        // but the UI already protects it. For production, extra security is better)

        const teamsRef = db.collection("teams");
        const snapshot = await teamsRef.get();

        if (snapshot.empty) {
            return NextResponse.json({ message: "No teams to clear", deletedCount: 0 });
        }

        const batchSize = 500;
        let deletedCount = 0;

        // Firestore batches can handle up to 500 operations
        for (let i = 0; i < snapshot.docs.length; i += batchSize) {
            const batch = db.batch();
            const chunk = snapshot.docs.slice(i, i + batchSize);

            chunk.forEach(doc => {
                batch.delete(doc.ref);
                deletedCount++;
            });

            await batch.commit();
        }

        return NextResponse.json({
            message: "All teams cleared successfully",
            deletedCount
        });

    } catch (error: any) {
        console.error("Clear Teams API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
