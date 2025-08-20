'use client';

import { EventTilesClient } from '@/components/scan/event-tiles-client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Event } from '@/lib/types';

export default function SelectEventPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchScannableEvents() {
      try {
        // Get current user to filter events
        const userData = localStorage.getItem('scanunion_user');
        
        if (userData) {
          const authData = JSON.parse(userData);
          const user = authData.user || authData; // Handle both old and new data structure
          
          if (!user || !user.id) {
            throw new Error('Invalid user data - no user ID found');
          }
          
          const data = await api.events.list({ userId: user.id });
          
          // Backend already filters by userId, we just need to filter for enabled scanning
          // Handle both camelCase and snake_case field names
          const filteredEvents = data.filter((event: Event) => {
            const scanningEnabled = event.scanningEnabled !== undefined ? event.scanningEnabled : 
                                   (event.scanning_enabled !== undefined ? event.scanning_enabled : false);
            return scanningEnabled;
          });
          
          setEvents(filteredEvents);
        } else {
          throw new Error('No user data found in localStorage');
        }
      } catch (error: any) {
        console.error('Error fetching events:', error);
        setError(error.message || 'Failed to fetch events');
      } finally {
        setLoading(false);
      }
    }

    fetchScannableEvents();
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

  return <EventTilesClient events={events} />;
}
