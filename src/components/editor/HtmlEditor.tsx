'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link'; // ✨ Injected TipTap Link Extension
import { Bold, Heading1, Heading2, Italic, List, ListOrdered, Quote, Redo, Undo, Link2, Unlink } from "lucide-react";

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    const btnClass = (active: boolean) =>
        `p-2 rounded-lg transition-all cursor-pointer ${active ? 'bg-red-50 text-[#EE1C25]' : 'text-slate-400 hover:bg-slate-50'}`;

    // ✨ UX Handler: Set or update hyper-link anchors
    const setHyperlink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('Enter destination URL matching campaign strategy:', previousUrl);

        // If user cancelled the prompt action
        if (url === null) return;

        // If user cleared out the URL box, treat it as an explicit unlink action
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        // Apply clean external URL tracking constraints
        editor.chain().focus().extendMarkRange('link').setLink({ href: url, target: '_blank' }).run();
    };

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl select-none">
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))}><Bold size={16} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))}><Italic size={16} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor.isActive('heading', { level: 1 }))}><Heading1 size={16} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive('heading', { level: 2 }))}><Heading2 size={16} /></button>

            <div className="w-[1px] bg-slate-200 mx-1" />

            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))}><List size={16} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))}><ListOrdered size={16} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive('blockquote'))}><Quote size={16} /></button>

            <div className="w-[1px] bg-slate-200 mx-1" />

            {/* ✨ NEW UX ACTIONS: LINK ENGINE TOOLBAR BUTTONS */}
            <button
                type="button"
                onClick={setHyperlink}
                className={btnClass(editor.isActive('link'))}
                title="Insert Anchor Link"
            >
                <Link2 size={16} />
            </button>
            <button
                type="button"
                disabled={!editor.isActive('link')}
                onClick={() => editor.chain().focus().unsetLink().run()}
                className={`p-2 rounded-lg transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-slate-400 hover:bg-slate-50`}
                title="Remove Link"
            >
                <Unlink size={16} />
            </button>

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
            // ✨ Link schema configuration logic integration
            Link.configure({
                openOnClick: false, // Disables active click-routing during edit states
                autolink: true,     // Automatically parses copy-pasted URLs into dynamic link elements
                HTMLAttributes: {
                    // Styles link targets with matching corporate red highlight styling colors
                    class: 'text-[#EE1C25] font-bold underline transition-colors cursor-pointer hover:text-red-700',
                },
            }),
        ],
        content: value,
        editorProps: {
            attributes: {
                class: 'prose prose-slate max-w-none focus:outline-none min-h-[400px] leading-relaxed [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 pt-1 pl-5',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    return (
        <div className="border border-slate-200 overflow-hidden bg-white shadow-sm focus-within:border-[#EE1C25]/30 transition-all">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}