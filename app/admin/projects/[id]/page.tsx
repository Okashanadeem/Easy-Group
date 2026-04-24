"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Users, UserPlus, Loader2, 
  Shield, Terminal, Search, UserCheck,
  AlertCircle, LayoutGrid, List, MoveRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminProjectGroupsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [moveSid, setMoveSid] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");

  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${id}/groups`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
      } else {
        setError("Failed to fetch records");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAdd = async (groupId: string, studentId: string) => {
    if (!studentId) return;
    setUpdating(true);
    setError("");
    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ADMIN_ADD_MEMBER", studentId }),
      });
      if (res.ok) {
        fetchData();
        setMoveSid("");
        setSelectedGroupId("");
      } else {
        const err = await res.json();
        setError(err.error || "Uplink failed");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-hq-blue" />
      <p className="font-mono text-[10px] text-hq-blue uppercase tracking-[0.4em]">Decrypting Encrypted Stream...</p>
    </div>
  );

  if (!data) return null;

  const { project, groups, leftoverStudents } = data;

  const filteredGroups = groups.filter((g: any) => 
    g.groupName.toLowerCase().includes(search.toLowerCase()) || 
    g.members.some((m: any) => m.name.toLowerCase().includes(search.toLowerCase()) || m.studentId.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredLeftovers = leftoverStudents.filter((s: any) => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.studentId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 md:p-10 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
                <button 
                    onClick={() => router.push("/admin/dashboard")}
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-mono text-[10px] uppercase tracking-widest"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Terminal Exit
                </button>
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-hq-blue" />
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight">{project.title}</h1>
                    </div>
                    <p className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.3em] ml-9">
                        Framework: {project.courseCode} // Groups: {groups.length} // Leftovers: {leftoverStudents.length}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-900/50 p-1.5 rounded-xl border border-hq-border/30">
                <button 
                    onClick={() => setViewMode("list")}
                    className={cn("p-2 rounded-lg transition-all", viewMode === "list" ? "bg-hq-blue text-white shadow-lg shadow-hq-blue/20" : "text-slate-500 hover:text-slate-300")}
                >
                    <List className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => setViewMode("grid")}
                    className={cn("p-2 rounded-lg transition-all", viewMode === "grid" ? "bg-hq-blue text-white shadow-lg shadow-hq-blue/20" : "text-slate-500 hover:text-slate-300")}
                >
                    <LayoutGrid className="w-4 h-4" />
                </button>
            </div>
        </div>

        {/* Action Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input 
                    type="text" 
                    placeholder="Search Personnel or Squads..."
                    className="w-full bg-slate-950 border border-hq-border/50 pl-12 pr-4 py-4 font-mono text-xs text-white outline-none focus:border-hq-blue/50 rounded-2xl"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="STUDENT ID"
                    className="flex-1 bg-slate-950 border border-hq-border/50 px-4 py-4 font-mono text-xs text-white outline-none focus:border-hq-blue/50 rounded-2xl uppercase"
                    value={moveSid}
                    onChange={(e) => setMoveSid(e.target.value)}
                />
                <select 
                    className="flex-1 bg-slate-950 border border-hq-border/50 px-4 py-4 font-mono text-[10px] text-white outline-none focus:border-hq-blue/50 rounded-2xl uppercase"
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                >
                    <option value="">Target Squad</option>
                    {groups.map((g: any) => (
                        <option key={g._id} value={g._id}>{g.groupName} ({g.members.length})</option>
                    ))}
                </select>
                <button 
                    onClick={() => handleAdminAdd(selectedGroupId, moveSid)}
                    disabled={updating || !moveSid || !selectedGroupId}
                    className="p-4 bg-hq-blue text-white rounded-2xl hover:bg-hq-blue/90 disabled:opacity-50 transition-all glow-blue"
                >
                    {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                </button>
            </div>
        </div>

        {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center text-rose-400 gap-3 text-[10px] font-bold uppercase animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Leftover Personnel */}
            <div className="lg:col-span-1 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="font-mono text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-hq-cyan" /> Unassigned
                    </h3>
                    <span className="text-[10px] font-mono text-slate-600">{filteredLeftovers.length} UNITS</span>
                </div>
                <div className="space-y-2 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                    {filteredLeftovers.map((s: any) => (
                        <div 
                            key={s.studentId} 
                            className="glass-card p-4 rounded-xl border border-hq-border/30 hover:border-hq-cyan/30 transition-all group cursor-pointer"
                            onClick={() => setMoveSid(s.studentId)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-hq-cyan/10 border border-hq-cyan/30 flex items-center justify-center text-hq-cyan font-bold text-[10px]">
                                    {s.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-white uppercase tracking-tight text-[11px] truncate">{s.name}</p>
                                    <p className="font-mono text-[8px] text-slate-500">{s.studentId}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Squad Operations */}
            <div className="lg:col-span-3 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="font-mono text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Users className="w-4 h-4 text-hq-blue" /> Squad Frameworks
                    </h3>
                    <span className="text-[10px] font-mono text-slate-600">{filteredGroups.length} TOTAL</span>
                </div>

                <div className={cn(
                    "grid gap-6",
                    viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                )}>
                    {filteredGroups.map((group: any) => (
                        <div key={group._id} className="glass-card rounded-2xl border border-hq-border/30 overflow-hidden hover:border-hq-blue/30 transition-all flex flex-col">
                            <div className="p-5 border-b border-hq-border/30 bg-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-hq-blue/10 border border-hq-blue/30 flex items-center justify-center text-hq-blue">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <h4 className="font-black text-white uppercase tracking-tight text-sm">{group.groupName}</h4>
                                </div>
                                <span className={cn(
                                    "font-mono text-[10px] px-2 py-0.5 rounded border",
                                    group.members.length > project.maxMembers ? "bg-rose-500/10 border-rose-500/30 text-rose-500" : "bg-hq-blue/10 border-hq-blue/30 text-hq-blue"
                                )}>
                                    {group.members.length} / {project.maxMembers}
                                </span>
                            </div>
                            
                            <div className="p-5 flex-1 space-y-3">
                                {group.members.map((member: any) => (
                                    <div key={member.studentId} className="flex items-center justify-between group/member">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-slate-400 font-bold">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white uppercase text-[10px]">
                                                    {member.name}
                                                    {member.studentId === group.leaderId && <span className="text-hq-blue ml-1">★</span>}
                                                    {member.addedByAdmin && <span className="ml-2 px-1 text-[7px] border border-amber-500/50 text-amber-500 rounded uppercase">Admin-Added</span>}
                                                </p>
                                                <p className="font-mono text-[7px] text-slate-500">{member.studentId}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                if(confirm(`Remove ${member.name} from ${group.groupName}?`)) {
                                                    handleAdminAdd(group._id, member.studentId); // This logic needs adjustment or a separate remove action
                                                }
                                            }}
                                            className="opacity-0 group-hover/member:opacity-100 p-1 text-slate-600 hover:text-rose-500 transition-all"
                                        >
                                            {/* We use the same handleAdminAdd because the backend logic removes from ANY other group in project */}
                                        </button>
                                    </div>
                                ))}
                                
                                <button 
                                    onClick={() => handleAdminAdd(group._id, moveSid)}
                                    disabled={!moveSid || updating}
                                    className="w-full mt-4 py-2 border border-dashed border-hq-border/50 rounded-xl text-[9px] font-mono text-slate-500 uppercase hover:border-hq-blue hover:text-hq-blue transition-all flex items-center justify-center gap-2"
                                >
                                    {moveSid ? <><UserPlus className="w-3 h-3" /> Insert {moveSid}</> : "Select Unit to Insert"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
