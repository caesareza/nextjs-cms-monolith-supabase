import PendingListClient from './PendingListClient';

export default function DashboardPage() {
    return (
        <div className="space-y-12">
            <header className="flex flex-col gap-2">
                <h1 className="text-4xl font-black text-brand-navy tracking-tight">
                    Editorial Queue
                </h1>
                <p className="text-brand-steel-blue/80 font-semibold text-sm">
                    Intelligence-driven content pipeline for the Posthinks team.
                </p>
            </header>

            <PendingListClient />

            <footer className="text-center pt-10">
                <p className="text-[10px] font-bold text-brand-steel-blue/40 uppercase tracking-[0.3em]">
                    Priority Sort: Oldest First
                </p>
            </footer>
        </div>
    );
}