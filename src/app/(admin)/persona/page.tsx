// app/(admin)/persona/page.tsx
import PersonaClient from "./PersonaClient";

export const metadata = {
    title: 'Audience Persona Management | Content Platform Console',
};

export default function PersonaManagementPage() {
    return <PersonaClient />;
}