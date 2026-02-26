"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function Profile({ teamId }: { teamId: string }) {
  const [team, setTeam] = useState<any>(null);

  useEffect(() => {
    const ref = doc(db, "teams", teamId);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setTeam(snap.data());
    });
    return () => unsub();
  }, [teamId]);

  if (!team) return <div className="p-6">Loading...</div>;

  return (
    <div className="glass p-6 rounded-2xl">
      <h3 className="text-lg font-bold">Profile</h3>
      <div className="mt-4">
        <div><strong>Team:</strong> {team.teamName}</div>
        <div><strong>College:</strong> {team.collegeName}</div>
        <div><strong>Leader:</strong> {team.leader?.name} ({team.leader?.email})</div>
        <div className="mt-2"><strong>Members:</strong></div>
        <ul className="list-disc ml-6">
          {(team.members || []).map((m: any, i: number) => (
            <li key={i}>{m.name} • {m.email} • {m.rollNo}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
