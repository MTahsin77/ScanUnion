import { EventListClient } from '@/components/admin/event-list-client';
import { MOCK_EVENTS } from '@/lib/mock-data';

export default function EventsPage() {
  const events = MOCK_EVENTS;
  return <EventListClient events={events} />;
}
