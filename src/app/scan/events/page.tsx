import { EventTilesClient } from '@/components/scan/event-tiles-client';

import { prisma } from '@/lib/database';

async function getScannableEvents() {
  try {
    const events = await prisma.event.findMany({
      where: {
        scanningEnabled: true
      },
      include: {
        eventUsers: {
          include: {
            user: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });
    return events;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

export default async function SelectEventPage() {
  const scannableEvents = await getScannableEvents();
  return <EventTilesClient events={scannableEvents} />;
}
