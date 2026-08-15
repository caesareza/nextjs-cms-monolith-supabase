import PendingListClient from "./PendingListClient";
import { Newspaper } from "lucide-react";

export const metadata = {
  title: "Editorial Pipeline Queue | PT CMS",
};

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-steel-blue shrink-0">
          <Newspaper size={18} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-brand-navy leading-tight">
            Editorial Queue
          </h1>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
            Intelligence-driven content pipeline for the Posthinks team.
          </p>
        </div>
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
