import { NextRequest, NextResponse } from "next/server";
import { db, storage } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const file = formData.get("file") as File;

        if (!title || !description || !file) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Generate PS ID
        const psRef = db.collection("problemStatements").doc();
        const psId = psRef.id;

        // Upload to Storage
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const bucket = storage.bucket();
        const fileRef = bucket.file(`problemStatements/${psId}.pdf`);

        await fileRef.save(buffer, {
            metadata: { contentType: "application/pdf" },
            public: true, // Making public as per requirements for homepage access
        });

        const pdfUrl = `https://storage.googleapis.com/${bucket.name}/problemStatements/${psId}.pdf`;

        const psData = {
            title,
            description,
            pdfUrl,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            isActive: true,
        };

        await psRef.set(psData);

        return NextResponse.json({ success: true, psId });
    } catch (error: any) {
        console.error("PS Upload Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const psId = searchParams.get("psId");

        if (!psId) return NextResponse.json({ error: "psId required" }, { status: 400 });

        // Delete from Firestore
        const psRef = db.collection("problemStatements").doc(psId);
        const psSnap = await psRef.get();
        if (!psSnap.exists) return NextResponse.json({ error: "PS not found" }, { status: 404 });

        await psRef.delete();

        // Optional: Delete from Storage (keep consistent)
        try {
            await storage.bucket().file(`problemStatements/${psId}.pdf`).delete();
        } catch (e) {
            console.warn("Storage deletion failed or file already gone:", e);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { psId, isActive } = await req.json();
        if (!psId) return NextResponse.json({ error: "psId required" }, { status: 400 });

        await db.collection("problemStatements").doc(psId).update({ isActive });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
