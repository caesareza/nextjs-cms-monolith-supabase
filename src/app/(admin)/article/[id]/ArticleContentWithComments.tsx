"use client";

import { MessageSquare, MessageSquarePlus, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ArticleComment } from "@/types/article";

interface ArticleContentProps {
  content: string;
  comments: ArticleComment[];
  selectedBlockIndex: number | null;
  onSelectBlock: (index: number | null, textSnippet?: string) => void;
  onOpenDrawer: () => void;
}

interface BlockItem {
  index: number;
  html: string;
  text: string;
}

/**
 * Splits HTML content into top-level semantic blocks
 * (<p>, <h2>, <h3>, <h4>, <blockquote>, <ul>, <ol>, <table>, etc.)
 */
function parseHtmlToBlocks(html: string): BlockItem[] {
  if (!html) return [];

  // Match top-level HTML tags
  const blockRegex =
    /<(p|h1|h2|h3|h4|h5|h6|blockquote|ul|ol|table|div|figure)[^>]*>[\s\S]*?<\/\1>|<hr\s*\/?>/gi;
  const matches = html.match(blockRegex);

  if (!matches || matches.length === 0) {
    // Fallback if no wrapping tags found
    return [
      {
        index: 0,
        html,
        text: html.replace(/<[^>]*>/g, "").trim(),
      },
    ];
  }

  return matches.map((blockHtml, index) => {
    const text = blockHtml.replace(/<[^>]*>/g, "").trim();
    return {
      index,
      html: blockHtml,
      text: text.slice(0, 120),
    };
  });
}

export default function ArticleContentWithComments({
  content,
  comments,
  selectedBlockIndex,
  onSelectBlock,
  onOpenDrawer,
}: ArticleContentProps) {
  const blocks = useMemo(() => parseHtmlToBlocks(content), [content]);

  // Group comments by block_index
  const commentsByBlock = useMemo(() => {
    const map = new Map<number, { total: number; unresolved: number }>();
    comments.forEach((c) => {
      if (c.block_index !== null && c.block_index !== undefined) {
        const current = map.get(c.block_index) || { total: 0, unresolved: 0 };
        current.total += 1;
        if (!c.is_resolved) {
          current.unresolved += 1;
        }
        map.set(c.block_index, current);
      }
    });
    return map;
  }, [comments]);

  // Scroll into view when selectedBlockIndex changes
  useEffect(() => {
    if (selectedBlockIndex !== null) {
      const el = document.getElementById(`article-block-${selectedBlockIndex}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [selectedBlockIndex]);

  return (
    <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-headings:text-slate-900 space-y-4">
      {blocks.map((block) => {
        const stats = commentsByBlock.get(block.index);
        const hasComments = !!stats && stats.total > 0;
        const hasUnresolved = !!stats && stats.unresolved > 0;
        const isSelected = selectedBlockIndex === block.index;

        return (
          <div
            key={block.index}
            id={`article-block-${block.index}`}
            className={`group relative rounded-xl transition-all duration-200 ${
              isSelected
                ? "bg-amber-50/80 ring-2 ring-amber-400/80 p-3 -m-3 shadow-xs"
                : hasUnresolved
                  ? "bg-brand-accent/5 hover:bg-slate-50/80 p-2.5 -m-2.5 border-l-4 border-brand-accent"
                  : hasComments
                    ? "bg-slate-50/40 hover:bg-slate-50/80 p-2.5 -m-2.5 border-l-4 border-slate-300"
                    : "hover:bg-slate-50/60 p-2 -m-2"
            }`}
          >
            {/* Action Trigger Buttons for Paragraph Commenting */}
            <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center gap-1.5 not-prose">
              <button
                type="button"
                onClick={() => {
                  onSelectBlock(block.index, block.text);
                  onOpenDrawer();
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer ${
                  isSelected
                    ? "bg-amber-500 text-white shadow-amber-500/30 ring-2 ring-amber-200"
                    : "bg-white text-slate-700 hover:text-brand-accent hover:bg-slate-50 border border-slate-200"
                }`}
                title="Add inline feedback to this paragraph"
              >
                <MessageSquarePlus size={13} className="text-brand-accent" />
                <span>Comment</span>
              </button>
            </div>

            {/* Persistent Pin / Count Badge if comments already exist */}
            {hasComments && (
              <div className="absolute -left-3 top-2.5 z-10 not-prose">
                <button
                  type="button"
                  onClick={() => {
                    onSelectBlock(block.index, block.text);
                    onOpenDrawer();
                  }}
                  className={`flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black shadow-sm transition-transform hover:scale-110 cursor-pointer ${
                    hasUnresolved
                      ? "bg-brand-accent text-white ring-2 ring-white animate-pulse"
                      : "bg-slate-200 text-slate-600 ring-2 ring-white"
                  }`}
                  title={`${stats.total} comment(s) on this paragraph (${stats.unresolved} unresolved)`}
                >
                  <MessageSquare size={11} />
                  <span>{stats.total}</span>
                </button>
              </div>
            )}

            {/* Render block HTML */}
            <div
              dangerouslySetInnerHTML={{ __html: block.html }}
              className="cursor-pointer"
              onClick={() => {
                if (hasComments) {
                  onSelectBlock(block.index, block.text);
                  onOpenDrawer();
                }
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
