// app/(admin)/writer/page.tsx
import WritersClient from "./WritersClient";

export const metadata = {
    title: 'Writer Directory | Platform Management Console',
};

export default function WriterDirectoryPage() {
    return <WritersClient />;
}