import { Metadata } from 'next';
import ProductPriorityClient from './ProductPriorityClient';

export const metadata: Metadata = {
    title: 'Priority Product Configuration | Administration Engine',
};

export default function ProductPriorityPage() {
    return <ProductPriorityClient />;
}
