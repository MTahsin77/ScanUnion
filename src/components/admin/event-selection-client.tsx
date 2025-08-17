'use client';

import { useState } from 'react';
import type { Event, EventWithStats } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, BarChart3, LogOut } from 'lucide-react';
import { DashboardClient } from './dashboard-client';

interface EventSelectionClientProps {
  events: Event[];
}

export function EventSelectionClient({ events }: EventSelectionClientProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventWithStats | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('scanunion_user');
    localStorage.removeItem('scanunion_admin');
    window.location.href = '/login';
  };

  const handleEventSelect = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`);
      if (response.ok) {
        const eventWithStats = await response.json();
        setSelectedEvent(eventWithStats);
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
    }
  };

  const handleBackToEvents = () => {
    setSelectedEvent(null);
  };

  if (selectedEvent) {
    return <DashboardClient event={selectedEvent} onBack={handleBackToEvents} />;
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Select an event to view its live dashboard and analytics.
        </p>
      </div>

      {events.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="flex flex-col hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge 
                    className="w-fit capitalize" 
                    variant={event.status === 'ongoing' ? 'default' : event.status === 'upcoming' ? 'secondary' : 'outline'}
                  >
                    {event.status}
                  </Badge>
                  {event.status === 'ongoing' && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Live
                    </div>
                  )}
                </div>
                <CardTitle className="pt-2">{event.name}</CardTitle>
                <CardDescription className="min-h-[2.5rem]">{event.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(event.date).toDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{event.timeRange}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
                <Button 
                  onClick={() => handleEventSelect(event.id)} 
                  className="w-full mt-4"
                  disabled={event.status === 'upcoming'}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  {event.status === 'ongoing' ? 'View Live Dashboard' : 
                   event.status === 'completed' ? 'View Analytics' : 
                   'Dashboard Unavailable'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-16">
          <p>No events available.</p>
        </div>
      )}
    </div>
  );
}
