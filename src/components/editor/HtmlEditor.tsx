"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Check,
  Copy,
  Heading1,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo,
  Table,
  Trash2,
  Undo,
  Unlink,
} from "lucide-react";
import { useState } from "react";

// Simple HTML Beautifier for readable source code view
function formatHtml(html: string): string {
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
    .replace(/\n\s*\n/g, "\n") // Remove empty lines
    .trim();
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  const btnClass = (active: boolean) =>
    `p-2 rounded-lg transition-all cursor-pointer ${active ? "bg-brand-accent/10 text-brand-accent" : "text-slate-400 hover:bg-slate-50"}`;

  // ✨ UX Handler: Set or update hyper-link anchors
  const setHyperlink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt(
      "Enter destination URL matching campaign strategy:",
      previousUrl,
    );

    // If user cancelled the prompt action
    if (url === null) return;

    // If user cleared out the URL box, treat it as an explicit unlink action
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // Apply clean external URL tracking constraints
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url, target: "_blank" })
      .run();
  };

  return (
    <div className="flex flex-col border-b border-slate-100 bg-slate-50 select-none sticky top-0 z-10">
      {/* Main Formatting Row */}
      <div className="flex flex-wrap gap-1 p-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btnClass(editor.isActive("bold"))}
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btnClass(editor.isActive("italic"))}
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={btnClass(editor.isActive("heading", { level: 1 }))}
        >
          <Heading1 size={16} />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={btnClass(editor.isActive("heading", { level: 2 }))}
        >
          <Heading2 size={16} />
        </button>

        <div className="w-[1px] bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={btnClass(editor.isActive("bulletList"))}
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={btnClass(editor.isActive("orderedList"))}
        >
          <ListOrdered size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={btnClass(editor.isActive("blockquote"))}
        >
          <Quote size={16} />
        </button>

        <div className="w-[1px] bg-slate-200 mx-1" />

        {/* ✨ LINK ENGINE TOOLBAR BUTTONS */}
        <button
          type="button"
          onClick={setHyperlink}
          className={btnClass(editor.isActive("link"))}
          title="Insert Anchor Link"
        >
          <Link2 size={16} />
        </button>
        <button
          type="button"
          disabled={!editor.isActive("link")}
          onClick={() => editor.chain().focus().unsetLink().run()}
          className={`p-2 rounded-lg transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-slate-400 hover:bg-slate-50`}
          title="Remove Link"
        >
          <Unlink size={16} />
        </button>

        <div className="w-[1px] bg-slate-200 mx-1" />

        {/* Table Insert Button */}
        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          className={btnClass(editor.isActive("table"))}
          title="Insert 3x3 Table"
        >
          <Table size={16} />
        </button>

        <div className="w-[1px] bg-slate-200 mx-1 ml-auto" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className={btnClass(false)}
        >
          <Undo size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className={btnClass(false)}
        >
          <Redo size={16} />
        </button>
      </div>

      {/* Context-aware Table Editing Ribbon */}
      {editor.isActive("table") && (
        <div className="flex flex-wrap items-center gap-1.5 px-3 py-1.5 border-t border-slate-100 bg-slate-100/50 text-[10px] font-bold text-slate-500 animate-in slide-in-from-top-1 duration-200">
          <span className="uppercase tracking-wider text-slate-400 mr-1.5 select-none">
            Table Edit:
          </span>
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowBefore().run()}
            className="px-2 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer text-slate-700 transition-colors"
          >
            + Row Above
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="px-2 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer text-slate-700 transition-colors"
          >
            + Row Below
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="px-2 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer text-slate-700 transition-colors"
          >
            - Row
          </button>

          <div className="w-[1px] h-3.5 bg-slate-300 mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            className="px-2 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer text-slate-700 transition-colors"
          >
            + Col Left
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="px-2 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer text-slate-700 transition-colors"
          >
            + Col Right
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="px-2 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer text-slate-700 transition-colors"
          >
            - Col
          </button>

          <div className="w-[1px] h-3.5 bg-slate-300 mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().mergeOrSplit().run()}
            className="px-2 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer text-slate-700 transition-colors"
          >
            Merge/Split
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="ml-auto px-2 py-1 bg-brand-red/10 border border-brand-red/20 text-brand-red rounded-md hover:bg-brand-red/20 cursor-pointer transition-colors flex items-center gap-1"
            title="Delete entire table"
          >
            <Trash2 size={10} />
            Delete Table
          </button>
        </div>
      )}
    </div>
  );
};

export default function HtmlEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState(value);
  const [copied, setCopied] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing your story...",
      }),
      Link.configure({
        openOnClick: false, // Disables active click-routing during edit states
        autolink: true, // Automatically parses copy-pasted URLs into dynamic link elements
        HTMLAttributes: {
          class:
            "text-brand-accent font-bold underline transition-colors cursor-pointer hover:text-brand-navy",
        },
      }),
      TableKit.configure({
        table: {
          resizable: true,
          HTMLAttributes: {
            class:
              "border-collapse border border-slate-200 w-full my-4 table-fixed",
          },
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none focus:outline-none min-h-[400px] leading-relaxed [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 pt-1 pl-5 pr-5 pb-5",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setHtmlContent(formatHtml(html));
      onChange(html);
    },
  });

  const handleCopyHtml = async () => {
    try {
      const rawHtml = editor ? editor.getHTML() : htmlContent;
      await navigator.clipboard.writeText(rawHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy html code:", err);
    }
  };

  return (
    <div className="border border-slate-200 overflow-hidden bg-white shadow-sm focus-within:border-brand-accent/30 transition-all rounded-xl flex flex-col">
      {/* Header Tabs */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50/50 select-none">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              if (isHtmlMode) {
                editor?.commands.setContent(htmlContent);
                setIsHtmlMode(false);
              }
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              !isHtmlMode
                ? "bg-white text-slate-800 border border-slate-200/50 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Visual Editor
          </button>
          <button
            type="button"
            onClick={() => {
              if (!isHtmlMode && editor) {
                setHtmlContent(formatHtml(editor.getHTML()));
                setIsHtmlMode(true);
              }
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              isHtmlMode
                ? "bg-white text-slate-800 border border-slate-200/50 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            HTML Source
          </button>
        </div>

        <button
          type="button"
          onClick={handleCopyHtml}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-2xs hover:bg-slate-50 cursor-pointer active:scale-95 transition-all"
        >
          {copied ? (
            <>
              <Check
                size={14}
                className="text-emerald-500 animate-in fade-in zoom-in duration-200"
              />
              <span className="text-emerald-600">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy HTML</span>
            </>
          )}
        </button>
      </div>

      {/* Visual Editor Workspace */}
      {!isHtmlMode && (
        <div className="flex flex-col h-[500px]">
          <MenuBar editor={editor} />
          <div className="overflow-y-auto flex-1 bg-white">
            <EditorContent editor={editor} />
          </div>
        </div>
      )}

      {/* HTML Source Code Workspace */}
      {isHtmlMode && (
        <div className="h-[500px] flex flex-col">
          <textarea
            value={htmlContent}
            onChange={(e) => {
              setHtmlContent(e.target.value);
              onChange(e.target.value);
            }}
            className="w-full flex-1 p-5 font-mono text-xs text-slate-800 bg-slate-50 focus:bg-white resize-none outline-none overflow-y-auto leading-relaxed"
            placeholder="<!-- Write or paste raw HTML here -->"
          />
        </div>
      )}
    </div>
  );
}
