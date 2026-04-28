"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Cpu, Terminal, Users, 
  Save, Loader2, Zap, AlertCircle,
  BookOpen, Calendar, UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProjectEnrollmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    groupName: "",
    attributes: {} as any
  });

  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [requestingGroupId, setRequestingGroupId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');

  const router = useRouter();

  useEffect(() => {
    fetchProject();
    fetchAvailableGroups();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (res.ok) {
          const data = await res.json();
          setProject(data);
          // Initialize attributes based on requiredFields
          const attrs = {} as any;
          data.requiredFields.forEach((f: string) => attrs[f] = "");
          setFormData(prev => ({ ...prev, attributes: attrs }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableGroups = async () => {
    setLoadingGroups(true);
    try {
      const res = await fetch(`/api/groups?projectId=${id}&discovery=true`);
      if (res.ok) {
        const data = await res.json();
        setAvailableGroups(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleJoinRequest = async (groupId: string) => {
    setRequestingGroupId(groupId);
    try {
      const res = await fetch(`/api/groups/${groupId}/join`, {
        method: "POST"
      });
      const data = await res.json();
      if (res.ok) {
        alert("Join request sent to squad leader");
        fetchAvailableGroups();
      } else {
        alert(data.error || "Failed to send request");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setRequestingGroupId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const confirmLead = confirm("Are you sure that you want to lead this group?");
    if (!confirmLead) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: id,
          groupName: formData.groupName,
          attributes: formData.attributes
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/dashboard/groups/${data._id}`);
      } else {
        setError(data.error || "Failed to initialize squad");
      }
    } catch (err) {
      setError("Uplink failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
      <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-hq-blue" />
      </div>
  );

  if (!project) return <div>Project not found</div>;

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-mono text-[10px] uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Interface
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Project Specs */}
            <div className="space-y-6">
                <div className="glass-card p-8 rounded-3xl border border-hq-border/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <BookOpen className="w-16 h-16 text-hq-blue" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span className="font-mono text-[9px] font-bold bg-hq-blue/10 border border-hq-blue/30 px-2 py-1 rounded text-hq-blue uppercase tracking-widest">
                            {project.courseCode} {project.courseType && `(${project.courseType})`}
                        </span>
                    </div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight mt-4">{project.title}</h1>
                    <p className="font-mono text-[10px] text-hq-blue font-bold uppercase tracking-wider mt-2">{project.courseTitle}</p>
                    <p className="text-xs text-slate-400 mt-4 leading-relaxed">{project.description}</p>
                    
                    <div className="mt-8 space-y-4 pt-6 border-t border-hq-border/30">
                        <div className="flex items-center gap-3 text-slate-500 font-mono text-[9px] uppercase tracking-widest">
                            <Users className="w-4 h-4 text-hq-blue" />
                            Max Capacity: {project.maxMembers} Members
                        </div>
                        <div className="flex items-center gap-3 text-slate-500 font-mono text-[9px] uppercase tracking-widest">
                            <Calendar className="w-4 h-4 text-hq-blue" />
                            Deadline: {new Date(project.deadline).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Squad Interface Tabs */}
            <div className="md:col-span-2 space-y-8">
                <div className="flex bg-slate-950/50 p-1.5 rounded-3xl border border-hq-border/30 backdrop-blur-xl">
                    <button
                        onClick={() => setActiveTab('create')}
                        className={cn(
                            "flex-1 py-4 rounded-2xl font-mono text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3",
                            activeTab === 'create' 
                                ? "bg-hq-blue text-white shadow-2xl shadow-hq-blue/20" 
                                : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        <Zap className={cn("w-4 h-4", activeTab === 'create' ? "text-white" : "text-hq-blue/50")} />
                        Initialize Squad
                    </button>
                    <button
                        onClick={() => setActiveTab('join')}
                        className={cn(
                            "flex-1 py-4 rounded-2xl font-mono text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3",
                            activeTab === 'join' 
                                ? "bg-hq-blue text-white shadow-2xl shadow-hq-blue/20" 
                                : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        <Users className={cn("w-4 h-4", activeTab === 'join' ? "text-white" : "text-hq-blue/50")} />
                        Join Squad
                    </button>
                </div>

                {activeTab === 'create' ? (
                    <div className="glass-card p-8 rounded-3xl border border-hq-border/50 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 mb-8">
                            <Zap className="w-5 h-5 text-hq-blue" />
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Initialize New Squad</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-2">
                                <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Terminal className="w-3 h-3 text-hq-blue" /> Squad Call-Sign (Group Name)
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-950/50 border border-hq-border/50 px-5 py-4 rounded-2xl text-white outline-none focus:border-hq-blue/50"
                                    placeholder="e.g. ALPHA_OMEGA"
                                    value={formData.groupName}
                                    onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                                />
                            </div>

                            {project.requiredFields.map((field: string) => (
                                <div key={field} className="space-y-2">
                                    <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Cpu className="w-3 h-3 text-hq-blue" /> {field}
                                    </label>
                                    <textarea
                                        required
                                        rows={2}
                                        className="w-full bg-slate-950/50 border border-hq-border/50 px-5 py-4 rounded-2xl text-white outline-none focus:border-hq-blue/50"
                                        placeholder={`Enter your ${field.toLowerCase()}...`}
                                        value={formData.attributes[field]}
                                        onChange={(e) => setFormData({ 
                                            ...formData, 
                                            attributes: { ...formData.attributes, [field]: e.target.value }
                                        })}
                                    />
                                </div>
                            ))}

                            {error && (
                                <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center text-rose-400 gap-3 text-[10px] font-bold uppercase">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-5 bg-hq-blue text-white font-mono text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 active:scale-[0.98] glow-blue rounded-2xl"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                    <>Initialize Squad Protocol</>
                                )}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-hq-blue" />
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Active Squads</h2>
                        </div>

                        {loadingGroups ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="w-8 h-8 animate-spin text-hq-blue" />
                            </div>
                        ) : availableGroups.length === 0 ? (
                            <div className="p-10 text-center border-2 border-dashed border-hq-border/30 rounded-3xl bg-white/[0.02]">
                                <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">No squads detected in this sector. Consider initializing your own.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {availableGroups.map((group) => {
                                    const acceptedCount = group.members.filter((m: any) => m.status === "Accepted").length;
                                    return (
                                        <div key={group._id} className="glass-card p-6 rounded-2xl border border-hq-border/50 hover:border-hq-blue/30 transition-all flex flex-col justify-between gap-4 relative overflow-hidden">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-black text-white uppercase tracking-tight text-sm">{group.groupName}</h3>
                                                    <span className="font-mono text-[8px] text-slate-500 uppercase tracking-tighter">
                                                        {acceptedCount} / {project.maxMembers} Personnel
                                                    </span>
                                                </div>

                                                {/* Member List */}
                                                <div className="space-y-1.5">
                                                    <p className="font-mono text-[7px] text-hq-blue uppercase tracking-widest font-bold">Deployed Personnel:</p>
                                                    <div className="grid grid-cols-1 gap-1">
                                                        {group.members.filter((m: any) => m.status === "Accepted").map((m: any, i: number) => (
                                                            <div key={i} className="flex items-center gap-2 bg-white/5 p-1.5 rounded-lg border border-hq-border/20">
                                                                <div className="w-4 h-4 rounded-full bg-hq-blue/10 flex items-center justify-center text-[7px] text-hq-blue font-bold border border-hq-blue/20">
                                                                    {m.name.charAt(0)}
                                                                </div>
                                                                <span className="font-mono text-[8px] text-slate-400 uppercase truncate">{m.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Status Badges */}
                                                <div className="flex flex-wrap gap-2 pt-2 border-t border-hq-border/10">
                                                    {group.pendingInvites > 0 && (
                                                        <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded font-mono text-[7px] font-bold uppercase">
                                                            {group.pendingInvites} PENDING INVITES
                                                        </span>
                                                    )}
                                                    {group.pendingRequests > 0 && (
                                                        <span className="px-1.5 py-0.5 bg-hq-blue/10 text-hq-blue border border-hq-blue/20 rounded font-mono text-[7px] font-bold uppercase">
                                                            {group.pendingRequests} JOIN REQUESTS
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => handleJoinRequest(group._id)}
                                                disabled={requestingGroupId === group._id}
                                                className="w-full py-2.5 bg-hq-blue/10 border border-hq-blue/30 text-hq-blue font-mono text-[9px] font-black uppercase tracking-widest hover:bg-hq-blue hover:text-white transition-all rounded-xl flex items-center justify-center gap-2 mt-2"
                                            >
                                                {requestingGroupId === group._id ? <Loader2 className="w-3 h-3 animate-spin" /> : (
                                                    <><UserPlus className="w-3 h-3" /> Request Entry</>
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
