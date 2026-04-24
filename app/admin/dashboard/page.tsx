"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, BookOpen, LayoutDashboard, LogOut, 
  Trash2, RefreshCw, Loader2, Search,
  CheckCircle2, AlertCircle, Shield,
  Activity, Terminal, Cpu, Lock, 
  ChevronRight, Edit2, Plus, Download,
  Zap, Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import ProjectModal from "@/components/admin/ProjectModal";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"projects" | "registry">("projects");
  const [projects, setProjects] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  
  // Project Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const router = useRouter();

  useEffect(() => {
    const initialize = async () => {
      // Don't auto-sync every single time if we already have data, 
      // but the user asked for auto-fetch on load.
      await handleSync(); 
      await fetchInitialData();
    };
    initialize();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [projRes, courseRes, studentRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/sync/courses_list"),
        fetch("/api/sync/students_list")
      ]);

      if (projRes.status === 401) {
          router.push("/");
          return;
      }

      const projectsData = await projRes.json();
      const coursesData = courseRes.ok ? await courseRes.json() : [];
      const studentsData = studentRes.ok ? await studentRes.json() : [];

      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (err) {
      console.error(err);
      setProjects([]);
      setCourses([]);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      // If auto-sync fails, we still want to show existing data
    } catch (err) {
      console.error("Auto-sync failed:", err);
    } finally {
      setSyncing(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.studentId.toLowerCase().includes(search.toLowerCase())
  );

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.courseCode.toLowerCase().includes(search.toLowerCase())
  );

  const handleLockProject = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLocked: !currentStatus }),
      });
      if (res.ok) fetchInitialData();
    } catch (err) {
      alert("Lock failed");
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Confirm complete project deletion?")) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) fetchInitialData();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleHardReset = async () => {
    const password = prompt("⚠️ DANGER: Permanent Wipe Requested. Enter Admin Key to confirm:");
    if (!password) return;

    setResetting(true);
    try {
      const res = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) fetchInitialData();
      else {
          const data = await res.json();
          alert(data.error || "Reset failed");
      }
    } catch (err) {
      alert("Reset error");
    } finally {
      setResetting(false);
    }
  };

  const handleLogout = () => {
    // In a real app, clear cookie via API
    router.push("/");
  };

  const handleAutoAssign = async (id: string) => {
    if (!confirm("⚠️ This will automatically assign all leftover students to groups. This action is irreversible. Proceed?")) return;
    
    setAssigningId(id);
    try {
      const res = await fetch(`/api/projects/${id}/auto-assign`, { method: "POST" });
      const data = await res.json();
      
      if (res.ok) {
        alert(`SUCCESS: ${data.message}\n- New Groups: ${data.details.newGroupsCreated}\n- Groups Filled: ${data.details.groupsFilled}\n- Total Students Assigned: ${data.details.studentsAssigned}`);
        fetchInitialData();
      } else {
        alert(data.error || "Assignment failed");
      }
    } catch (err) {
      alert("Network error during assignment");
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="border-b border-hq-border bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-hq-blue/20 p-2.5 rounded-xl border border-hq-blue/30 glow-blue">
               <Shield className="w-6 h-6 text-hq-blue" />
            </div>
            <div>
               <h1 className="font-mono text-sm font-black text-white uppercase tracking-tight">Easy-Group HQ</h1>
               <p className="font-mono text-[8px] text-slate-500 uppercase tracking-widest mt-1">Superintendent Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2.5 text-hq-cyan hover:bg-hq-cyan/10 font-mono text-[10px] uppercase tracking-widest transition-all border border-hq-cyan/30 rounded-xl"
            >
              {syncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              Sync CAMS
            </button>
            <button 
              onClick={handleHardReset}
              disabled={resetting}
              className="flex items-center gap-2 px-4 py-2.5 text-rose-500 hover:bg-rose-500/10 font-mono text-[10px] uppercase tracking-widest transition-all border border-rose-500/30 rounded-xl"
            >
              <Database className="w-3 h-3" />
              Hard Reset
            </button>
            <button 
              onClick={handleLogout}
              className="p-2.5 text-slate-400 hover:text-white border border-hq-border rounded-xl hover:bg-white/5 transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-hq-border/30 gap-8">
            <button 
                onClick={() => setActiveTab("projects")}
                className={cn(
                    "pb-4 font-mono text-[10px] uppercase tracking-[0.2em] transition-all relative",
                    activeTab === "projects" ? "text-hq-blue" : "text-slate-500 hover:text-slate-300"
                )}
            >
                Project Frameworks
                {activeTab === "projects" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-hq-blue glow-blue" />}
            </button>
            <button 
                onClick={() => setActiveTab("registry")}
                className={cn(
                    "pb-4 font-mono text-[10px] uppercase tracking-[0.2em] transition-all relative",
                    activeTab === "registry" ? "text-hq-blue" : "text-slate-500 hover:text-slate-300"
                )}
            >
                Student Registry
                {activeTab === "registry" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-hq-blue glow-blue" />}
            </button>
        </div>

        {/* Global Search */}
        <div className="relative max-w-md">
            <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input 
                type="text" 
                placeholder={`Search ${activeTab === 'projects' ? 'Frameworks' : 'Registry'}...`}
                className="w-full bg-slate-900 border border-hq-border pl-12 pr-4 py-3 font-mono text-[10px] text-white outline-none focus:border-hq-blue/50 rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>

        {activeTab === "projects" ? (
            <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: "Active Frameworks", val: projects.length, icon: Cpu, color: "text-hq-blue" },
                        { label: "Synced Assets", val: courses.length, icon: Database, color: "text-hq-cyan" },
                        { label: "System Health", val: "Optimal", icon: Activity, color: "text-emerald-500" },
                    ].map((stat, i) => (
                        <div key={i} className="glass-card p-8 rounded-2xl border border-hq-border/50 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <stat.icon className="w-20 h-20" />
                            </div>
                            <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">{stat.label}</p>
                            <p className={cn("text-4xl font-black mt-4", stat.color)}>{stat.val}</p>
                        </div>
                    ))}
                </div>

                {/* Project Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                            <LayoutDashboard className="w-5 h-5 text-hq-blue" />
                            Operational Projects
                        </h2>
                    </div>
                    <button 
                        onClick={() => { setSelectedProject(null); setIsModalOpen(true); }}
                        className="flex items-center gap-3 px-6 py-4 bg-hq-blue text-white font-mono text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-hq-blue/90 transition-all active:scale-[0.98] shadow-xl shadow-hq-blue/20"
                    >
                        <Plus className="w-4 h-4" />
                        New Deployment
                    </button>
                </div>

                {/* Projects List */}
                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        <div className="py-20 text-center space-y-4">
                            <Loader2 className="w-10 h-10 animate-spin text-hq-blue mx-auto" />
                            <p className="font-mono text-[10px] text-hq-blue animate-pulse uppercase tracking-[0.4em]">Retrieving Core Records...</p>
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="py-20 text-center border-2 border-dashed border-hq-border/30 rounded-3xl">
                            <p className="font-mono text-xs text-slate-600 uppercase tracking-widest">No matching frameworks detected.</p>
                        </div>
                    ) : filteredProjects.map((proj) => (
                        <div key={proj._id} className="glass-card rounded-2xl border border-hq-border/30 overflow-hidden hover:border-hq-blue/30 transition-all group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                                <div className="flex items-center gap-6">
                                    <div className={cn(
                                        "w-16 h-16 rounded-2xl border flex items-center justify-center transition-all",
                                        proj.isLocked ? "bg-rose-500/10 border-rose-500/30 text-rose-500" : "bg-hq-blue/10 border-hq-blue/30 text-hq-blue"
                                    )}>
                                        {proj.isLocked ? <Lock className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-[9px] font-bold bg-slate-950 border border-hq-border px-2 py-0.5 rounded text-hq-cyan">
                                                {proj.courseCode} {proj.courseType && `(${proj.courseType})`}
                                            </span>
                                            <h3 className="font-black text-white uppercase tracking-tight text-lg">{proj.title}</h3>
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="font-mono text-[9px] text-hq-blue font-bold uppercase tracking-wider mb-1">{proj.courseTitle}</p>
                                            <p className="text-xs text-slate-500 font-medium max-w-md line-clamp-1">{proj.description}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button 
                                    onClick={() => handleAutoAssign(proj._id)}
                                    disabled={assigningId === proj._id}
                                    className={cn(
                                        "p-3 border rounded-xl transition-all",
                                        assigningId === proj._id ? "bg-hq-blue/20 border-hq-blue text-hq-blue" : "bg-white/5 border-hq-border text-slate-400 hover:text-hq-cyan hover:border-hq-cyan/30"
                                    )}
                                    title="Auto-Assign Leftover Students"
                                    >
                                        {assigningId === proj._id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                                    </button>
                                    <button 
                                    onClick={() => router.push(`/admin/projects/${proj._id}`)}
                                    className="p-3 bg-white/5 border border-hq-border rounded-xl text-slate-400 hover:text-hq-blue hover:border-hq-blue/30 transition-all"
                                    title="View Framework Details"
                                    >
                                        <LayoutDashboard className="w-5 h-5" />
                                    </button>
                                    <a 
                                    href={`/api/projects/${proj._id}/export`}
                                    className="p-3 bg-white/5 border border-hq-border rounded-xl text-slate-400 hover:text-emerald-500 hover:border-emerald-500/30 transition-all"
                                    title="Export Excel"
                                    >
                                        <Download className="w-5 h-5" />
                                    </a>
                                    <button 
                                    onClick={() => { setSelectedProject(proj); setIsModalOpen(true); }}
                                    className="p-3 bg-white/5 border border-hq-border rounded-xl text-slate-400 hover:text-hq-blue hover:border-hq-blue/30 transition-all"
                                    title="Edit Configuration"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button 
                                    onClick={() => handleLockProject(proj._id, proj.isLocked)}
                                    className={cn(
                                        "p-3 border rounded-xl transition-all",
                                        proj.isLocked ? "bg-rose-500/10 border-rose-500/30 text-rose-500" : "bg-white/5 border-hq-border text-slate-400 hover:text-amber-500 hover:border-amber-500/30"
                                    )}
                                    title={proj.isLocked ? "Unlock Project" : "Lock Project"}
                                    >
                                        {proj.isLocked ? <Lock className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                                    </button>
                                    <button 
                                    onClick={() => handleDeleteProject(proj._id)}
                                    className="p-3 bg-white/5 border border-hq-border rounded-xl text-slate-400 hover:text-rose-500 hover:border-rose-500/30 transition-all"
                                    title="Purge Record"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="bg-white/5 px-6 py-3 border-t border-hq-border/30 flex items-center justify-between">
                                <div className="flex gap-4">
                                    <span className="font-mono text-[9px] text-slate-500 uppercase flex items-center gap-2">
                                        <Users className="w-3 h-3" /> Capacity: {proj.maxMembers}
                                    </span>
                                    <span className="font-mono text-[9px] text-slate-500 uppercase flex items-center gap-2">
                                        <Zap className="w-3 h-3" /> Status: {proj.isLocked ? "LOCKED" : "ACTIVE"}
                                    </span>
                                </div>
                                <div className="font-mono text-[8px] text-slate-600 uppercase">
                                    Sync ID: {proj._id.substring(0,8)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        ) : (
            <div className="glass-card rounded-2xl border border-hq-border/30 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-hq-border/30">
                                <th className="px-6 py-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">Student Name</th>
                                <th className="px-6 py-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID / Roll No</th>
                                <th className="px-6 py-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enrollments</th>
                                <th className="px-6 py-4 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">Last Sync</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-hq-border/30">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center">
                                        <p className="font-mono text-xs text-slate-600 uppercase tracking-widest">No student records found.</p>
                                    </td>
                                </tr>
                            ) : filteredStudents.map((student) => (
                                <tr key={student._id} className="hover:bg-hq-blue/5 transition-all">
                                    <td className="px-6 py-4">
                                        <div className="font-mono text-[11px] font-bold text-white uppercase">{student.name}</div>
                                        <div className="font-mono text-[9px] text-slate-500 lowercase">{student.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-[10px] bg-hq-blue/10 text-hq-blue border border-hq-blue/30 px-2 py-1 rounded">
                                            {student.studentId}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {student.enrolledCourses.map((c: any, i: number) => (
                                                <span key={i} className="text-[8px] bg-white/5 text-slate-400 border border-hq-border px-1.5 py-0.5 rounded">
                                                    {c.courseCode} ({c.courseType})
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-[10px] text-slate-600">
                                        {new Date(student.syncedAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </main>

      <ProjectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchInitialData}
        project={selectedProject}
        courses={courses}
      />
    </div>
  );
}
