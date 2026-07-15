'use client';

import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

export default function DeleteModal({
                                        isOpen,
                                        onClose,
                                        onConfirm,
                                        loading,
                                        success,
                                        articleTitle
                                    }: any) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl space-y-6">
                {success ? (
                    <div className="text-center space-y-4 animate-in zoom-in-95">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase">Successfully Deleted</h3>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">The article has been moved to trash.</p>
                    </div>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-brand-accent/15 text-brand-accent rounded-full flex items-center justify-center mx-auto">
                            <AlertCircle size={32} />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight text-brand-navy">Archive Article?</h3>
                            <p className="text-slate-500 text-xs font-bold leading-relaxed">
                                Confirming will hide <span className="text-slate-900">"{articleTitle}"</span> from the active list.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button disabled={loading} onClick={onClose} className="flex-1 py-4 text-[10px] font-black uppercase text-slate-400">Cancel</button>
                            <button
                                disabled={loading}
                                onClick={onConfirm}
                                className="flex-1 py-4 bg-brand-accent hover:bg-brand-navy text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 size={14} className="animate-spin" /> : 'Confirm Delete'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}