'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {Bold, Heading1, Heading2, Italic, List, ListOrdered, Quote, Redo, Undo} from "lucide-react";

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    const btnClass = (active: boolean) =>
        `p-2 rounded-lg transition-all ${active ? 'bg-red-50 text-[#EE1C25]' : 'text-slate-400 hover:bg-slate-50'}`;

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))}><Bold size={16} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))}><Italic size={16} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor.isActive('heading', { level: 1 }))}><Heading1 size={16} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive('heading', { level: 2 }))}><Heading2 size={16} /></button>
            <div className="w-[1px] bg-slate-200 mx-1" />
            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))}><List size={16} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))}><ListOrdered size={16} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive('blockquote'))}><Quote size={16} /></button>
            <div className="w-[1px] bg-slate-200 mx-1 ml-auto" />
            <button type="button" onClick={() => editor.chain().focus().undo().run()} className={btnClass(false)}><Undo size={16} /></button>
            <button type="button" onClick={() => editor.chain().focus().redo().run()} className={btnClass(false)}><Redo size={16} /></button>
        </div>
    );
};

export default function HtmlEditor({ value, onChange }: { value: string, onChange: (val: string) => void }) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Start writing your story...',
            }),
        ],
        content: value, // This is the initial HTML string from Supabase
        editorProps: {
            attributes: {
                // Tailwind Typography (prose) makes the HTML look professional
                class: 'prose prose-slate max-w-none focus:outline-none min-h-[400px] p-8 leading-relaxed',
            },
        },
        onUpdate: ({ editor }) => {
            // Send the clean HTML back to the form state
            onChange(editor.getHTML());
        },
    });

    return (
        <div className="border border-slate-200 rounded-[2rem] overflow-hidden bg-white shadow-sm focus-within:border-[#EE1C25]/30 transition-all">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}