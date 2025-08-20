'use client';

import { EditEventClient } from '@/components/admin/edit-event-client';
import { useEffect, useState, use } from 'react';
import { api } from '@/lib/api';
import { Event } from '@/lib/types';

interface EditEventPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditEventPage({ params }: EditEventPageProps) {
  const resolvedParams = use(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      try {
        // Check if user is authenticated
        const adminUser = localStorage.getItem('scanunion_admin');
        if (!adminUser) {
          window.location.href = '/login';
          return;
        }

        const eventData = await api.events.getById(resolvedParams.id);
        setEvent(eventData);
      } catch (error: any) {
        console.error('Error fetching event:', error);
        setError(error.message || 'Failed to fetch event');
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading event...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Event not found</div>
      </div>
    );
  }

  return <EditEventClient event={event} />;
}
