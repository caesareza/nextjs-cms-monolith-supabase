"use client";

import { useState } from "react";
import { Link2, ExternalLink, RefreshCw, Loader2 } from "lucide-react";
import { ArticleService } from "@/app/(admin)/article/service";

interface ShareConsoleProps {
  articleId: number;
  initialShareToken: string;
  initialShareActive: boolean;
}

export default function ShareConsole({
  articleId,
  initialShareToken,
  initialShareActive,
}: ShareConsoleProps) {
  const [copied, setCopied] = useState(false);
  const [shareToken, setShareToken] = useState(initialShareToken);
  const [shareActive, setShareActive] = useState(initialShareActive);
  const [updating, setUpdating] = useState(false);

  const handleCopyShareLink = () => {
    if (!shareActive || !shareToken) return;
    const shareUrl = `${window.location.origin}/shared/${shareToken}`;

    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleActive = async () => {
    setUpdating(true);
    try {
      const nextActive = !shareActive;
      const updated = await ArticleService.toggleShareActive(
        articleId,
        nextActive,
      );
      setShareActive(updated);
    } catch (err) {
      console.error("Failed to toggle share settings:", err);
      alert("Workflow transaction fault: share status update failed.");
    } finally {
      setUpdating(false);
    }
  };

  const handleRegenerate = async () => {
    if (
      !confirm(
        "Are you sure you want to regenerate the share token? The current preview link will immediately stop working.",
      )
    ) {
      return;
    }
    setUpdating(true);
    try {
      const newToken = await ArticleService.regenerateShareToken(articleId);
      setShareToken(newToken);
      alert("New secure link generated successfully!");
    } catch (err) {
      console.error("Failed to regenerate token:", err);
      alert("Workflow transaction fault: token regeneration failed.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2 select-none">
      {/* 1. Toggle Share Active status */}
      <button
        type="button"
        onClick={handleToggleActive}
        disabled={updating}
        className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
          shareActive
            ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/50"
            : "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100/50"
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${shareActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
        />
        {shareActive ? "Preview Enabled" : "Preview Paused"}
      </button>

      {/* 2. Copy Link Copier */}
      <button
        type="button"
        onClick={handleCopyShareLink}
        disabled={!shareActive || updating}
        className={`px-4 py-2.5 text-xs font-bold rounded-2xl border transition-all flex items-center gap-1.5 justify-center min-w-[120px] ${
          !shareActive
            ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
            : copied
              ? "bg-emerald-50 border-emerald-200 text-emerald-600"
              : "bg-slate-900 border-slate-950 text-white hover:bg-slate-800 hover:shadow-sm"
        }`}
      >
        {copied ? (
          "Copied!"
        ) : (
          <>
            <Link2 size={13} /> Copy Link
          </>
        )}
      </button>

      {/* 3. Open Preview */}
      {shareActive && shareToken && (
        <a
          href={`/shared/${shareToken}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-2xl bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-50 transition-all flex items-center justify-center cursor-pointer shrink-0"
          title="Open public preview page"
        >
          <ExternalLink size={14} className="text-slate-500" />
        </a>
      )}

      {/* 4. Regenerate Token Option */}
      <button
        type="button"
        onClick={handleRegenerate}
        disabled={updating}
        title="Regenerate secure token to invalidate old links"
        className="w-10 h-10 rounded-2xl bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-50 transition-all flex items-center justify-center cursor-pointer shrink-0 disabled:opacity-50"
      >
        {updating ? (
          <Loader2 size={14} className="animate-spin text-slate-400" />
        ) : (
          <RefreshCw size={14} className="text-slate-500" />
        )}
      </button>
    </div>
  );
}
