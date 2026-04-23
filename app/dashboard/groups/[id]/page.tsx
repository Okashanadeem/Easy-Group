"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Users, UserPlus, Trash2, 
  Save, Loader2, Zap, AlertCircle,
  Shield, CheckCircle2, XCircle, 
  Terminal, Cpu, Hash, Lock, Edit2,
  Crown
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function GroupManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [inviteId, setInviteId] = useState("");
  const [error, setError] = useState("");
  const [isLeader, setIsLeader] = useState(false);
  const [studentId, setStudentId] = useState("");
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    groupName: "",
    attributes: {} as any
  });

  const router = useRouter();

  useEffect(() => {
    fetchGroup();
    const sid = typeof window !== 'undefined' ? localStorage.getItem('studentId') : "";
    setStudentId(sid || "");
  }, [id]);

  useEffect(() => {
    if (group && studentId) {
      setIsLeader(group.leaderId === studentId);
      // Initialize edit data
      setEditData({
        groupName: group.groupName,
        attributes: group.attributes || {}
      });
    }
  }, [group, studentId]);

  const fetchGroup = async () => {
    try {
      const res = await fetch(`/api/groups/${id}`);
      if (res.ok) {
          const data = await res.json();
          setGroup(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, payload: any = {}) => {
    if (action === "DISBAND" && !confirm("⚠️ DANGER: This will permanently delete your squad and remove all members. Are you absolutely sure?")) return;
    
    setUpdating(true);
    setError("");
    try {
      const res = await fetch(`/api/groups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });

      const data = await res.json();
      if (res.ok) {
          if (action === "DISBAND") {
            router.push("/dashboard");
            return;
          }
          fetchGroup();
          if (action === "INVITE_MEMBER") setInviteId("");
          if (action === "UPDATE_INFO") setIsEditing(false);
      } else {
          setError(data.error || "Uplink failed");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateInfo = (e: React.FormEvent) => {
    e.preventDefault();
    handleAction("UPDATE_INFO", { 
        groupName: editData.groupName, 
        attributes: editData.attributes 
    });
  };

  if (loading) return (
      <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-hq-blue" />
      </div>
  );

  if (!group) return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <h2 className="text-xl font-bold text-white uppercase tracking-widest">Squad Terminated</h2>
        <button onClick={() => router.push("/dashboard")} className="text-hq-blue font-mono text-xs uppercase hover:underline">Return to Hub</button>
    </div>
  );

  const project = group.projectId;
  const isLocked = project?.isLocked;
  const isFull = group.members.length >= (project?.maxMembers || 0);

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
            <button 
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-mono text-[10px] uppercase tracking-widest"
            >
                <ArrowLeft className="w-4 h-4" />
                Return to Command
            </button>

            {isLeader && !isLocked && (
                <button 
                    onClick={() => handleAction("DISBAND")}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/30 rounded-xl font-mono text-[10px] font-bold uppercase hover:bg-rose-500 hover:text-white transition-all"
                >
                    <Trash2 className="w-4 h-4" /> Disband Squad
                </button>
            )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-hq-blue" />
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">{group.groupName}</h1>
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500 uppercase tracking-[0.4em] ml-9">
                    <span>Assignment: {project?.title}</span>
                    <span className="text-hq-blue font-bold">// {project?.courseCode} {project?.courseType && `(${project?.courseType})`}</span>
                </div>
            </div>
            {isLocked ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/30 rounded-xl font-mono text-[10px] font-bold uppercase">
                    <Lock className="w-4 h-4" /> System Locked by Admin
                </div>
            ) : isLeader && (
                <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 border rounded-xl font-mono text-[10px] font-bold uppercase transition-all",
                        isEditing ? "bg-white/10 border-white/30 text-white" : "border-hq-blue/30 text-hq-blue hover:bg-hq-blue/10"
                    )}
                >
                    {isEditing ? <XCircle className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                    {isEditing ? "Cancel Edit" : "Edit Details"}
                </button>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Squad Roster */}
            <div className="lg:col-span-2 space-y-6">
                <div className="glass-card rounded-3xl border border-hq-border/50 overflow-hidden">
                    <div className="p-6 border-b border-hq-border/30 bg-white/5 flex items-center justify-between">
                        <h3 className="font-mono text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <Users className="w-4 h-4 text-hq-blue" /> Squad Roster
                        </h3>
                        <span className="font-mono text-[10px] text-slate-500">
                            {group.members.length} / {project?.maxMembers} UNITS
                        </span>
                    </div>
                    <div className="divide-y divide-hq-border/30">
                        {group.members.map((member: any) => (
                            <div key={member.studentId} className="p-6 flex items-center justify-between group hover:bg-white/5 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-hq-blue/10 border border-hq-blue/30 flex items-center justify-center text-hq-blue font-bold text-xs">
                                        {member.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white uppercase tracking-tight text-sm">
                                            {member.name} {member.studentId === group.leaderId && <span className="text-[8px] bg-hq-blue/20 text-hq-blue px-1.5 py-0.5 rounded ml-2">LEADER</span>}
                                        </p>
                                        <p className="font-mono text-[9px] text-slate-500">{member.studentId}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={cn(
                                        "px-3 py-1 rounded-lg font-mono text-[9px] font-bold uppercase tracking-widest",
                                        member.status === "Accepted" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                                    )}>
                                        {member.status}
                                    </span>
                                    {isLeader && member.studentId !== studentId && !isLocked && (
                                        <div className="flex items-center gap-1">
                                            {member.status === "Accepted" && (
                                                <button 
                                                    onClick={() => {
                                                        if(confirm(`Transfer leadership to ${member.name}? You will lose leader privileges.`)) {
                                                            handleAction("TRANSFER_LEADERSHIP", { studentId: member.studentId });
                                                        }
                                                    }}
                                                    title="Transfer Leadership"
                                                    className="p-2 text-slate-600 hover:text-hq-blue transition-colors"
                                                >
                                                    <Crown className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleAction("REMOVE_MEMBER", { studentId: member.studentId })}
                                                className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {isLeader && !isLocked && !isFull && (
                        <div className="p-6 bg-hq-blue/5 border-t border-hq-border/30">
                            <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest ml-1 mb-2 block">
                                Deploy Invite (Enter Student ID)
                            </label>
                            <div className="flex gap-2">
                                <input 
                                    type="text"
                                    className="flex-1 bg-slate-950/50 border border-hq-border/50 px-4 py-3 rounded-xl text-white outline-none focus:border-hq-blue/50 uppercase font-mono text-xs"
                                    placeholder="e.g. BSE-22-001"
                                    value={inviteId}
                                    onChange={(e) => setInviteId(e.target.value)}
                                />
                                <button 
                                    onClick={() => handleAction("INVITE_MEMBER", { studentId: inviteId })}
                                    disabled={updating || !inviteId}
                                    className="px-6 bg-hq-blue text-white font-mono text-[10px] font-black uppercase rounded-xl hover:bg-hq-blue/90 transition-all flex items-center gap-2 shadow-lg shadow-hq-blue/20"
                                >
                                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserPlus className="w-4 h-4" /> Invite</>}
                                </button>
                            </div>
                        </div>
                    )}

                    {isFull && isLeader && !isLocked && (
                        <div className="p-6 bg-emerald-500/5 border-t border-emerald-500/30 text-center">
                            <p className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Squad is at Max Capacity
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Squad Info / Edit Form */}
            <div className="space-y-6">
                <div className="glass-card p-8 rounded-3xl border border-hq-border/50">
                    <h3 className="font-mono text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                        <Terminal className="w-4 h-4 text-hq-blue" /> Mission Details
                    </h3>
                    
                    {isEditing ? (
                        <form onSubmit={handleUpdateInfo} className="space-y-6">
                            <div className="space-y-2">
                                <label className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">Squad Call-Sign</label>
                                <input 
                                    type="text"
                                    className="w-full bg-slate-950 border border-hq-border/50 px-4 py-3 rounded-xl text-white outline-none focus:border-hq-blue/50 text-xs"
                                    value={editData.groupName}
                                    onChange={(e) => setEditData({ ...editData, groupName: e.target.value })}
                                />
                            </div>
                            
                            {Object.entries(editData.attributes).map(([key, val]: [string, any]) => (
                                <div key={key} className="space-y-2">
                                    <label className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">{key}</label>
                                    <textarea 
                                        rows={2}
                                        className="w-full bg-slate-950 border border-hq-border/50 px-4 py-3 rounded-xl text-white outline-none focus:border-hq-blue/50 text-xs"
                                        value={val}
                                        onChange={(e) => setEditData({ 
                                            ...editData, 
                                            attributes: { ...editData.attributes, [key]: e.target.value } 
                                        })}
                                    />
                                </div>
                            ))}

                            <button 
                                type="submit"
                                disabled={updating}
                                className="w-full py-4 bg-hq-blue text-white font-mono text-[10px] font-black uppercase rounded-xl glow-blue flex items-center justify-center gap-2"
                            >
                                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            {group.attributes && Object.entries(group.attributes).map(([key, val]: [string, any]) => (
                                <div key={key}>
                                    <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest mb-1">{key}</p>
                                    <p className="text-xs text-white bg-white/5 p-3 rounded-xl border border-hq-border/30">{val}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {error && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center text-rose-400 gap-3 text-[10px] font-bold uppercase animate-shake">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
