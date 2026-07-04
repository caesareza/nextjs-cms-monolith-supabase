// app/(admin)/campaign/page.tsx
import CampaignClient from "./CampaignClient";

export const metadata = {
    title: 'Campaign Analytics Tracker | Operations Dashboard',
};

export default function CampaignManagementPage() {
    return <CampaignClient />;
}