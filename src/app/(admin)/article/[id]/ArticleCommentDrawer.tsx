"use client";

import {
  Check,
  CheckCircle2,
  ChevronDown,
  CornerDownRight,
  Filter,
  Loader2,
  MessageSquare,
  MessageSquarePlus,
  MoreVertical,
  Pin,
  Send,
  Trash2,
  User,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ArticleComment } from "@/types/article";
import { createClient } from "@/utils/supabase/client";
import { ArticleService } from "../service";

interface CommentDrawerProps {
  articleId: number;
  isOpen: boolean;
  onClose: () => void;
  comments: ArticleComment[];
  onCommentsChange: (updated: ArticleComment[]) => void;
  selectedBlockIndex: number | null;
  selectedBlockText?: string;
  onClearSelectedBlock: () => void;
  onSelectBlock: (index: number | null) => void;
}

type FilterTab = "all" | "open" | "resolved" | "general";

export default function ArticleCommentDrawer({
  articleId,
  isOpen,
  onClose,
  comments,
  onCommentsChange,
  selectedBlockIndex,
  selectedBlockText,
  onClearSelectedBlock,
  onSelectBlock,
}: CommentDrawerProps) {
  const [currentUserEmail, setCurrentUserEmail] = useState<string>(
    "editor@storyteller.id",
  );
  const [filter, setFilter] = useState<FilterTab>("all");
  const [newCommentContent, setNewCommentContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.email) {
          setCurrentUserEmail(user.email);
        }
      } catch (err) {
        console.warn("Failed to get current user for comments:", err);
      }
    };
    fetchUser();
  }, []);

  // Filtered comments
  const filteredComments = useMemo(() => {
    let list = [...comments];

    // If a specific paragraph is actively selected, prioritize showing that paragraph's comments
    if (selectedBlockIndex !== null) {
      list = list.filter((c) => c.block_index === selectedBlockIndex);
    }

    if (filter === "open") {
      list = list.filter((c) => !c.is_resolved);
    } else if (filter === "resolved") {
      list = list.filter((c) => c.is_resolved);
    } else if (filter === "general") {
      list = list.filter(
        (c) => c.block_index === null || c.block_index === undefined,
      );
    }

    return list;
  }, [comments, filter, selectedBlockIndex]);

  // Total counts for badges
  const counts = useMemo(() => {
    const total = comments.length;
    const open = comments.filter((c) => !c.is_resolved).length;
    const resolved = comments.filter((c) => c.is_resolved).length;
    const general = comments.filter(
      (c) => c.block_index === null || c.block_index === undefined,
    ).length;
    return { total, open, resolved, general };
  }, [comments]);

  // Create new comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const created = await ArticleService.createArticleComment({
        article_id: articleId,
        block_index: selectedBlockIndex,
        selected_text: selectedBlockText || null,
        content: newCommentContent.trim(),
        user_email: currentUserEmail,
      });

      onCommentsChange([...comments, created]);
      setNewCommentContent("");
    } catch (err) {
      console.error("Failed to post comment:", err);
      alert(
        "Failed to submit comment. Please ensure the database table is configured.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reply to existing comment
  const handleAddReply = async (parentId: number) => {
    if (!replyContent.trim() || isSubmittingReply) return;

    setIsSubmittingReply(true);
    try {
      const reply = await ArticleService.replyArticleComment({
        article_id: articleId,
        parent_id: parentId,
        content: replyContent.trim(),
        user_email: currentUserEmail,
      });

      // Update local state by appending reply to parent
      const updated = comments.map((c) => {
        if (c.id === parentId) {
          return {
            ...c,
            replies: [...(c.replies || []), reply],
          };
        }
        return c;
      });

      onCommentsChange(updated);
      setReplyContent("");
      setReplyingToId(null);
    } catch (err) {
      console.error("Failed to post reply:", err);
      alert("Failed to submit reply. Please try again.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Toggle resolve status
  const handleToggleResolve = async (comment: ArticleComment) => {
    setActionLoadingId(comment.id);
    const nextResolvedState = !comment.is_resolved;

    try {
      const updatedItem = await ArticleService.toggleResolveComment(
        comment.id,
        nextResolvedState,
        currentUserEmail,
      );

      const updated = comments.map((c) =>
        c.id === comment.id
          ? {
              ...c,
              is_resolved: updatedItem.is_resolved,
              resolved_by: updatedItem.resolved_by,
              resolved_at: updatedItem.resolved_at,
            }
          : c,
      );

      onCommentsChange(updated);
    } catch (err) {
      console.error("Failed to toggle resolve status:", err);
      alert("Failed to update status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    setActionLoadingId(commentId);
    try {
      await ArticleService.deleteArticleComment(commentId);
      const updated = comments.filter((c) => c.id !== commentId);
      onCommentsChange(updated);
    } catch (err) {
      console.error("Failed to delete comment:", err);
      alert("Failed to delete comment.");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <aside
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 select-text"
      aria-label="Editorial Review Drawer"
    >
      {/* 1. Header Bar */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center font-bold">
            <MessageSquare size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Editorial Comments
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
              {counts.open} open • {counts.resolved} resolved
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          title="Close review drawer"
        >
          <X size={18} />
        </button>
      </div>

      {/* 2. Active Block Selection Banner */}
      {selectedBlockIndex !== null && (
        <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-3 flex items-center justify-between text-xs text-amber-900 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 truncate pr-2">
            <Pin size={13} className="text-amber-600 shrink-0" />
            <div className="truncate">
              <span className="font-black text-[10px] uppercase tracking-wider block text-amber-700">
                Paragraph #{selectedBlockIndex + 1}
              </span>
              <span className="text-[11px] text-amber-900/80 italic truncate block">
                "{selectedBlockText || `Paragraph ${selectedBlockIndex + 1}`}"
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClearSelectedBlock}
            className="text-[9px] font-black uppercase tracking-wider px-2 py-1 bg-white border border-amber-300 rounded-md hover:bg-amber-100 text-amber-800 shrink-0 transition-colors cursor-pointer"
          >
            Show All
          </button>
        </div>
      )}

      {/* 3. Filter Navigation Tabs */}
      <div className="px-5 pt-3 pb-2 border-b border-slate-100 flex items-center gap-1 overflow-x-auto text-[10px] font-black uppercase tracking-wider">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            filter === "all"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          All ({counts.total})
        </button>
        <button
          type="button"
          onClick={() => setFilter("open")}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            filter === "open"
              ? "bg-brand-accent text-white shadow-xs"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          Open ({counts.open})
        </button>
        <button
          type="button"
          onClick={() => setFilter("resolved")}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            filter === "resolved"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          Resolved ({counts.resolved})
        </button>
        <button
          type="button"
          onClick={() => setFilter("general")}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            filter === "general"
              ? "bg-slate-700 text-white shadow-xs"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          General ({counts.general})
        </button>
      </div>

      {/* 4. Comments Feed Container */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30">
        {filteredComments.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
            <MessageSquarePlus size={28} className="text-slate-300" />
            <p className="text-xs font-bold text-slate-600">
              No comments in this view
            </p>
            <p className="text-[10px] text-slate-400 max-w-[200px]">
              {selectedBlockIndex !== null
                ? `Be the first to leave feedback on Paragraph #${selectedBlockIndex + 1}`
                : "Leave general editorial notes or click any paragraph in the article."}
            </p>
          </div>
        ) : (
          filteredComments.map((comment) => {
            const isResolved = comment.is_resolved;
            const hasReplies = comment.replies && comment.replies.length > 0;
            const isReplying = replyingToId === comment.id;
            const isLoading = actionLoadingId === comment.id;

            return (
              <div
                key={comment.id}
                className={`bg-white rounded-2xl border p-4 shadow-xs transition-all space-y-3 ${
                  isResolved
                    ? "border-slate-200/70 opacity-80"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                {/* Comment Header: Author & Timestamp */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-800 text-white text-[10px] font-black flex items-center justify-center uppercase shrink-0">
                      {(comment.user_name || comment.user_email || "U").charAt(
                        0,
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 block leading-tight">
                        {comment.user_name || comment.user_email.split("@")[0]}
                      </span>
                      <span className="text-[9px] font-medium text-slate-400">
                        {new Date(comment.created_at).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Paragraph Badge or General Tag */}
                  {comment.block_index !== null &&
                  comment.block_index !== undefined ? (
                    <button
                      type="button"
                      onClick={() => onSelectBlock(comment.block_index)}
                      className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[9px] font-black uppercase tracking-wider hover:bg-amber-100 transition-colors cursor-pointer"
                      title="Scroll to paragraph"
                    >
                      ¶ Para #{comment.block_index + 1}
                    </button>
                  ) : (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-md text-[9px] font-black uppercase tracking-wider">
                      General
                    </span>
                  )}
                </div>

                {/* Selected Quote Snippet (if paragraph comment) */}
                {comment.selected_text && (
                  <div className="px-3 py-1.5 bg-slate-50 border-l-2 border-amber-400 rounded-r-lg text-[11px] text-slate-600 italic line-clamp-2">
                    "{comment.selected_text}"
                  </div>
                )}

                {/* Comment Body */}
                <p className="text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
                  {comment.content}
                </p>

                {/* Resolved Info Stamp */}
                {isResolved && (
                  <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                    <CheckCircle2 size={12} />
                    <span>
                      Resolved by{" "}
                      {comment.resolved_by?.split("@")[0] || "editor"}
                    </span>
                  </div>
                )}

                {/* Footer Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                  <div className="flex items-center gap-3">
                    {/* Reply Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setReplyingToId(isReplying ? null : comment.id)
                      }
                      className="text-slate-500 hover:text-brand-accent flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <CornerDownRight size={12} />
                      <span>{isReplying ? "Cancel" : "Reply"}</span>
                    </button>

                    {/* Resolve / Reopen Button */}
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleToggleResolve(comment)}
                      className={`flex items-center gap-1 transition-colors cursor-pointer ${
                        isResolved
                          ? "text-slate-400 hover:text-slate-700"
                          : "text-emerald-600 hover:text-emerald-700 font-bold"
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : isResolved ? (
                        <span>Reopen</span>
                      ) : (
                        <>
                          <Check size={12} />
                          <span>Resolve</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-slate-300 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                    title="Delete comment"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* Nested Replies List */}
                {hasReplies && (
                  <div className="pt-2 pl-3 border-l-2 border-slate-100 space-y-2.5">
                    {comment.replies!.map((reply) => (
                      <div
                        key={reply.id}
                        className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 text-[11px]">
                            {reply.user_name || reply.user_email.split("@")[0]}
                          </span>
                          <span className="text-[8px] text-slate-400">
                            {new Date(reply.created_at).toLocaleTimeString(
                              "en-GB",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </span>
                        </div>
                        <p className="text-slate-700 text-[11px] leading-relaxed font-medium">
                          {reply.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline Reply Input Box */}
                {isReplying && (
                  <div className="pt-2 space-y-2 animate-in fade-in duration-150">
                    <textarea
                      rows={2}
                      autoFocus
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={`Reply to ${comment.user_name || "comment"}...`}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-brand-accent/30 focus:ring-2 focus:ring-brand-accent/10 transition-all resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingToId(null);
                          setReplyContent("");
                        }}
                        className="px-3 py-1 text-[10px] font-black uppercase text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!replyContent.trim() || isSubmittingReply}
                        onClick={() => handleAddReply(comment.id)}
                        className="px-3 py-1 bg-brand-accent hover:bg-brand-navy text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-all cursor-pointer"
                      >
                        {isSubmittingReply && (
                          <Loader2 size={11} className="animate-spin" />
                        )}
                        Send Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 5. Compose Comment Box (Bottom Sticky) */}
      <form
        onSubmit={handleAddComment}
        className="p-4 border-t border-slate-200 bg-white space-y-2.5"
      >
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
          <span>
            {selectedBlockIndex !== null
              ? `Feedback for Paragraph #${selectedBlockIndex + 1}`
              : "General Article Feedback"}
          </span>
          {selectedBlockIndex !== null && (
            <button
              type="button"
              onClick={onClearSelectedBlock}
              className="text-brand-accent hover:underline cursor-pointer"
            >
              Switch to General
            </button>
          )}
        </div>

        <div className="relative">
          <textarea
            rows={3}
            value={newCommentContent}
            onChange={(e) => setNewCommentContent(e.target.value)}
            placeholder={
              selectedBlockIndex !== null
                ? `Write inline note for paragraph #${selectedBlockIndex + 1}...`
                : "Add general feedback, editorial review note, or task for the writer..."
            }
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-brand-accent/30 focus:ring-4 focus:ring-brand-accent/10 transition-all resize-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-slate-400 truncate max-w-[200px]">
            Posting as:{" "}
            <strong className="text-slate-700">
              {currentUserEmail.split("@")[0]}
            </strong>
          </span>

          <button
            type="submit"
            disabled={!newCommentContent.trim() || isSubmitting}
            className="px-5 py-2 bg-brand-accent hover:bg-brand-navy text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md shadow-brand-accent/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Send size={13} />
            )}
            <span>Post Comment</span>
          </button>
        </div>
      </form>
    </aside>
  );
}
