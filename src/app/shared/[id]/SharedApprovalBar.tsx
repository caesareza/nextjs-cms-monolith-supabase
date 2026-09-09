"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  Loader2,
  ShieldCheck,
  X,
  Send,
  Clock,
  Sparkles,
  UserCheck,
  ArrowRight,
} from "lucide-react";
import { ArticleService } from "@/app/(admin)/article/service";

interface SharedApprovalBarProps {
  shareToken: string;
  initialStatus: string;
  approverName?: string | null;
  approverEmail?: string | null;
  approvedAt?: string | null;
  approvalNotes?: string | null;
  articleTitle: string;
}

export default function SharedApprovalBar({
  shareToken,
  initialStatus,
  approverName,
  approverEmail,
  approvedAt,
  approvalNotes,
  articleTitle,
}: SharedApprovalBarProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [currentApproverName, setCurrentApproverName] = useState(approverName);
  const [currentApproverEmail, setCurrentApproverEmail] = useState(approverEmail);
  const [currentApprovedAt, setCurrentApprovedAt] = useState(approvedAt);
  const [currentApprovalNotes, setCurrentApprovalNotes] = useState(approvalNotes);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"approve" | "revision">("approve");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const openActionModal = (action: "approve" | "revision") => {
    setModalAction(action);
    setValidationError(null);
    setNotes("");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedNotes = notes.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setValidationError("Please enter your full name (minimum 2 characters).");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setValidationError("Please enter a valid corporate work email address.");
      return;
    }

    if (modalAction === "revision" && (!trimmedNotes || trimmedNotes.length < 5)) {
      setValidationError(
        "Please provide feedback remarks for the writer (minimum 5 characters).",
      );
      return;
    }

    setSubmitting(true);
    try {
      await ArticleService.submitExternalShareReview({
        token: shareToken,
        action: modalAction,
        approverName: trimmedName,
        approverEmail: trimmedEmail,
        notes: trimmedNotes || undefined,
      });

      if (modalAction === "approve") {
        setStatus("approved");
        setCurrentApproverName(trimmedName);
        setCurrentApproverEmail(trimmedEmail);
        setCurrentApprovedAt(new Date().toISOString());
        setCurrentApprovalNotes(trimmedNotes || null);
        setSuccessMessage("Content draft successfully approved!");
      } else {
        setStatus("writing");
        setCurrentApprovalNotes(trimmedNotes || null);
        setSuccessMessage("Revision request sent to the editorial team.");
      }

      setModalOpen(false);
      router.refresh();
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err: any) {
      console.error("External review submission error:", err);
      setValidationError(
        err?.message || "Failed to record review decision. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isApproved = status === "approved" || status === "published";

  const formattedApprovalDate = currentApprovedAt
    ? new Date(currentApprovedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <>
      {/* Toast Feedback Notification */}
      {successMessage && (
        <div className="fixed top-24 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-emerald-500 font-bold text-xs">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* STICKY STAKEHOLDER REVIEW ACTION BAR */}
      <div className="w-full bg-slate-900 border-b border-slate-800 text-white select-none transition-all sticky top-29 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left Context Info */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isApproved
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-brand-accent/20 text-brand-accent border border-brand-accent/30"
              }`}
            >
              {isApproved ? <ShieldCheck size={18} /> : <UserCheck size={18} />}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Stakeholder Review Portal
                </span>
                <span
                  className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    isApproved
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {isApproved ? "Approved" : "Pending Review"}
                </span>
              </div>

              {isApproved ? (
                <p className="text-xs font-bold text-slate-200">
                  Approved by{" "}
                  <span className="text-emerald-400 font-black">
                    {currentApproverName || "Reviewer"}
                  </span>{" "}
                  {currentApproverEmail && (
                    <span className="text-slate-400 font-medium">
                      ({currentApproverEmail})
                    </span>
                  )}
                  {formattedApprovalDate && (
                    <span className="text-slate-500 text-[11px] ml-1">
                      • {formattedApprovalDate}
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-xs font-bold text-slate-300">
                  Product & Martech Review Required — Please review and sign off.
                </p>
              )}
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            {isApproved ? (
              <div className="flex items-center gap-3">
                {currentApprovalNotes && (
                  <div
                    title={currentApprovalNotes}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-[11px] text-slate-300 max-w-xs truncate"
                  >
                    <span className="font-bold text-slate-400 shrink-0">Note:</span>
                    <span className="truncate italic">{currentApprovalNotes}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => openActionModal("revision")}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Request Changes
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openActionModal("revision")}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  <MessageSquare size={14} className="text-amber-400" />
                  <span>Request Revisions</span>
                </button>

                <button
                  type="button"
                  onClick={() => openActionModal("approve")}
                  className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-900/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <CheckCircle2 size={14} />
                  <span>Approve Content</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DIALOG FOR STAKEHOLDER SIGN-OFF */}
      {modalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-7 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    modalAction === "approve"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : "bg-amber-50 text-amber-600 border border-amber-100"
                  }`}
                >
                  {modalAction === "approve" ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <MessageSquare size={20} />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    {modalAction === "approve"
                      ? "Approve Content Draft"
                      : "Request Editorial Revisions"}
                  </h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                    Stakeholder Sign-Off Verification
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body & Form */}
            <form onSubmit={handleSubmit} className="p-7 space-y-5">
              {/* Article Preview Reference Box */}
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                <span className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">
                  Article Under Review
                </span>
                <p className="text-xs font-bold text-slate-800 line-clamp-1">
                  {articleTitle}
                </p>
              </div>

              {/* Validation Alert */}
              {validationError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-start gap-2.5">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Reviewer Name */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Budi Santoso"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all"
                />
              </div>

              {/* Reviewer Work Email */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  Corporate Work Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g., budi.santoso@ocbc.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all"
                />
              </div>

              {/* Reviewer Remarks */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    Remarks & Feedback{" "}
                    {modalAction === "revision" ? (
                      <span className="text-rose-500">*</span>
                    ) : (
                      <span className="text-slate-400 font-normal">(Optional)</span>
                    )}
                  </label>
                </div>
                <textarea
                  rows={3}
                  placeholder={
                    modalAction === "approve"
                      ? "e.g., Content is verified, accurate, and ready for launch."
                      : "e.g., Please clarify Section 2 regarding eligibility requirements..."
                  }
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-3 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    modalAction === "approve"
                      ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
                      : "bg-slate-900 hover:bg-slate-800 shadow-slate-900/20"
                  }`}
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : modalAction === "approve" ? (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Confirm Approval</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Submit Revision Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
