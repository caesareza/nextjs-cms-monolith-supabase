"use client";

import { ExternalLink, Eye, Loader2, Pencil, User } from "lucide-react";
import Link from "next/link";
import type { ArticleDisplay } from "@/types/article";

interface ProductionDataGridProps {
  articles: ArticleDisplay[];
  loading: boolean;
}

// Restored: Exact workflow status badge logic map matching your system
function getArticleWorkflowBadge(status: string, content?: string) {
  if (status === "writing") {
    const isCleanSlate =
      !content || content.trim() === "" || content.trim() === "<p></p>";
    if (isCleanSlate) {
      return {
        label: "Ready to Write",
        color: "text-amber-700 bg-amber-50/60 border-amber-100",
      };
    }
    return {
      label: "In Progress",
      color: "text-blue-700 bg-blue-50/60 border-blue-100",
    };
  }
  if (status === "ready for review") {
    return {
      label: "Ready for Review",
      color: "text-indigo-700 bg-indigo-50/60 border-indigo-150",
    };
  }
  if (status === "published") {
    return {
      label: "Published",
      color: "text-emerald-700 bg-emerald-50/60 border-emerald-200",
    };
  }
  return {
    label: "Draft",
    color: "text-slate-650 bg-slate-50 border-slate-200",
  };
}

export default function ProductionDataGrid({
  articles,
  loading,
}: ProductionDataGridProps) {
  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl shadow-xs overflow-x-auto">
      <table className="w-full min-w-[750px] text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 select-none">
            <th className="pl-8 pr-4 py-4.5 w-2/12">Job Code</th>
            <th className="px-6 py-4.5 w-5/12">Topic / Title Asset</th>
            <th className="px-6 py-4.5 w-3/12">Status</th>
            <th className="pr-8 pl-4 py-4.5 text-right w-2/12">Workspace</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100/60">
          {loading ? (
            <tr>
              <td colSpan={4} className="py-24 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Loader2 className="animate-spin text-slate-300" size={20} />
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                    Loading Assigned Briefs...
                  </span>
                </div>
              </td>
            </tr>
          ) : articles.length > 0 ? (
            articles.map((item) => {
              const badge = getArticleWorkflowBadge(
                item.status,
                (item as any).content || "",
              );
              return (
                <tr
                  key={item.id}
                  className="group hover:bg-slate-50/40 transition-colors"
                >
                  {/* 1. JOB CODE */}
                  <td className="pl-8 pr-4 py-5 whitespace-nowrap align-middle">
                    <Link
                      href={`/article/edit/${item.id}`}
                      className="text-sm font-bold text-slate-900 group-hover:text-brand-accent transition-colors leading-snug line-clamp-1 cursor-pointer"
                    >
                      <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-md tracking-wider whitespace-nowrap select-all shadow-xs">
                        {item.job_code || "—"}
                      </span>
                    </Link>
                  </td>

                  {/* 2. TOPIC & AUTHOR BLOCK */}
                  <td className="px-6 py-5">
                    <div className="flex flex-col space-y-1 max-w-xl">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/article/${item.id}`}
                          className="text-sm font-bold text-slate-900 group-hover:text-brand-accent transition-colors leading-snug line-clamp-1 cursor-pointer"
                        >
                          {item.title}
                        </Link>
                        {item.gdrive_draft_content && (
                          <a
                            href={item.gdrive_draft_content}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open Google Drive Draft"
                            className="text-brand-accent hover:text-brand-navy p-1 bg-brand-accent/5 hover:bg-brand-accent/15 border border-brand-accent/20 rounded-md transition-all shrink-0 cursor-pointer"
                          >
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 select-none">
                        <User size={11} className="text-slate-300 shrink-0" />
                        <span>{item.writer || "Unassigned Writer"}</span>
                      </div>
                    </div>
                  </td>

                  {/* 3. SIMPLIFIED WORKFLOW BADGE */}
                  <td className="px-6 py-5">
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${badge.color} select-none`}
                    >
                      {badge.label}
                    </span>
                  </td>

                  {/* 4. WORKSPACE PORTAL */}
                  <td className="pr-8 pl-4 py-5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/article/${item.id}`}
                        className="p-2 text-slate-500 hover:text-brand-accent bg-slate-50 hover:bg-brand-accent/5 border border-slate-200 rounded-xl transition-all shadow-3xs cursor-pointer inline-flex items-center justify-center"
                        title="View Details"
                      >
                        <Eye size={13} />
                      </Link>
                      <Link
                        href={`/article/edit/${item.id}`}
                        className="p-2 text-slate-500 hover:text-brand-accent bg-slate-50 hover:bg-brand-accent/5 border border-slate-200 rounded-xl transition-all shadow-3xs cursor-pointer inline-flex items-center justify-center"
                        title="Edit Article"
                      >
                        <Pencil size={13} />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={4}
                className="py-20 text-center text-slate-400 font-bold text-xs uppercase tracking-wider italic"
              >
                No assigned production assets found for this cycle.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
