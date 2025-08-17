import { EditEventClient } from '@/components/admin/edit-event-client';
import { prisma } from '@/lib/database';
import { notFound } from 'next/navigation';

interface EditEventPageProps {
  params: {
    id: string;
  };
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      eventUsers: {
        include: {
          user: true
        }
      }
    }
  });

  if (!event) {
    notFound();
  }

  return <EditEventClient event={event} />;
}
