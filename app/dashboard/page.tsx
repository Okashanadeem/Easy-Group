"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, BookOpen, LogOut, 
  Loader2, Search, CheckCircle2, 
  AlertCircle, Shield, Activity, 
  Terminal, Cpu, Zap, Bell, 
  Plus, ArrowRight, UserPlus, XCircle,
  Clock, Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<"projects" | "squads">("projects");

  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // In a real app, we'd have a /api/me endpoint or similar
      const responses = await Promise.all([
        fetch("/api/student/projects"),
        fetch("/api/groups"),
        fetch("/api/notifications")
      ]);

      // Check for unauthorized access across all endpoints
      if (responses.some(r => r.status === 401)) {
          localStorage.removeItem("studentId");
          router.push("/");
          return;
      }

      const projData = await responses[0].json();
      const groupData = await responses[1].json();
      const noteData = await responses[2].json();

      setProjects(projData);
      setMyGroups(groupData);
      setNotifications(noteData);
      
      // Get session from one of the responses if possible, or another fetch
      setSession({ studentId: localStorage.getItem("studentId") });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteResponse = async (noteId: string, action: "ACCEPT" | "DECLINE") => {
    try {
      const res = await fetch(`/api/notifications/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
          fetchData();
          if (notifications.length === 1) setShowNotifications(false);
      }
      else {
          const data = await res.json();
          alert(data.error || "Action failed");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  const handleCreateGroup = (projectId: string) => {
    router.push(`/dashboard/projects/${projectId}`);
  };

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen">
      <nav className="border-b border-hq-border bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-hq-blue/20 p-2.5 rounded-xl border border-hq-blue/30 glow-blue">
               <Cpu className="w-6 h-6 text-hq-blue" />
            </div>
            <div>
               <h1 className="font-mono text-sm font-black text-white uppercase tracking-tight">Easy-Group Portal</h1>
               <p className="font-mono text-[8px] text-slate-500 uppercase tracking-widest mt-1">Student Data Interface</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
                <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-slate-400 hover:text-white transition-colors"
                >
                    <Bell className={cn("w-5 h-5", notifications.length > 0 ? "animate-pulse text-hq-blue" : "")} />
                    {notifications.length > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-background" />
                    )}
                </button>

                {/* Notifications Panel */}
                {showNotifications && (
                    <>
                        {/* Backdrop for mobile focus */}
                        <div 
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden"
                            onClick={() => setShowNotifications(false)}
                        />
                        
                        <div className={cn(
                            "bg-slate-900 border border-hq-border shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[100] animate-in duration-200",
                            // Mobile: Centered floating card
                            "fixed inset-x-4 top-24 bottom-auto rounded-3xl lg:absolute lg:inset-auto lg:right-0 lg:top-full lg:mt-4 lg:w-80 lg:rounded-2xl lg:slide-in-from-top-2",
                            activeMobileTab === "squads" ? "lg:block" : "" // Dummy use of tab to keep classes happy
                        )}>
                            <div className="p-5 border-b border-hq-border/30 bg-black/40 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-hq-blue" />
                                    <h4 className="font-mono text-[10px] font-black text-white uppercase tracking-widest">Transmissions</h4>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[8px] bg-hq-blue/20 text-hq-blue px-2 py-1 rounded-lg font-bold uppercase tracking-tighter">
                                        {notifications.length} New
                                    </span>
                                    <button onClick={() => setShowNotifications(false)} className="lg:hidden p-1 text-slate-500 hover:text-white">
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="max-h-[60vh] lg:max-h-96 overflow-y-auto custom-scrollbar p-2">
                                {notifications.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <Zap className="w-8 h-8 text-slate-700 mx-auto mb-3 opacity-20" />
                                        <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">No active requests.</p>
                                    </div>
                                ) : notifications.map((note) => {
                                    const isInvite = note.type === "INVITE";
                                    return (
                                        <div key={note._id} className="p-4 mb-2 bg-white/[0.02] border border-hq-border/20 rounded-2xl hover:bg-white/5 transition-all">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-mono text-[8px] text-hq-cyan uppercase font-bold tracking-widest">{note.projectId?.courseCode}</span>
                                                <span className="font-mono text-[7px] text-slate-600 uppercase tracking-tighter italic">{note.projectId?.title}</span>
                                            </div>
                                            <p className="text-[11px] text-slate-200 mb-4 leading-relaxed">
                                                {isInvite ? (
                                                    <>Recruitment request from <span className="text-white font-black uppercase">{note.groupId?.groupName}</span></>
                                                ) : (
                                                    <><span className="text-white font-black uppercase">{note.senderId}</span> requested to join <span className="text-white font-black uppercase">{note.groupId?.groupName}</span></>
                                                )}
                                            </p>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleInviteResponse(note._id, "ACCEPT")}
                                                    className="flex-1 py-2.5 bg-hq-blue text-white font-mono text-[9px] font-black uppercase hover:bg-hq-blue/90 glow-blue transition-all rounded-xl flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle2 className="w-3 h-3" /> {isInvite ? "Accept" : "Approve"}
                                                </button>
                                                <button 
                                                    onClick={() => handleInviteResponse(note._id, "DECLINE")}
                                                    className="px-4 py-2.5 bg-rose-500/10 text-rose-500 border border-rose-500/30 font-mono text-[9px] font-black uppercase hover:bg-rose-500 hover:text-white transition-all rounded-xl"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
            <button 
              onClick={handleLogout}
              className="p-2.5 text-slate-400 hover:text-white border border-hq-border rounded-xl hover:bg-white/5 transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10">
        
        {/* Mobile Tab Switcher */}
        <div className="flex lg:hidden bg-slate-900/50 border border-hq-border/30 rounded-2xl p-1 mb-6">
            <button 
                onClick={() => setActiveMobileTab("projects")}
                className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-mono text-[10px] font-black uppercase tracking-widest transition-all",
                    activeMobileTab === "projects" ? "bg-hq-blue text-white glow-blue" : "text-slate-500 hover:text-slate-300"
                )}
            >
                <BookOpen className="w-3 h-3" /> Operations
            </button>
            <button 
                onClick={() => setActiveMobileTab("squads")}
                className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-mono text-[10px] font-black uppercase tracking-widest transition-all",
                    activeMobileTab === "squads" ? "bg-hq-blue text-white glow-blue" : "text-slate-500 hover:text-slate-300"
                )}
            >
                <Users className="w-3 h-3" /> Squads
            </button>
        </div>
        
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Main Content Column: Projects */}
            <div className={cn(
                "w-full lg:col-span-8 space-y-6",
                activeMobileTab === "squads" ? "hidden lg:block" : "block"
            )}>
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-hq-blue" />
                        Available Projects
                    </h2>
                    <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded border border-hq-border/30">
                        {projects.length} Matched
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    {loading ? (
                        Array(4).fill(0).map((_, i) => (
                            <div key={i} className="h-40 glass-card rounded-2xl border border-hq-border/20 animate-pulse bg-white/5" />
                        ))
                    ) : projects.length === 0 ? (
                        <div className="md:col-span-2 py-20 text-center border-2 border-dashed border-hq-border/30 rounded-3xl">
                            <p className="font-mono text-xs text-slate-600 uppercase tracking-widest">No matching enrollments detected.</p>
                        </div>
                    ) : projects.map((proj) => {
                        const userGroup = myGroups.find(g => g.projectId?._id === proj._id);
                        const isAccepted = userGroup?.members.find((m: any) => m.studentId === session?.studentId)?.status === "Accepted";
                        
                        return (
                            <div key={proj._id} className="glass-card p-5 rounded-2xl border border-hq-border/30 group hover:border-hq-blue/30 transition-all flex flex-col justify-between gap-6 relative overflow-hidden h-full">
                                <div className="space-y-3 relative z-10">
                                    <div className="flex items-start justify-between">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-mono text-[8px] font-bold bg-slate-950 border border-hq-border px-2 py-0.5 rounded text-hq-cyan w-fit">
                                                {proj.courseCode}
                                            </span>
                                            <span className="font-mono text-[7px] text-slate-500 uppercase tracking-tighter">
                                                {proj.courseTitle} • {proj.courseType}
                                            </span>
                                        </div>
                                        {proj.isLocked && <Lock className="w-3 h-3 text-rose-500 opacity-50" />}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-black text-white uppercase tracking-tight text-sm line-clamp-1 group-hover:text-hq-blue transition-colors">{proj.title}</h3>
                                        <p className="text-[10px] text-slate-500 font-medium line-clamp-2 leading-relaxed h-8">{proj.description}</p>
                                    </div>
                                </div>
                                
                                <div className="relative z-10 pt-2 border-t border-hq-border/10">
                                    {isAccepted ? (
                                        <button 
                                            onClick={() => router.push(`/dashboard/groups/${userGroup?._id}`)}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded-xl font-mono text-[8px] font-black uppercase hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/5"
                                        >
                                            <Users className="w-3 h-3" /> Manage Squad
                                        </button>
                                    ) : userGroup ? (
                                        <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-xl font-mono text-[8px] font-black uppercase italic">
                                            <Clock className="w-3 h-3" /> Awaiting Intel
                                        </div>
                                    ) : (
                                        <button 
                                            disabled={proj.isLocked}
                                            onClick={() => handleCreateGroup(proj._id)}
                                            className={cn(
                                                "w-full flex items-center justify-center gap-2 px-4 py-2.5 font-mono text-[8px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-[0.98]",
                                                proj.isLocked 
                                                    ? "bg-slate-900 text-slate-600 cursor-not-allowed border border-hq-border/20"
                                                    : "bg-hq-blue text-white hover:bg-hq-blue/90 glow-blue shadow-lg shadow-hq-blue/20"
                                            )}
                                        >
                                            {proj.isLocked ? "Locked" : "Create Group"}
                                            {!proj.isLocked && <ArrowRight className="w-3 h-3" />}
                                        </button>
                                    )}
                                </div>

                                {/* Subtle background icon */}
                                <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                                    <Zap className="w-24 h-24 rotate-12" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar Column: My Squads (Sticky on Desktop) */}
            <div className={cn(
                "w-full lg:col-span-4 space-y-6 lg:sticky lg:top-28",
                activeMobileTab === "projects" ? "hidden lg:block" : "block"
            )}>
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <Users className="w-5 h-5 text-hq-blue" />
                        My Squads
                    </h2>
                    {myGroups.length > 0 && (
                        <span className="font-mono text-[8px] text-hq-blue font-bold tracking-widest uppercase animate-pulse">
                            {myGroups.length} Active
                        </span>
                    )}
                </div>

                <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar pr-2 pb-10">
                    {loading ? (
                         <div className="h-40 glass-card rounded-2xl border border-hq-border/20 animate-pulse" />
                    ) : myGroups.length === 0 ? (
                        <div className="p-12 text-center border border-dashed border-hq-border/30 rounded-3xl bg-white/[0.02]">
                            <Zap className="w-8 h-8 text-slate-700 mx-auto mb-4 opacity-20" />
                            <p className="font-mono text-[9px] text-slate-600 uppercase tracking-widest">No active deployments detected.</p>
                        </div>
                    ) : myGroups.map((group) => (
                        <div key={group._id} className="glass-card p-5 rounded-2xl border border-hq-border/50 relative overflow-hidden hover:border-hq-blue/40 transition-all group shadow-xl">
                            <div className="absolute top-0 right-0 p-3">
                                <Activity className="w-3 h-3 text-hq-blue opacity-20 group-hover:opacity-100 transition-opacity" />
                            </div>
                            
                            <div className="mb-4">
                                <div className="flex flex-col gap-1 mb-1">
                                    <span className="font-mono text-[7px] font-bold text-hq-cyan uppercase tracking-widest">
                                        {group.projectId?.courseCode} // {group.projectId?.courseType}
                                    </span>
                                    <span className="font-mono text-[7px] text-slate-500 uppercase tracking-tighter truncate">
                                        {group.projectId?.courseTitle}
                                    </span>
                                </div>
                                <h4 className="font-black text-white uppercase tracking-tight text-sm line-clamp-1 group-hover:text-hq-blue transition-colors">{group.groupName}</h4>
                                <p className="text-[8px] text-slate-400 font-mono uppercase mt-1 tracking-tighter line-clamp-1 font-bold">{group.projectId?.title}</p>
                            </div>
                            
                            <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                                {group.members.map((m: any) => (
                                    <div key={m.studentId} className="flex items-center justify-between text-[9px] bg-black/40 p-2 rounded-lg border border-hq-border/20 group/member hover:border-hq-blue/30 transition-all">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className="w-4 h-4 rounded-full bg-hq-blue/10 flex items-center justify-center text-[7px] text-hq-blue font-bold border border-hq-blue/20">
                                                {m.name.charAt(0)}
                                            </div>
                                            <span className="text-slate-400 font-medium truncate">{m.name}</span>
                                        </div>
                                        <span className={cn(
                                            "px-1.5 py-0.5 rounded font-black text-[7px] tracking-tighter shrink-0",
                                            m.status === "Accepted" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                                        )}>
                                            {m.status.toUpperCase()}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <button 
                                onClick={() => router.push(`/dashboard/groups/${group._id}`)}
                                className="w-full mt-5 py-3 bg-hq-blue/5 border border-hq-blue/20 text-hq-blue font-mono text-[8px] font-black uppercase tracking-widest hover:bg-hq-blue hover:text-white transition-all rounded-xl flex items-center justify-center gap-2"
                            >
                                Enter Squad Command
                                <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
