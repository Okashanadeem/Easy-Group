"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, Cpu, Terminal, Hash, BookOpen, Calendar, Users, AlertCircle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project?: any;
  courses: any[];
}

export default function ProjectModal({ isOpen, onClose, onSuccess, project, courses }: ProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    courseCode: "",
    courseTitle: "",
    courseType: "",
    title: "",
    description: "",
    minMembers: 1,
    maxMembers: 4,
    requiredFields: [] as string[],
    deadline: "",
  });

  const availableFields = ["Bio", "GitHub Link", "Project Title", "Tech Stack", "Live Demo URL"];

  useEffect(() => {
    if (project) {
      setFormData({
        courseCode: project.courseCode,
        courseTitle: project.courseTitle,
        courseType: project.courseType || "Theory",
        title: project.title,
        description: project.description,
        minMembers: project.minMembers,
        maxMembers: project.maxMembers,
        requiredFields: project.requiredFields || [],
        deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : "",
      });
    } else {
      setFormData({
        courseCode: "",
        courseTitle: "",
        courseType: "",
        title: "",
        description: "",
        minMembers: 1,
        maxMembers: 4,
        requiredFields: ["Bio", "Project Title"],
        deadline: "",
      });
    }
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const selectedCourse = courses.find(c => c.courseCode === formData.courseCode && c.courseType === formData.courseType);
      const payload = {
        ...formData,
        courseTitle: selectedCourse?.courseTitle || formData.courseTitle,
        courseType: selectedCourse?.courseType || formData.courseType
      };

      const endpoint = project ? `/api/projects/${project._id}` : "/api/projects";
      const method = project ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save project");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const toggleField = (field: string) => {
    setFormData(prev => ({
      ...prev,
      requiredFields: prev.requiredFields.includes(field)
        ? prev.requiredFields.filter(f => f !== field)
        : [...prev.requiredFields, field]
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-card w-full max-w-2xl border border-hq-border/50 relative overflow-hidden shadow-2xl animate-in zoom-in-95">
        <div className="absolute top-0 left-0 w-full h-1 bg-hq-blue shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
        
        <div className="p-6 border-b border-hq-border/30 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cpu className="w-5 h-5 text-hq-blue" />
            <h2 className="font-mono text-sm font-black text-white uppercase tracking-tighter">
              {project ? "Modify Project Core" : "Initialize New Project"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 text-slate-500 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center text-rose-400 gap-3 text-[10px] font-bold uppercase">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <BookOpen className="w-3 h-3 text-hq-blue" /> Associated Course
              </label>
              <select
                required
                className="w-full bg-slate-950/50 border border-hq-border/50 px-4 py-3 font-mono text-xs text-white outline-none focus:border-hq-blue/50"
                value={formData.courseCode && formData.courseType ? `${formData.courseCode}:${formData.courseType}` : ""}
                onChange={(e) => {
                  const [code, type] = e.target.value.split(":");
                  const selected = courses.find(c => c.courseCode === code && c.courseType === type);
                  setFormData({ 
                    ...formData, 
                    courseCode: code, 
                    courseType: type,
                    courseTitle: selected?.courseTitle || ""
                  });
                }}
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course._id} value={`${course.courseCode}:${course.courseType}`}>
                    {course.courseCode} ({course.courseType}) - {course.courseTitle}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Hash className="w-3 h-3 text-hq-blue" /> Project ID/Title
              </label>
              <input
                type="text"
                required
                className="w-full bg-slate-950/50 border border-hq-border/50 px-4 py-3 font-mono text-xs text-white outline-none focus:border-hq-blue/50"
                placeholder="e.g. Final Research Project"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Terminal className="w-3 h-3 text-hq-blue" /> Mission Description
            </label>
            <textarea
              required
              rows={3}
              className="w-full bg-slate-950/50 border border-hq-border/50 px-4 py-3 font-mono text-xs text-white outline-none focus:border-hq-blue/50"
              placeholder="Detail the project goals and requirements..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Users className="w-3 h-3 text-hq-blue" /> Max Members
              </label>
              <input
                type="number"
                required
                min={1}
                className="w-full bg-slate-950/50 border border-hq-border/50 px-4 py-3 font-mono text-xs text-white outline-none focus:border-hq-blue/50"
                value={formData.maxMembers}
                onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-3 h-3 text-hq-blue" /> Submission Deadline
              </label>
              <input
                type="date"
                required
                className="w-full bg-slate-950/50 border border-hq-border/50 px-4 py-3 font-mono text-xs text-white outline-none focus:border-hq-blue/50"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-3 h-3 text-hq-blue" /> Required Submission Attributes
            </label>
            <div className="flex flex-wrap gap-2">
              {availableFields.map(field => (
                <button
                  key={field}
                  type="button"
                  onClick={() => toggleField(field)}
                  className={cn(
                    "px-3 py-2 rounded-lg font-mono text-[9px] uppercase border transition-all",
                    formData.requiredFields.includes(field)
                      ? "bg-hq-blue/20 border-hq-blue text-hq-blue"
                      : "bg-slate-900 border-hq-border text-slate-500 hover:border-slate-600"
                  )}
                >
                  {field}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border border-hq-border text-slate-500 font-mono text-[10px] uppercase tracking-widest hover:bg-white/5"
            >
              Abort
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-hq-blue text-white font-mono text-[10px] font-black uppercase tracking-widest hover:bg-hq-blue/90 glow-blue disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Commit Configuration</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
