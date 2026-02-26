"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { Save, UserPlus, Trash2, School, User, Mail, Phone, Hash } from "lucide-react";

interface Member {
  name: string;
  email: string;
  phone: string;
  rollNo: string;
}

export default function EditDetails({ teamId }: { teamId: string }) {
  const [team, setTeam] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const ref = doc(db, "teams", teamId);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setTeam(data);
        setMembers(data.members || []);
      }
    });
    return () => unsub();
  }, [teamId]);

  const handleAddMember = () => {
    if (members.length >= 6) return;
    setMembers([...members, { name: "", email: "", phone: "", rollNo: "" }]);
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleUpdateMember = (index: number, field: keyof Member, value: string) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
  };

  const handleSave = async () => {
    if (!team) return;
    setSaving(true);
    try {
      const res = await fetch("/api/team-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId,
          collegeName: team.collegeName,
          leader: team.leader,
          members
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Update failed");
      alert("Changes deployed successfully!");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to save configuration.");
    } finally {
      setSaving(false);
    }
  };

  if (!team) return (
    <div className="p-12 glass rounded-[2.5rem] flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="text-xs font-black uppercase text-slate-400">Loading Configuration...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Institution & Leader Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-[2.5rem] border-white/20 space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 border-b border-blue-600/10 pb-4 flex items-center gap-2">
            <School className="w-4 h-4" /> Venture Roots
          </h3>
          <div className="space-y-4">
            <InputGroup
              label="Institution / College"
              icon={School}
              value={team.collegeName || ""}
              onChange={(v: string) => setTeam({ ...team, collegeName: v })}
            />
          </div>
        </div>

        <div className="glass p-8 rounded-[2.5rem] border-white/20 space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 border-b border-blue-600/10 pb-4 flex items-center gap-2">
            <User className="w-4 h-4" /> Chief Executive
          </h3>
          <div className="space-y-4">
            <InputGroup
              label="Leader Name"
              icon={User}
              value={team.leader?.name || ""}
              onChange={(v: string) => setTeam({ ...team, leader: { ...team.leader, name: v } })}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup
                label="Leader Email"
                icon={Mail}
                value={team.leader?.email || ""}
                onChange={(v: string) => setTeam({ ...team, leader: { ...team.leader, email: v } })}
              />
              <InputGroup
                label="Leader Phone"
                icon={Phone}
                value={team.leader?.phone || ""}
                onChange={(v: string) => setTeam({ ...team, leader: { ...team.leader, phone: v } })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Co-Founders Section */}
      <div className="glass p-8 rounded-[2.5rem] border-white/20 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-blue-600/10 pb-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Co-Founding Ensemble ({members.length}/6)
          </h3>
          <button
            onClick={handleAddMember}
            disabled={members.length >= 6}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/10 text-blue-600 font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 hover:text-white transition-all disabled:opacity-30"
          >
            <UserPlus className="w-3 h-3" /> Add Co-Founder
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {members.map((m, i) => (
            <div key={i} className="relative p-6 rounded-[2rem] bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4 group">
              <button
                onClick={() => handleRemoveMember(i)}
                className="absolute top-4 right-4 p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Co-Founder 0{i + 1}</span>

              <div className="grid grid-cols-1 gap-4">
                <InputGroup
                  label="Name"
                  icon={User}
                  value={m.name}
                  onChange={(v: string) => handleUpdateMember(i, "name", v)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup
                    label="Roll No"
                    icon={Hash}
                    value={m.rollNo}
                    onChange={(v: string) => handleUpdateMember(i, "rollNo", v)}
                  />
                  <InputGroup
                    label="Phone"
                    icon={Phone}
                    value={m.phone}
                    onChange={(v: string) => handleUpdateMember(i, "phone", v)}
                  />
                </div>
                <InputGroup
                  label="Email"
                  icon={Mail}
                  value={m.email}
                  onChange={(v: string) => handleUpdateMember(i, "email", v)}
                />
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <div className="md:col-span-2 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem]">
              No additional ensemble members configured
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-10 right-10 z-50">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-3 px-8 py-5 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/40 active:scale-95 disabled:opacity-50"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full" /> : <Save className="w-5 h-5" />}
          {saving ? "Deploying Changes..." : "Deploy Configuration"}
        </button>
      </div>
    </div>
  );
}

function InputGroup({ label, icon: Icon, value, onChange, placeholder, type = "text" }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors">
          <Icon className="w-full h-full" />
        </div>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-sm text-slate-900 dark:text-slate-100"
        />
      </div>
    </div>
  );
}
