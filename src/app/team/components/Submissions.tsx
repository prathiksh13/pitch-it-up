"use client";

import React, { useEffect, useState, useRef } from "react";
import { db, storage } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Send, FileText, Github, FileDown, Upload, CheckCircle2, Loader2, Link as LinkIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Submissions({ teamId }: { teamId: string }) {
  const [subs, setSubs] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pptUrl, setPptUrl] = useState("");
  const [github, setGithub] = useState("");
  const [report, setReport] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ref = doc(db, "teams", teamId);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data()?.submissions || {};
        setSubs(data);
        setPptUrl(data.ppt || "");
        setGithub(data.github || "");
        setReport(data.report || "");
      }
    });
    return () => unsub();
  }, [teamId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation: Only allow PPT/PPTX/PDF
    const allowedTypes = ["application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Please upload a .ppt, .pptx, or .pdf file.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const storageRef = ref(storage, `submissions/${teamId}/ppt-${Date.now()}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          alert("Upload failed. Try again.");
          setUploading(false);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setPptUrl(downloadUrl);
          setUploading(false);
        }
      );
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/team-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId,
          submissions: { ppt: pptUrl, github, report }
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Failed");
      alert("Mission modules updated successfully!");
    } catch (err: any) {
      console.error(err);
      alert("Failed to synchronize mission data.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Active Status Header */}
      <div className="glass p-8 rounded-[2.5rem] border-white/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-xl font-black font-outfit uppercase tracking-tighter flex items-center gap-3">
            <Send className="w-5 h-5 text-blue-600" /> Mission Asset Management
          </h3>
          <p className="text-slate-500 font-medium text-sm mt-1">Review and deploy mission-critical documents</p>
        </div>
        <div className="flex items-center gap-4">
          <StatusBadge label="PPT" active={!!subs.ppt} />
          <StatusBadge label="Source" active={!!subs.github} />
          <StatusBadge label="Report" active={!!subs.report} />
        </div>
      </div>

      {/* Submission Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PPT Module */}
        <SubmissionModule
          icon={FileText}
          title="Venture Pitch Deck"
          subtitle="PPTX or PDF Format"
          active={!!pptUrl}
        >
          <div className="space-y-4">
            {pptUrl ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-[10px] font-black uppercase text-emerald-600 truncate">Asset Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <a href={pptUrl} target="_blank" rel="noreferrer" className="p-2 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-all">
                    <FileDown className="w-4 h-4" />
                  </a>
                  <button onClick={() => setPptUrl("")} className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 transition-all group"
              >
                <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors mb-2" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600">Upload Deck</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".ppt,.pptx,.pdf"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            {uploading && (
              <div className="space-y-2">
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="text-[10px] text-center font-black uppercase text-slate-400 animate-pulse">Syncing: {Math.round(uploadProgress)}%</p>
              </div>
            )}
          </div>
        </SubmissionModule>

        {/* GitHub Module */}
        <SubmissionModule
          icon={Github}
          title="Source Repository"
          subtitle="GitHub Architecture"
          active={!!github}
        >
          <InputGroup
            label="Repo Link"
            icon={LinkIcon}
            value={github}
            onChange={setGithub}
            placeholder="https://github.com/..."
          />
        </SubmissionModule>

        {/* Report Module */}
        <SubmissionModule
          icon={FileDown}
          title="Mission Report"
          subtitle="Project Narrative"
          active={!!report}
        >
          <InputGroup
            label="Report Link"
            icon={LinkIcon}
            value={report}
            onChange={setReport}
            placeholder="Google Drive / Notion Link"
          />
        </SubmissionModule>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-10 right-10 z-50 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving || uploading}
          className="flex items-center gap-3 px-8 py-5 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/40 active:scale-95 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-5 h-5" />}
          {saving ? "Deploying Assets..." : "Deploy Submissions"}
        </button>
      </div>
    </div>
  );
}

function SubmissionModule({ icon: Icon, title, subtitle, children, active }: any) {
  return (
    <div className="glass p-8 rounded-[2.5rem] border-white/20 flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/50 text-slate-900 dark:text-white">
          <Icon className="w-5 h-5" />
        </div>
        {active && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
      </div>
      <div>
        <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">{title}</h4>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{subtitle}</p>
      </div>
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
}

function StatusBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={cn(
      "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
      active ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-slate-500/5 text-slate-400 border border-slate-500/10"
    )}>
      {label}: {active ? "OK" : "MISSING"}
    </div>
  );
}

function InputGroup({ label, icon: Icon, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-2">
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors">
          <Icon className="w-full h-full" />
        </div>
        <input
          type="url"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-xs text-slate-900 dark:text-slate-100"
        />
      </div>
    </div>
  );
}
