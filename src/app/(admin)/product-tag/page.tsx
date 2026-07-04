// app/(admin)/product-tag/page.tsx
import ProductTagClient from "./ProductTagClient";

export const metadata = {
    title: 'Product Tag Configuration | Administration Engine',
};

export default function ProductTagManagementPage() {
    return <ProductTagClient />;
}