// app/(admin)/section/page.tsx
import SectionClient from "./SectionClient";

export const metadata = {
    title: 'Section Management | Admin Console',
};

export default function SectionManagementPage() {
    return <SectionClient />;
}