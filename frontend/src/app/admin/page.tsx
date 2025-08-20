'use client';

import { EventSelectionClient } from '@/components/admin/event-selection-client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Event } from '@/lib/types';

export default function AdminDashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        // Check if user is authenticated
        const adminUser = localStorage.getItem('scanunion_admin');
        if (!adminUser) {
          window.location.href = '/login';
          return;
        }

        const data = await api.events.list({ includeStats: true });
        setEvents(data);
      } catch (error: any) {
        console.error('Error fetching events:', error);
        setError(error.message || 'Failed to fetch events');
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading events...</div>
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

  return <EventSelectionClient events={events} />;
}
