import { EventSelectionClient } from '@/components/admin/event-selection-client';

import { prisma } from '@/lib/database';

async function getEvents() {
  try {
    const events = await prisma.event.findMany({
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

export default async function AdminDashboardPage() {
  const events = await getEvents();
  return <EventSelectionClient events={events} />;
}
