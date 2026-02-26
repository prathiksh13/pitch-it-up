import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import csv from "csv-parser";
import { Readable } from "stream";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const stream = Readable.from(buffer);

        const rows: any[] = [];

        await new Promise((resolve, reject) => {
            stream
                .pipe(csv())
                .on("data", (data) => rows.push(data))
                .on("end", resolve)
                .on("error", reject);
        });

        let imported = 0;
        let skipped = 0;
        let errors = 0;

        const existingSnapshot = await db.collection("teams").get();
        const existingIds = new Set(existingSnapshot.docs.map((d) => d.id));

        for (const row of rows) {
            try {
                const rawTeamName = (row["Team Name"] || "").trim();
                if (!rawTeamName) {
                    errors++;
                    continue;
                }

                // 🔥 Normalize teamName for safe login
                const teamName = rawTeamName.toLowerCase();

                const collegeName = (row["College Name"] || "").trim();

                const leaderEmail = (row["Leader Email"] || "")
                    .trim()
                    .toLowerCase();

                const leaderName = (row["Leader Name"] || "").trim();
                const leaderPhone = (row["Leader Phone"] || "").trim();

                const teamPassword = (row["Team Password"] || "").trim();
                const selectedPSStr = (row["Selected Problem Statement"] || "").trim();

                if (!teamPassword) {
                    errors++;
                    continue;
                }

                if (existingIds.has(teamName)) {
                    skipped++;
                    continue;
                }

                const members: any[] = [];

                for (let i = 1; i <= 6; i++) {
                    const mName = (row[`Member ${i} Name`] || "").trim();
                    const mEmail = (row[`Member ${i} Email`] || "").trim();
                    const mPhone = (row[`Member ${i} Phone`] || "").trim();
                    const mRoll = (row[`Member ${i} Roll No`] || "").trim();

                    if (mName || mEmail) {
                        members.push({
                            name: mName,
                            email: mEmail,
                            phone: mPhone,
                            rollNo: mRoll,
                        });
                    }
                }

                // Fetch PS to match ID if possible
                let selectedProblemStatement = { title: selectedPSStr, psId: "" };
                if (selectedPSStr) {
                    const psSnap = await db.collection("problemStatements")
                        .where("title", "==", selectedPSStr)
                        .limit(1)
                        .get();
                    if (!psSnap.empty) {
                        selectedProblemStatement.psId = psSnap.docs[0].id;
                    }
                }

                const teamData = {
                    teamName: rawTeamName, // display name (original case)
                    collegeName,
                    leader: {
                        name: leaderName,
                        email: leaderEmail,
                        phone: leaderPhone,
                    },
                    members,
                    teamPassword,
                    selectedProblemStatement,
                    // Initialize submissions per standard
                    submissions: { ppt: "", github: "", report: "" },
                    shortlisted: false,
                    eliminated: false,
                    totalTokens: 0,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                };

                // 🔥 Use lowercase ID for stable login
                await db.collection("teams").doc(teamName).set(teamData);

                existingIds.add(teamName);
                imported++;
            } catch (err) {
                console.error("Row import error:", err);
                errors++;
            }
        }

        return NextResponse.json({ imported, skipped, errors });
    } catch (error: any) {
        console.error("Import API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}