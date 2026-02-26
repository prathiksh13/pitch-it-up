import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import * as XLSX from "xlsx";

export async function GET() {
    try {
        const teamsSnapshot = await db.collection("teams").orderBy("createdAt", "desc").get();
        const teamsData = teamsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                "Team ID": doc.id,
                "Startup Name": data.teamName,
                "College": data.collegeName,
                "Leader Name": data.leaderName,
                "Leader Email": data.leaderEmail,
                "Leader Phone": data.leaderPhone,
                "Members": (data.members || []).join(", "),
                "Shortlisted": data.shortlisted ? "Yes" : "No",
                "Total Tokens": data.totalTokens || 0,
                "Registered At": data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : "N/A"
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(teamsData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Teams");

        const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Disposition": 'attachment; filename="teams.xlsx"',
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            },
        });
    } catch (error: any) {
        console.error("Export Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
