import { EventTilesClient } from '@/components/scan/event-tiles-client';
import { MOCK_EVENTS } from '@/lib/mock-data';

export default function SelectEventPage() {
  // Filter for events that can be scanned
  const availableEvents = MOCK_EVENTS.filter(e => e.scanningEnabled && (e.status === 'ongoing' || e.status === 'upcoming'));
  
  return <EventTilesClient events={availableEvents} />;
}
