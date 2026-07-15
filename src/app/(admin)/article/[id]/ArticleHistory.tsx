// ArticleHistory.tsx
import { Clock, User, ArrowRight, Minus } from 'lucide-react';
import { formatDuration } from "@/utils/date";

export default function ArticleHistory({ logs = [] }: { logs: any[] }) {
    // 1. CALCULATE DURATIONS (Logic Gate)
    // Inside ArticleHistory component
    const calculateMetrics = () => {
        if (logs.length < 2) return null;

        // Find the timestamps (assuming logs are sorted by created_at DESC)
        // We use .findLast or reverse to get the FIRST time it entered a state
        const pendingLog = [...logs].reverse().find(l => l.new_approval === 'pending');
        const approvedLog = [...logs].reverse().find(l => l.new_approval === 'approved');
        const publishedLog = [...logs].reverse().find(l => l.new_status === 'published');

        const metrics: any = {};

        if (pendingLog && approvedLog) {
            const diff = new Date(approvedLog.created_at).getTime() - new Date(pendingLog.created_at).getTime();
            metrics.reviewTime = formatDuration(diff);
        }

        if (approvedLog && publishedLog) {
            const diff = new Date(publishedLog.created_at).getTime() - new Date(approvedLog.created_at).getTime();
            metrics.publishTime = formatDuration(diff);
        }

        return metrics;
    };

    const metrics = calculateMetrics();

    // If no logs yet, show a clean empty state
    if (logs.length === 0) {
        return (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-50 pb-6 mb-6">
                    <Clock className="text-brand-accent" size={20} />
                    <h3 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">Audit Trail & History</h3>
                </div>
                <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                    <Minus size={24} />
                    <p className="text-[10px] font-bold uppercase tracking-widest mt-2">No activity recorded yet</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                <div className="flex items-center gap-3">
                    <Clock className="text-brand-accent" size={20} />
                    <h3 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">Audit Trail & History</h3>
                </div>

                {/* 2. THE ANALYTICS BADGES */}
                {metrics && (
                    <div className="flex gap-4">
                        {metrics.reviewTime && (
                            <div className="text-right">
                                <span className="block text-[8px] font-black text-slate-400 uppercase">Review Speed</span>
                                <span className="text-[10px] font-bold text-emerald-600">{metrics.reviewTime}</span>
                            </div>
                        )}
                        {metrics.publishTime && (
                            <div className="text-right border-l border-slate-100 pl-4">
                                <span className="block text-[8px] font-black text-slate-400 uppercase">Publishing Gap</span>
                                <span className="text-[10px] font-bold text-blue-600">{metrics.publishTime}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-linear-to-b before:from-slate-200 before:via-slate-100 before:to-transparent">
                {logs.map((log) => (
                    <div key={log.id} className="relative flex items-start gap-6 group">
                        {/* Timeline Dot */}
                        <div className="absolute left-0 w-10 h-10 rounded-xl bg-white border-2 border-slate-100 flex items-center justify-center z-10 group-hover:border-brand-accent transition-all">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-brand-accent" />
                        </div>

                        <div className="pl-14 space-y-3 flex-1">
                            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {new Date(log.created_at).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                  })}
                </span>
                                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                    <User size={12} className="text-brand-accent" />
                                    {log.user_email || 'System'}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <StatusPill status={log.old_status} />
                                <ArrowRight size={12} className="text-slate-300" />
                                <StatusPill status={log.new_status} isActive />
                            </div>

                            {log.notes && (
                                <div className="p-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                    <p className="text-[11px] text-slate-500 font-medium italic">{log.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function StatusPill({ status, isActive }: { status: string, isActive?: boolean }) {
    if (!status) return <span className="text-[9px] font-bold text-slate-300 uppercase italic">New Entry</span>;

    return (
        <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border ${
            isActive
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-400 border-slate-200'
        }`}>
      {status}
    </span>
    );
}