import Link from "next/link";
import { 
  FileQuestion, 
  ChevronLeft, 
  Terminal, 
  Activity, 
  Cpu, 
  Zap 
} from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
        
        {/* Visual Element */}
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-rose-500/10 border border-rose-500/30 mb-8 group transition-all hover:bg-rose-500/20 glow-rose">
                <FileQuestion className="w-12 h-12 text-rose-500 group-hover:scale-110 transition-transform" />
            </div>
            <h1 className="text-6xl font-black text-white uppercase tracking-tighter glow-text-rose mb-2">404</h1>
            <p className="font-mono text-[10px] text-rose-500/70 uppercase tracking-[0.4em] mb-8">Node Not Found // Segment Fault</p>
        </div>

        {/* Error Card */}
        <div className="glass-card rounded-2xl border border-hq-border/50 overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
          
          <div className="p-8 space-y-6">
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-400 font-mono text-[10px] uppercase tracking-widest border-b border-hq-border/30 pb-4">
                    <Terminal className="w-4 h-4 text-hq-blue" />
                    <span>System Diagnostic</span>
                </div>
                
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <Activity className="w-3 h-3 text-rose-500 mt-1 shrink-0" />
                        <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                            <span className="text-rose-400 font-bold">ERROR:</span> The requested neural path <span className="text-slate-200">[RESOURCE_LOCATION]</span> does not exist in the current grid architecture.
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <Cpu className="w-3 h-3 text-hq-blue mt-1 shrink-0" />
                        <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                            <span className="text-hq-blue font-bold">ADVICE:</span> Verification of endpoint origin or redirection to the primary access point is recommended.
                        </p>
                    </div>
                </div>
            </div>

            <Link
              href="/"
              className="w-full py-5 bg-slate-900 border border-hq-border text-white font-mono text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 group active:scale-[0.98] hover:bg-hq-blue hover:border-hq-blue hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] rounded-xl"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Return to Base
            </Link>
          </div>

          <div className="p-4 bg-black/40 border-t border-hq-border flex items-center justify-between">
              <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,1)]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-hq-border" />
                  <div className="w-1.5 h-1.5 rounded-full bg-hq-border" />
              </div>
              <span className="font-mono text-[7px] text-slate-600 uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-2 h-2" /> Connection Idle // 0x404
              </span>
          </div>
        </div>

        <p className="mt-8 text-center text-slate-600 font-mono text-[8px] uppercase tracking-[0.2em]">
          All navigation attempts are logged // HQ Core
        </p>
      </div>
    </div>
  );
}
