// app/(admin)/category/page.tsx
import CategoryClient from "./CategoryClient";

export const metadata = {
    title: 'Category Taxonomy Management | Corporate Console',
};

export default function CategoryManagementPage() {
    return <CategoryClient />;
}