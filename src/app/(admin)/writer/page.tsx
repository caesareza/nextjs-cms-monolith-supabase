import { Metadata } from 'next';
import WritersClient from './WritersClient';

// This is the Meta Data for the OCBC Nexus Writers Page
export const metadata: Metadata = {
    title: 'Writers Directory | OCBC Nexus Admin',
    description: 'Manage and monitor all registered writers and content contributors within the Nexus ecosystem.',
    robots: {
        index: false, // Recommended for Admin Dashboards
        follow: false,
    },
};

export default function WritersPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div>
                {/* OCBC Style Heading */}
                <h1 className="text-3xl font-black text-slate-900 tracking-tight ">
                    Writers
                </h1>
                <p className="text-sm text-slate-500 font-medium mt-1">
                    Directory of all registered writers in the Nexus system.
                </p>
            </div>

            {/* Your Client Component with Skeletons */}
            <WritersClient />
        </div>
    );
}