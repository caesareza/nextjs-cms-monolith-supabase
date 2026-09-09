"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  className?: string;
  showPageSizeSelector?: boolean;
}

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  itemLabel = "Records",
  className = "",
  showPageSizeSelector = true,
}: PaginationProps) {
  if (totalItems <= 0) return null;

  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate numbered pages with ellipsis window
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(
      (p) =>
        p === 1 ||
        p === totalPages ||
        Math.abs(p - currentPage) <= 1,
    )
    .reduce<(number | string)[]>((acc, p, idx, arr) => {
      if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) {
        acc.push("...");
      }
      acc.push(p);
      return acc;
    }, []);

  return (
    <div
      className={`px-6 py-4 border-t border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-500 select-none ${className}`}
    >
      {/* Left: Range and optional page size dropdown */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
          Showing {startItem}–{endItem} of {totalItems} {itemLabel}
        </span>

        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
            <span>• Show</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-bold outline-none cursor-pointer focus:border-brand-accent/40 text-xs shadow-xs"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span>per page</span>
          </div>
        )}
      </div>

      {/* Right: Navigation controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-xs cursor-pointer flex items-center justify-center"
            title="Previous Page"
          >
            <ArrowLeft size={14} />
          </button>

          {pageNumbers.map((p, idx) =>
            typeof p === "string" ? (
              <span
                key={`dots-${idx}`}
                className="px-1.5 text-slate-400 text-xs font-bold"
              >
                ...
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  currentPage === p
                    ? "bg-brand-accent text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ),
          )}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-xs cursor-pointer flex items-center justify-center"
            title="Next Page"
          >
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
