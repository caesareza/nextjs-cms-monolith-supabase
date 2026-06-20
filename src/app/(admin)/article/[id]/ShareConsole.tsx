'use client';

import { useState } from 'react';
import { Link2, ExternalLink } from 'lucide-react';

export default function ShareConsole({ articleId }: { articleId: number }) {
    const [copied, setCopied] = useState(false);

    const handleCopyShareLink = () => {
        // Generates an absolute public URL matching your platform domain dynamically
        const shareUrl = `${window.location.origin}/shared/${articleId}`;

        navigator.clipboard.writeText(shareUrl);
        setCopied(true);

        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-2">
            {/* Action 1: Open public preview route in a new window tab */}
            <a
                href={`/shared/${articleId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 rounded-2xl text-xs font-bold hover:shadow-sm transition-all flex items-center gap-1.5"
            >
                <ExternalLink size={14} /> Public View
            </a>

            {/* Action 2: Trigger instant clipboard copier */}
            <button
                type="button"
                onClick={handleCopyShareLink}
                className={`px-5 py-2.5 text-xs font-bold rounded-2xl border transition-all cursor-pointer flex items-center gap-1.5 min-w-[130px] justify-center ${
                    copied
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-none'
                        : 'bg-slate-900 border-slate-950 text-white hover:bg-slate-800 hover:shadow-md'
                }`}
            >
                {copied ? 'Link Copied!' : <><Link2 size={14} /> Copy Link</>}
            </button>
        </div>
    );
}