"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Cpu, Terminal, Users, 
  Save, Loader2, Zap, AlertCircle,
  BookOpen, Calendar
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

  const router = useRouter();

  useEffect(() => {
    fetchProject();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

            {/* Squad Initialization Form */}
            <div className="md:col-span-2">
                <div className="glass-card p-8 rounded-3xl border border-hq-border/50 shadow-2xl">
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
            </div>
        </div>
      </div>
    </div>
  );
}
