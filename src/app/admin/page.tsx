import { DashboardClient } from '@/components/admin/dashboard-client';
import { MOCK_EVENT_WITH_STATS_1 } from '@/lib/mock-data';

export default function AdminDashboardPage() {
  // In a real app, you would fetch the current ongoing event
  const ongoingEvent = MOCK_EVENT_WITH_STATS_1;

  return <DashboardClient event={ongoingEvent} />;
}
