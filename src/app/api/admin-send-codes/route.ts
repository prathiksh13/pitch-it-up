import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

// Helper to check admin role
async function isAdmin(uid: string) {
    if (!uid) return false;
    try {
        const userDoc = await db.collection("users").doc(uid).get();
        return userDoc.exists && userDoc.data()?.role === "admin";
    } catch (err) {
        console.error("Admin check failed:", err);
        return false;
    }
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
            return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
        }

        const { email: rawInput, tokensPerCode, adminUid } = body;

        // Security Check
        if (!adminUid || !(await isAdmin(adminUid))) {
            return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
        }

        if (!rawInput || typeof rawInput !== "string") {
            return NextResponse.json({ error: "Valid email target(s) string required." }, { status: 400 });
        }

        // 9️⃣ Smart Email Detection (Regex Extraction)
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g;
        const extracted = rawInput.match(emailRegex) || [];
        const uniqueEmails = Array.from(new Set(extracted.map((e: string) => e.trim().toLowerCase())));

        const tPerCode = Number(tokensPerCode) || 250;

        if (uniqueEmails.length === 0) {
            return NextResponse.json({ error: "No valid email addresses identified in input." }, { status: 400 });
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // 11️⃣ Verify transporter once
        try {
            await transporter.verify();
        } catch (smtpError: any) {
            console.error("SMTP Verification Failed:", smtpError);
            return NextResponse.json({ error: "Email service configuration error." }, { status: 500 });
        }

        const successfulEmails: string[] = [];
        const failedEmails: string[] = [];

        // Send using Promise.allSettled for efficiency
        const results = await Promise.allSettled(uniqueEmails.map(async (normalizedEmail) => {
            const code = generateCode();

            try {
                // Send separately
                await transporter.sendMail({
                    from: `"Venture Mission Control" <${process.env.EMAIL_USER}>`,
                    to: normalizedEmail,
                    subject: "Your Strategic Voting Code - Startup Simulation 2026",
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                            <h2 style="color: #2563eb; text-transform: uppercase;">Mission Assignment</h2>
                            <p>You have been identified as a strategic investor. Use the following cipher to access your equity tokens and back the most promising ventures.</p>
                            <div style="background: #f8fafc; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                                <span style="font-size: 24px; font-weight: 800; letter-spacing: 2px; color: #1e293b; font-family: monospace;">${code}</span>
                            </div>
                            <p style="font-size: 12px; color: #64748b;">This code grants you <strong>${tPerCode} tokens</strong>. Do not share this cipher with other modules.</p>
                        </div>
                    `,
                });

                // Store code ONLY if email successfully sent
                const codeRef = db.collection("votingCodes").doc(code);
                await codeRef.set({
                    tokensRemaining: tPerCode,
                    used: false,
                    inUse: false,
                    emailSent: true,
                    voterName: "",
                    voterEmail: normalizedEmail,
                    activatedAt: null,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });

                return normalizedEmail;
            } catch (error: any) {
                console.error(`Failed to dispatch to ${normalizedEmail}:`, error);
                throw new Error(normalizedEmail);
            }
        }));

        results.forEach((res) => {
            if (res.status === "fulfilled") {
                successfulEmails.push(res.value);
            } else {
                const reason = (res as PromiseRejectedResult).reason;
                failedEmails.push(reason instanceof Error ? reason.message : String(reason));
            }
        });

        return NextResponse.json({
            success: true,
            sent: successfulEmails.length,
            failed: failedEmails.length,
            successfulEmails,
            failedEmails
        });

    } catch (error: any) {
        console.error("Bulk Dispatch Global Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
