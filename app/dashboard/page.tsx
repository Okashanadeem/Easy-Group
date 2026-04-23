"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, BookOpen, LogOut, 
  Loader2, Search, CheckCircle2, 
  AlertCircle, Shield, Activity, 
  Terminal, Cpu, Zap, Bell, 
  Plus, ArrowRight, UserPlus, XCircle,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [session, setSession] = useState<any>(null);

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

                {/* Notifications Pop-up */}
                {showNotifications && (
                    <div className="absolute right-0 mt-4 w-80 bg-slate-900 border border-hq-border shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-200">
                        <div className="p-4 border-b border-hq-border/30 bg-black/40 flex items-center justify-between">
                            <h4 className="font-mono text-[10px] font-black text-white uppercase tracking-widest">Notifications</h4>
                            <span className="text-[8px] bg-hq-blue/20 text-hq-blue px-1.5 py-0.5 rounded font-bold">{notifications.length} NEW</span>
                        </div>
                        <div className="max-h-96 overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Zap className="w-6 h-6 text-slate-700 mx-auto mb-2 opacity-20" />
                                    <p className="font-mono text-[8px] text-slate-600 uppercase tracking-widest">No pending transmissions.</p>
                                </div>
                            ) : notifications.map((note) => (
                                <div key={note._id} className="p-4 border-b border-hq-border/10 hover:bg-white/5 transition-all">
                                    <p className="text-[9px] font-mono text-hq-cyan uppercase mb-1">{note.projectId?.title}</p>
                                    <p className="text-[10px] text-white font-bold leading-tight mb-3">
                                        Invite from <span className="text-hq-blue">{note.groupId?.groupName}</span>
                                    </p>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleInviteResponse(note._id, "ACCEPT")}
                                            className="flex-1 py-1.5 bg-hq-blue/20 text-hq-blue border border-hq-blue/30 font-mono text-[8px] font-black uppercase hover:bg-hq-blue hover:text-white transition-all rounded"
                                        >
                                            Accept
                                        </button>
                                        <button 
                                            onClick={() => handleInviteResponse(note._id, "DECLINE")}
                                            className="px-3 py-1.5 bg-rose-500/10 text-rose-500 border border-rose-500/30 font-mono text-[8px] font-black uppercase hover:bg-rose-500 hover:text-white transition-all rounded"
                                        >
                                            <XCircle className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
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

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Column: Projects */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-hq-blue" />
                        Available Projects
                    </h2>
                    <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">{projects.length} Matched</span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        <div className="py-20 text-center space-y-4 glass-card rounded-3xl">
                            <Loader2 className="w-8 h-8 animate-spin text-hq-blue mx-auto" />
                            <p className="font-mono text-[10px] text-hq-blue animate-pulse uppercase tracking-[0.4em]">Decoding Project Node...</p>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="py-20 text-center border-2 border-dashed border-hq-border/30 rounded-3xl">
                            <p className="font-mono text-xs text-slate-600 uppercase tracking-widest">No matching enrollments found.</p>
                        </div>
                    ) : projects.map((proj) => {
                        const userGroup = myGroups.find(g => g.projectId?._id === proj._id);
                        const isAccepted = userGroup?.members.find((m: any) => m.studentId === session?.studentId)?.status === "Accepted";
                        
                        return (
                            <div key={proj._id} className="glass-card p-6 rounded-2xl border border-hq-border/30 group hover:border-hq-blue/30 transition-all flex items-center justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-[9px] font-bold bg-slate-950 border border-hq-border px-2 py-0.5 rounded text-hq-cyan">
                                            {proj.courseCode} {proj.courseType && `(${proj.courseType})`}
                                        </span>
                                        <h3 className="font-bold text-white uppercase tracking-tight">{proj.title}</h3>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium max-w-sm line-clamp-1">{proj.description}</p>
                                </div>
                                
                                {isAccepted ? (
                                    <button 
                                        onClick={() => router.push(`/dashboard/groups/${userGroup?._id}`)}
                                        className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded-xl font-mono text-[9px] font-bold uppercase hover:bg-emerald-500 hover:text-white transition-all"
                                    >
                                        <Users className="w-3 h-3" /> Manage Squad
                                    </button>
                                ) : userGroup ? (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-xl font-mono text-[9px] font-bold uppercase">
                                        <Clock className="w-3 h-3" /> Pending Invite
                                    </div>
                                ) : (
                                    <button 
                                        disabled={proj.isLocked}
                                        onClick={() => router.push(`/dashboard/projects/${proj._id}`)}
                                        className={cn(
                                            "flex items-center gap-2 px-5 py-3 font-mono text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-[0.98]",
                                            proj.isLocked 
                                                ? "bg-slate-900 text-slate-600 cursor-not-allowed"
                                                : "bg-hq-blue text-white hover:bg-hq-blue/90 glow-blue"
                                        )}
                                    >
                                        {proj.isLocked ? "Locked" : "Create Group"}
                                        {!proj.isLocked && <ArrowRight className="w-3 h-3" />}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right Column: My Groups */}
            <div className="space-y-6">
                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                    <Users className="w-5 h-5 text-hq-blue" />
                    My Squads
                </h2>

                <div className="space-y-4">
                    {loading ? (
                         <div className="p-10 text-center glass-card rounded-3xl">
                            <Loader2 className="w-6 h-6 animate-spin text-hq-blue mx-auto" />
                         </div>
                    ) : myGroups.length === 0 ? (
                        <div className="p-10 text-center border border-dashed border-hq-border/30 rounded-3xl">
                            <p className="font-mono text-[9px] text-slate-600 uppercase tracking-widest">No active deployments.</p>
                        </div>
                    ) : myGroups.map((group) => (
                        <div key={group._id} className="glass-card p-6 rounded-2xl border border-hq-border/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3">
                                <Activity className="w-4 h-4 text-hq-blue opacity-20" />
                            </div>
                            <h4 className="font-bold text-white uppercase tracking-tight mb-1">{group.groupName}</h4>
                            <p className="text-[10px] text-slate-500 font-mono uppercase mb-4">{group.projectId?.title}</p>
                            
                            <div className="space-y-2">
                                {group.members.map((m: any) => (
                                    <div key={m.studentId} className="flex items-center justify-between text-[10px] bg-black/20 p-2 rounded-lg border border-hq-border/30">
                                        <span className="text-slate-300 font-medium">{m.name}</span>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded font-bold text-[8px]",
                                            m.status === "Accepted" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                                        )}>
                                            {m.status.toUpperCase()}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <button 
                                onClick={() => router.push(`/dashboard/groups/${group._id}`)}
                                className="w-full mt-6 py-3 border border-hq-blue/30 text-hq-blue font-mono text-[9px] font-black uppercase tracking-widest hover:bg-hq-blue hover:text-white transition-all rounded-xl"
                            >
                                Manage Squad
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
