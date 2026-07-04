// app/(admin)/tema/page.tsx
import ThemeClient from "./ThemeClient";

export const metadata = {
    title: 'Tema Engine Management | Workspace Dashboard',
};

export default function TemaManagementPage() {
    return <ThemeClient />;
}