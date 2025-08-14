import { EventReportClient } from '@/components/admin/event-report-client';
import { getMockEventById } from '@/lib/mock-data';
import type { EventWithStats } from '@/lib/types';
import { notFound } from 'next/navigation';

interface EventReportPageProps {
  params: {
    id: string;
  };
}

export default function EventReportPage({ params }: EventReportPageProps) {
  const event = getMockEventById(params.id);

  if (!event || !('totalScans' in event)) {
    // For this mock, we only show reports for events with stats
    notFound();
  }

  return <EventReportClient event={event as EventWithStats} />;
}
