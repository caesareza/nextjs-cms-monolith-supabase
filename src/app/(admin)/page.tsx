import PendingListClient from './PendingListClient';

export default function DashboardPage() {
    return (
        <div className="space-y-12">
            <header className="flex flex-col gap-2">
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
                    Editorial Queue
                </h1>
                <p className="text-slate-400 font-bold text-sm">
                    Dynamic review queue for OCBC Nexus internal team.
                </p>
            </header>

            <PendingListClient />

            <footer className="text-center pt-10">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                    Priority Sort: Oldest First
                </p>
            </footer>
        </div>
    );
}