import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { teamName, leaderName, leaderEmail, leaderPhone, collegeName, members } = body;

        if (!teamName || !leaderName || !leaderEmail || !leaderPhone || !collegeName || !members) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check if registration is open
        const statusDoc = await db.collection("eventStatus").doc("global").get();
        if (!statusDoc.exists || !statusDoc.data()?.registrationOpen) {
            return NextResponse.json({ error: "Registration is currently closed" }, { status: 403 });
        }

        // Store in Firestore
        const teamRef = await db.collection("teams").add({
            teamName,
            leaderName,
            leaderEmail,
            leaderPhone,
            collegeName,
            members, // Array of member names
            shortlisted: false,
            approved: false,
            totalTokens: 0,
            problemId: "",
            createdAt: new Date(),
        });

        // Also create a "user" record for the leader if they use roll number login
        // But the request says leaderEmail/leaderPhone/leaderName. 
        // In my previous system I used Roll Numbers. 
        // I'll stick to what the user asked for in this request.

        return NextResponse.json({
            message: "Team Registered Successfully",
            teamId: teamRef.id
        });
    } catch (error: any) {
        console.error("Registration Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
