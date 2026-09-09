"use client";

import {
  Check,
  Code,
  Copy,
  Download,
  Eye,
  FileCode,
  WrapText,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

interface ViewHtmlModalProps {
  title: string;
  htmlContent: string;
  jobCode?: string;
}

// Simple HTML Beautifier for readable source code view
function formatHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<hr[^>]*>/g, "<hr>\n")
    .replace(/<blockquote[^>]*>/g, "\n<blockquote>\n")
    .replace(/<\/blockquote>/g, "\n</blockquote>\n")
    .replace(/<p[^>]*>/g, "\n<p>")
    .replace(/<\/p>/g, "</p>\n")
    .replace(/<h([1-6])[^>]*>/g, "\n<h$1>")
    .replace(/<\/h([1-6])>/g, "</h$1>\n")
    .replace(/<ul[^>]*>/g, "\n<ul>\n")
    .replace(/<\/ul>/g, "\n</ul>\n")
    .replace(/<ol[^>]*>/g, "\n<ol>\n")
    .replace(/<\/ol>/g, "\n</ol>\n")
    .replace(/<li[^>]*>/g, "  <li>")
    .replace(/<\/li>/g, "</li>\n")
    .replace(/<table[^>]*>/g, "\n<table>\n")
    .replace(/<\/table>/g, "\n</table>\n")
    .replace(/<tr[^>]*>/g, "  <tr>\n")
    .replace(/<\/tr>/g, "  </tr>\n")
    .replace(/<td[^>]*>/g, "    <td>")
    .replace(/<\/td>/g, "</td>\n")
    .replace(/<th[^>]*>/g, "    <th>")
    .replace(/<\/th>/g, "</th>\n")
    .replace(/\n\s*\n/g, "\n")
    .trim();
}

export default function ViewHtmlModal({
  title,
  htmlContent,
  jobCode,
}: ViewHtmlModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFormatted, setIsFormatted] = useState(true);
  const [wrapLines, setWrapLines] = useState(true);

  const formattedCode = useMemo(() => formatHtml(htmlContent), [htmlContent]);
  const displayCode = isFormatted ? formattedCode : htmlContent;

  const charCount = htmlContent?.length || 0;
  const wordCount = htmlContent
    ? htmlContent.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length
    : 0;

  const handleCopy = () => {
    if (!htmlContent) return;
    navigator.clipboard.writeText(displayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!htmlContent) return;
    const blob = new Blob([displayCode], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const cleanFilename = (jobCode || title || "article")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    link.download = `${cleanFilename}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* 1. Main Action Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
        title="View and copy raw HTML source code"
      >
        <Code size={14} className="text-slate-500" />
        <span>View HTML</span>
      </button>

      {/* 2. Modal Dialog Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 select-text"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between gap-4 flex-wrap select-none">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center font-bold">
                  <FileCode size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Article HTML Source</span>
                    {jobCode && (
                      <span className="text-[10px] font-mono font-bold bg-slate-200/80 px-2 py-0.5 rounded text-slate-700">
                        {jobCode}
                      </span>
                    )}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    {wordCount} words • {charCount} characters
                  </p>
                </div>
              </div>

              {/* Header Controls */}
              <div className="flex items-center gap-2">
                {/* Format Toggle */}
                <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-[10px] font-bold text-slate-600">
                  <button
                    type="button"
                    onClick={() => setIsFormatted(true)}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      isFormatted ? "bg-white text-slate-900 shadow-3xs font-black" : "hover:text-slate-900"
                    }`}
                  >
                    Beautified
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFormatted(false)}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      !isFormatted ? "bg-white text-slate-900 shadow-3xs font-black" : "hover:text-slate-900"
                    }`}
                  >
                    Raw
                  </button>
                </div>

                {/* Wrap Toggle */}
                <button
                  type="button"
                  onClick={() => setWrapLines(!wrapLines)}
                  className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                    wrapLines
                      ? "bg-slate-100 border-slate-300 text-slate-800"
                      : "bg-white border-slate-200 text-slate-400 hover:text-slate-700"
                  }`}
                  title={wrapLines ? "Line wrapping enabled" : "Line wrapping disabled"}
                >
                  <WrapText size={14} />
                </button>

                {/* Primary Copy Button */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                    copied
                      ? "bg-emerald-600 text-white"
                      : "bg-brand-accent hover:bg-brand-navy text-white shadow-brand-accent/20"
                  }`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? "Copied!" : "Copy HTML"}</span>
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  title="Close dialog"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Code Body Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed">
              <pre
                className={`w-full font-mono outline-none selection:bg-brand-accent/40 selection:text-white ${
                  wrapLines ? "whitespace-pre-wrap break-words" : "whitespace-pre overflow-x-auto"
                }`}
              >
                <code>{displayCode || "<!-- No content available -->"}</code>
              </pre>
            </div>

            {/* Modal Footer Bar */}
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-4 text-xs select-none">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
                Ready to paste into external CMS, Markdown, or HTML editors
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-3xs"
                >
                  <Download size={12} />
                  <span>Download .html</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-1.5 text-slate-500 hover:text-slate-900 font-bold text-[10px] uppercase tracking-wider cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
