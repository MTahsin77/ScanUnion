'use client';

import { ScannerClient } from '@/components/scan/scanner-client';
import { api } from '@/lib/api';
import type { Event } from '@/lib/types';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';

export default function ScanEventPage() {
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      try {
        if (params.id) {
          const eventData = await api.events.get(params.id as string);
          setEvent(eventData);
        }
      } catch (error: any) {
        console.error('Error fetching event:', error);
        setError(error.message || 'Failed to fetch event');
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading event...</div>
      </div>
    );
  }

  if (error || !event) {
    return notFound();
  }

  return <ScannerClient event={event} />;
}
