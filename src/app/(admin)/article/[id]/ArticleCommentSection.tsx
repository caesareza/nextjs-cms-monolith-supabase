"use client";

import {
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  MessageSquarePlus,
} from "lucide-react";
import { useState } from "react";
import { ArticleComment } from "@/types/article";
import ArticleCommentDrawer from "./ArticleCommentDrawer";
import ArticleContentWithComments from "./ArticleContentWithComments";

interface ArticleCommentSectionProps {
  articleId: number;
  content: string;
  initialComments: ArticleComment[];
}

export default function ArticleCommentSection({
  articleId,
  content,
  initialComments = [],
}: ArticleCommentSectionProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [comments, setComments] = useState<ArticleComment[]>(initialComments);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(
    null,
  );
  const [selectedBlockText, setSelectedBlockText] = useState<
    string | undefined
  >(undefined);

  const unresolvedCount = comments.filter((c) => !c.is_resolved).length;
  const totalCount = comments.length;

  const handleSelectBlock = (index: number | null, textSnippet?: string) => {
    setSelectedBlockIndex(index);
    setSelectedBlockText(textSnippet);
  };

  const handleClearSelectedBlock = () => {
    setSelectedBlockIndex(null);
    setSelectedBlockText(undefined);
  };

  return (
    <>
      {/* Editorial Feedback Sticky / Quick Bar */}
      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl mb-4 text-xs select-none">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-brand-accent/10 text-brand-accent flex items-center justify-center font-bold">
            <MessageSquare size={13} />
          </div>
          <span className="font-bold text-slate-700">
            Editorial Review & Feedback
          </span>
          {unresolvedCount > 0 ? (
            <span className="px-2 py-0.5 bg-brand-accent text-white text-[9px] font-black uppercase tracking-wider rounded-full shadow-2xs">
              {unresolvedCount} Action Required
            </span>
          ) : totalCount > 0 ? (
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black uppercase tracking-wider rounded-full flex items-center gap-1">
              <CheckCircle2 size={10} /> All Resolved
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 font-medium">
              No comments yet
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shadow-3xs hover:border-slate-300 cursor-pointer"
        >
          <span>Open Review Drawer ({totalCount})</span>
          <ChevronRight size={12} className="text-slate-400" />
        </button>
      </div>

      {/* Main Content Body Canvas with Interactive Paragraph Pins */}
      <ArticleContentWithComments
        content={content}
        comments={comments}
        selectedBlockIndex={selectedBlockIndex}
        onSelectBlock={handleSelectBlock}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />

      {/* Slide-over Review Drawer */}
      <ArticleCommentDrawer
        articleId={articleId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        comments={comments}
        onCommentsChange={setComments}
        selectedBlockIndex={selectedBlockIndex}
        selectedBlockText={selectedBlockText}
        onClearSelectedBlock={handleClearSelectedBlock}
        onSelectBlock={(index) => {
          setSelectedBlockIndex(index);
          const el = document.getElementById(`article-block-${index}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }}
      />
    </>
  );
}
