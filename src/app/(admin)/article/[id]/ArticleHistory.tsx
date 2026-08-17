// ArticleHistory.tsx
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Globe,
  Minus,
  User,
} from "lucide-react";
import { formatDuration } from "@/utils/date";

export default function ArticleHistory({ logs = [] }: { logs: any[] }) {
  // 1. Sort logs chronologically descending (newest first)
  const sortedLogs = [...logs].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  // 2. CALCULATE DURATIONS
  const calculateMetrics = () => {
    if (logs.length < 2) return null;

    const pendingLog = [...logs]
      .reverse()
      .find((l) => l.new_approval === "pending");
    const approvedLog = [...logs]
      .reverse()
      .find((l) => l.new_approval === "approved");
    const publishedLog = [...logs]
      .reverse()
      .find((l) => l.new_status === "published");

    const metrics: any = {};

    if (pendingLog && approvedLog) {
      const diff =
        new Date(approvedLog.created_at).getTime() -
        new Date(pendingLog.created_at).getTime();
      metrics.reviewTime = formatDuration(diff);
    }

    if (approvedLog && publishedLog) {
      const diff =
        new Date(publishedLog.created_at).getTime() -
        new Date(approvedLog.created_at).getTime();
      metrics.publishTime = formatDuration(diff);
    }

    return metrics;
  };

  const metrics = calculateMetrics();

  if (sortedLogs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-50 pb-4 mb-4">
          <Clock className="text-brand-accent" size={20} />
          <h3 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">
            Audit Trail & History
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-6 text-slate-350">
          <Minus size={24} />
          <p className="text-[10px] font-bold uppercase tracking-widest mt-2">
            No activity recorded yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-50 pb-4">
        <div className="flex items-center gap-3">
          <Clock className="text-brand-accent" size={20} />
          <h3 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">
            Audit Trail & History
          </h3>
        </div>

        {metrics && (
          <div className="flex gap-4 select-none">
            {metrics.reviewTime && (
              <div className="text-right">
                <span className="block text-[8px] font-black text-slate-450 uppercase">
                  Review Speed
                </span>
                <span className="text-[10px] font-bold text-emerald-600">
                  {metrics.reviewTime}
                </span>
              </div>
            )}
            {metrics.publishTime && (
              <div className="text-right border-l border-slate-100 pl-4">
                <span className="block text-[8px] font-black text-slate-450 uppercase">
                  Publishing Gap
                </span>
                <span className="text-[10px] font-bold text-brand-accent">
                  {metrics.publishTime}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-linear-to-b before:from-slate-200 before:via-slate-100 before:to-transparent">
        {sortedLogs.map((log) => {
          const isPublished = log.new_status
            ?.toLowerCase()
            .includes("published");
          const isReview = log.new_status?.toLowerCase().includes("review");
          const isWriting = log.new_status?.toLowerCase().includes("writing");

          // Determine dot indicator styling
          let dotStyle = "bg-slate-350 ring-4 ring-slate-50";
          if (isPublished) {
            dotStyle = "bg-emerald-500 ring-4 ring-emerald-100 animate-pulse";
          } else if (isReview) {
            dotStyle = "bg-brand-accent ring-4 ring-brand-accent/10";
          } else if (isWriting) {
            dotStyle = "bg-amber-500 ring-4 ring-amber-100";
          }

          return (
            <div
              key={log.id}
              className="relative flex items-start gap-6 group animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              {/* Timeline Dot Indicator */}
              <div className="absolute left-0 w-10 h-10 rounded-xl bg-white border-2 border-slate-100 flex items-center justify-center z-10 group-hover:border-brand-accent transition-all">
                <span
                  className={`w-2 h-2 rounded-full ${dotStyle} transition-transform group-hover:scale-110`}
                />
              </div>

              {/* Log Details Container Card */}
              <div className="pl-14 space-y-4 flex-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs hover:border-slate-300 hover:shadow-2xs transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest select-none">
                    {new Date(log.created_at).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </span>

                  {log.user_email && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-650 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full shadow-3xs select-all">
                      <div className="w-4 h-4 rounded-full bg-slate-800 text-white text-[8px] font-black flex items-center justify-center uppercase shrink-0">
                        {log.user_email.charAt(0)}
                      </div>
                      <span
                        className="truncate max-w-[150px] font-extrabold text-slate-700"
                        title={log.user_email}
                      >
                        {log.user_email.split("@")[0]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Transition State Pill Panel */}
                {(log.old_status || log.new_status) && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider select-none">
                      Workflow Step Transition
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusPill status={log.old_status} />
                      <ArrowRight
                        size={12}
                        className="text-slate-350 shrink-0"
                      />
                      <StatusPill status={log.new_status} isActive />
                    </div>
                  </div>
                )}

                {/* Log Notes/Remarks details */}
                {log.notes && (
                  <div className="p-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-[11px] text-slate-500 font-medium italic leading-relaxed">
                      {log.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusPill({
  status,
  isActive,
}: {
  status: string;
  isActive?: boolean;
}) {
  if (!status) {
    return (
      <span className="text-[9px] font-bold text-slate-300 uppercase italic select-none">
        New Strategy Brief
      </span>
    );
  }

  const getStatusColor = (s: string) => {
    const norm = s.toLowerCase().trim();
    if (norm.includes("published"))
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (norm.includes("review"))
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    if (norm.includes("writing"))
      return "bg-amber-50 text-amber-700 border-amber-200";
    if (norm.includes("seo")) return "bg-sky-50 text-sky-700 border-sky-200";
    return "bg-slate-50 text-slate-650 border-slate-200";
  };

  return (
    <span
      className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border select-none ${getStatusColor(status)} ${
        isActive ? "ring-2 ring-offset-1 ring-slate-100" : "opacity-75"
      }`}
    >
      {status}
    </span>
  );
}
