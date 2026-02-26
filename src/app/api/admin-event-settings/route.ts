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

export async function GET() {
    try {
        const doc = await db.collection("eventSettings").doc("global").get();
        return NextResponse.json(doc.exists ? doc.data() : { eventTitle: "Pitch It Up 2026", eventTagline: "Where Ideas Turn Into Unicorns" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }
        const { eventTitle, eventTagline, adminUid } = body;

        if (!adminUid || !(await isAdmin(adminUid))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        if (!eventTitle) {
            return NextResponse.json({ error: "Event Title is required." }, { status: 400 });
        }

        await db.collection("eventSettings").doc("global").set({
            eventTitle: eventTitle.trim(),
            eventTagline: (eventTagline || "").trim(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Save Event Settings Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
