'use client';

import { useEffect, useState } from 'react';
import type { Event, User } from '@/lib/types';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Clock, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EventTilesClientProps {
  events: Event[];
}

export function EventTilesClient({ events }: EventTilesClientProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Retrieve user from localStorage
    const storedUser = localStorage.getItem('scanunion_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="container mx-auto max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Select an Event</h1>
        <p className="text-muted-foreground">
          Welcome, <span className="font-semibold text-primary">{user?.name || 'Scanner'}</span>! Choose an event to start scanning.
        </p>
      </div>

      {events.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="flex flex-col">
              <CardHeader>
                <Badge className="w-fit capitalize" variant={event.status === 'ongoing' ? 'default' : 'outline'}>{event.status}</Badge>
                <CardTitle className="pt-2">{event.name}</CardTitle>
                <CardDescription>{event.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-3 text-sm text-muted-foreground">
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
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full" disabled={event.status !== 'ongoing'}>
                  <Link href={`/scan/events/${event.id}`}>
                    Start Scanning <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-16">
          <p>There are no events available for scanning at this time.</p>
        </div>
      )}
    </div>
  );
}
