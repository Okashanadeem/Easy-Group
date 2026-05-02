"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Shield, User, Hash, Lock, 
  ChevronRight, Loader2, Terminal,
  Zap, Activity, Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [mode, setMode] = useState<"student" | "admin">("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const router = useRouter();

  useEffect(() => {
    const autoSync = async () => {
      try {
        await fetch("/api/sync", { method: "POST" });
      } catch (err) {
        console.error("Background sync failed:", err);
      }
    };
    autoSync();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    password: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuggestion("");

    try {
      const endpoint = mode === "student" ? "/api/login" : "/api/admin/login";
      
      // Trim inputs
      const trimmedData = {
        name: formData.name.trim(),
        studentId: formData.studentId.trim(),
        password: formData.password.trim()
      };

      const body = mode === "student" 
        ? { name: trimmedData.name, studentId: trimmedData.studentId }
        : { password: trimmedData.password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        if (mode === "admin") {
          router.push("/admin/dashboard");
        } else {
          localStorage.setItem("studentId", data.studentId);
          router.push("/dashboard");
        }
      } else {
        setError(data.error || "Authentication failed");
        if (data.suggestion) {
          setSuggestion(data.suggestion);
        }
      }
    } catch (err) {
      setError("Connection to HQ Core failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Logo/Brand Area */}
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-hq-blue/10 border border-hq-blue/30 mb-6 group transition-all hover:bg-hq-blue/20 glow-blue">
                <Cpu className="w-10 h-10 text-hq-blue group-hover:scale-110 transition-transform" />
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter glow-text-blue">Easy-Group</h1>
            <p className="font-mono text-[10px] text-slate-500 mt-2 uppercase tracking-[0.4em]">Integrated Team Nexus // v1.0</p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-2xl border border-hq-border/50 overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-hq-blue to-transparent" />
          
          {/* Mode Toggler */}
          <div className="flex border-b border-hq-border/30">
            <button 
              onClick={() => setMode("student")}
              className={cn(
                "flex-1 py-4 font-mono text-[10px] uppercase tracking-widest transition-all",
                mode === "student" ? "bg-hq-blue/10 text-hq-blue border-b-2 border-hq-blue" : "text-slate-500 hover:text-slate-300"
              )}
            >
              Student Portal
            </button>
            <button 
              onClick={() => setMode("admin")}
              className={cn(
                "flex-1 py-4 font-mono text-[10px] uppercase tracking-widest transition-all",
                mode === "admin" ? "bg-hq-blue/10 text-hq-blue border-b-2 border-hq-blue" : "text-slate-500 hover:text-slate-300"
              )}
            >
              HQ Command
            </button>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {mode === "student" ? (
              <>
                <div className="space-y-2">
                  <label className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <User className="w-3 h-3 text-hq-blue" /> Full Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-950/50 border border-hq-border/50 px-5 py-4 rounded-xl text-white placeholder:text-slate-800 outline-none transition-all focus:border-hq-blue/50"
                    placeholder="Enter your registered name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <Hash className="w-3 h-3 text-hq-blue" /> Student ID
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-950/50 border border-hq-border/50 px-5 py-4 rounded-xl text-white placeholder:text-slate-800 outline-none transition-all focus:border-hq-blue/50 uppercase"
                    placeholder="e.g. BSE-XX-XXX"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                  <Terminal className="w-3 h-3 text-hq-blue" /> Admin Authorization Key
                </label>
                <input
                  type="password"
                  required
                  className="w-full bg-slate-950/50 border border-hq-border/50 px-5 py-4 rounded-xl text-white placeholder:text-slate-800 outline-none transition-all focus:border-hq-blue/50"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            )}

            {error && (
              <div className="space-y-3">
                <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center text-rose-400 gap-3 text-[10px] font-bold uppercase animate-pulse">
                  <Activity className="w-4 h-4 shrink-0" />
                  {error}
                </div>
                {suggestion && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, name: suggestion });
                      setSuggestion("");
                      setError("");
                    }}
                    className="w-full p-4 bg-hq-blue/10 border border-hq-blue/30 rounded-xl text-hq-blue text-[10px] font-bold uppercase text-left hover:bg-hq-blue/20 transition-all flex items-center justify-between group"
                  >
                    <span>Did you mean: <span className="underline">{suggestion}</span>?</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-hq-blue text-white font-mono text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 group active:scale-[0.98] glow-blue rounded-xl"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                      Initialize Access
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
              )}
            </button>
          </form>

          <div className="p-4 bg-black/40 border-t border-hq-border flex items-center justify-between">
              <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-hq-blue" />
                  <div className="w-1.5 h-1.5 rounded-full bg-hq-border" />
                  <div className="w-1.5 h-1.5 rounded-full bg-hq-border" />
              </div>
              <span className="font-mono text-[7px] text-slate-600 uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-2 h-2" /> Secured by CAMS Sync
              </span>
          </div>
        </div>

        <p className="mt-8 text-center text-slate-600 font-mono text-[8px] uppercase tracking-[0.2em]">
          Unauthorized access is strictly monitored // 0xAF2
        </p>
      </div>
    </div>
  );
}
