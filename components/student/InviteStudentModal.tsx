"use client";

import { useState, useEffect } from "react";
import { X, UserPlus, Loader2, Search, Users, AlertCircle, CheckCircle2, Square, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface Student {
  studentId: string;
  name: string;
  email: string;
  isInvited: boolean;
  pendingRequestsCount: number;
}

interface InviteStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  maxMembers: number;
  currentMemberCount: number;
  onInvite: (studentId: string) => Promise<void>;
  onBulkInvite: (studentIds: string[]) => Promise<void>;
}

export default function InviteStudentModal({ 
    isOpen, 
    onClose, 
    groupId, 
    maxMembers, 
    currentMemberCount,
    onInvite, 
    onBulkInvite 
}: InviteStudentModalProps) {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkInviting, setIsBulkInviting] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const slotsLeft = Math.max(0, maxMembers - (currentMemberCount + pendingCount));

  useEffect(() => {
    if (isOpen && groupId) {
      fetchEligibleStudents();
      setSelectedIds(new Set());
      setError("");
    }
  }, [isOpen, groupId]);

  const fetchEligibleStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/groups/${groupId}/eligible-students`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students);
        setPendingCount(data.pendingCount || 0);
      } else {
        setError("Failed to fetch eligible students");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (studentId: string) => {
    if (slotsLeft <= 0) {
        setError("Squad capacity reached. Manage your pending invites to free up slots.");
        return;
    }
    setInvitingId(studentId);
    try {
      await onInvite(studentId);
      setStudents(prev => prev.map(s => s.studentId === studentId ? { ...s, isInvited: true } : s));
      setPendingCount(prev => prev + 1);
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(studentId);
        return next;
      });
    } catch (err) {
      // Error handled by parent
    } finally {
      setInvitingId(null);
    }
  };

  const handleBulkInvite = async () => {
    if (selectedIds.size === 0) return;
    
    if (selectedIds.size > slotsLeft) {
        setError(`Limit Exceeded: You only have ${slotsLeft} slots remaining.`);
        return;
    }

    setIsBulkInviting(true);
    try {
      const ids = Array.from(selectedIds);
      await onBulkInvite(ids);
      setStudents(prev => prev.map(s => ids.includes(s.studentId) ? { ...s, isInvited: true } : s));
      setPendingCount(prev => prev + ids.length);
      setSelectedIds(new Set());
      onClose();
    } catch (err) {
      // Error handled by parent
    } finally {
      setIsBulkInviting(false);
    }
  };

  const toggleSelect = (studentId: string) => {
    setError("");
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) {
          next.delete(studentId);
      } else {
          if (next.size >= slotsLeft) {
              setError(`Capacity Alert: You only have ${slotsLeft} slots left to fill.`);
              return prev;
          }
          next.add(studentId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    setError("");
    const uninvitedVisible = filteredStudents.filter(s => !s.isInvited);
    if (selectedIds.size === Math.min(uninvitedVisible.length, slotsLeft)) {
      setSelectedIds(new Set());
    } else {
      const toSelect = uninvitedVisible.slice(0, slotsLeft).map(s => s.studentId);
      setSelectedIds(new Set(toSelect));
      if (uninvitedVisible.length > slotsLeft) {
          setError(`Auto-capped: Limited to your ${slotsLeft} remaining slots.`);
      }
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const uninvitedCount = filteredStudents.filter(s => !s.isInvited).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-card w-full max-w-2xl border-x-0 border-b-0 sm:border border-hq-border/50 relative overflow-hidden shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 flex flex-col h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-[2rem] sm:rounded-3xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-hq-blue shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
        
        <div className="p-4 md:p-6 border-b border-hq-border/30 bg-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-hq-blue" />
            <h2 className="font-mono text-xs md:text-sm font-black text-white uppercase tracking-tighter">
              Available Personnel
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 text-slate-500 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 md:p-6 space-y-4 shrink-0 border-b border-hq-border/30 bg-white/5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="SEARCH BY NAME OR ID..."
              className="w-full bg-slate-950/50 border border-hq-border/50 pl-12 pr-4 py-3 md:py-4 font-mono text-[10px] md:text-xs text-white outline-none focus:border-hq-blue/50 rounded-xl md:rounded-2xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2">
            <p className="font-mono text-[8px] md:text-[10px] text-slate-500 uppercase tracking-widest">
              Slots: {slotsLeft} Available / Selection: {selectedIds.size}
            </p>
            {uninvitedCount > 0 && slotsLeft > 0 && (
                <button 
                    onClick={toggleSelectAll}
                    className="font-mono text-[8px] md:text-[10px] text-hq-blue hover:text-white uppercase tracking-widest flex items-center gap-2 transition-colors w-fit"
                >
                    {selectedIds.size === Math.min(uninvitedCount, slotsLeft) ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                    {selectedIds.size === Math.min(uninvitedCount, slotsLeft) ? "Deselect" : `Select Top ${slotsLeft}`}
                </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {error && (
            <div className="m-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center text-rose-400 gap-3 text-[8px] md:text-[10px] font-bold uppercase animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-hq-blue" />
              <p className="font-mono text-[9px] md:text-[10px] text-slate-500 uppercase tracking-widest">Scanning Network...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
              <Users className="w-8 h-8 opacity-20" />
              <p className="font-mono text-[9px] md:text-[10px] uppercase tracking-widest">No personnel found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-1">
              {filteredStudents.map(student => (
                <div 
                    key={student.studentId} 
                    className={cn(
                        "group p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all flex items-center justify-between cursor-pointer",
                        student.isInvited ? "bg-white/5 border-transparent opacity-60" : 
                        selectedIds.has(student.studentId) ? "bg-hq-blue/10 border-hq-blue/30" : "hover:bg-white/5 border-transparent hover:border-hq-border/30"
                    )}
                    onClick={() => !student.isInvited && toggleSelect(student.studentId)}
                >
                  <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                    {!student.isInvited && (
                        <div className="text-hq-blue shrink-0">
                            {selectedIds.has(student.studentId) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 opacity-30 group-hover:opacity-100" />}
                        </div>
                    )}
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-hq-blue/10 border border-hq-blue/30 flex items-center justify-center text-hq-blue font-bold text-[10px] md:text-xs shrink-0">
                      {student.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white uppercase tracking-tight text-xs md:text-sm truncate">
                          {student.name}
                        </p>
                        {student.pendingRequestsCount > 0 && (
                          <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded font-mono text-[7px] md:text-[8px] font-bold animate-pulse">
                            {student.pendingRequestsCount} PENDING
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-[8px] md:text-[9px] text-slate-500 truncate">{student.studentId}</p>
                    </div>
                  </div>
                  
                  {student.isInvited ? (
                    <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg font-mono text-[8px] md:text-[9px] font-bold uppercase tracking-widest shrink-0 ml-2">
                      <CheckCircle2 className="w-3 h-3" /> <span className="hidden xs:inline">Invited</span>
                    </div>
                  ) : (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInvite(student.studentId);
                      }}
                      disabled={invitingId === student.studentId || slotsLeft <= 0}
                      className="px-3 md:px-4 py-2 bg-hq-blue/10 text-hq-blue border border-hq-blue/30 rounded-lg font-mono text-[8px] md:text-[9px] font-bold uppercase tracking-widest hover:bg-hq-blue hover:text-white transition-all flex items-center gap-2 shrink-0 ml-2"
                    >
                      {invitingId === student.studentId ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <UserPlus className="w-3 h-3" />
                      )}
                      <span className="hidden xs:inline">Deploy</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 md:p-6 border-t border-hq-border/30 bg-white/5 shrink-0 space-y-2 md:space-y-3">
          {selectedIds.size > 0 && (
              <button
                onClick={handleBulkInvite}
                disabled={isBulkInviting}
                className="w-full py-3 md:py-4 bg-hq-blue text-white font-mono text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-hq-blue/90 glow-blue transition-all flex items-center justify-center gap-3 shadow-lg shadow-hq-blue/20"
              >
                {isBulkInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserPlus className="w-4 h-4" /> Deploy {selectedIds.size} Invites</>}
              </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 md:py-4 border border-hq-border text-slate-500 font-mono text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all"
          >
            Close Terminal
          </button>
        </div>
      </div>
    </div>
  );
}
