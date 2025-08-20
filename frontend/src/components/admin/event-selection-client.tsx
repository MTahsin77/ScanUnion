'use client';

import { useState } from 'react';
import type { Event, EventWithStats } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, BarChart3, LogOut } from 'lucide-react';
import { DashboardClient } from './dashboard-client';
import { formatEventTiming } from '@/lib/event-utils';

interface EventSelectionClientProps {
  events: Event[];
}

export function EventSelectionClient({ events }: EventSelectionClientProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventWithStats | null>(null);
  
  // Deduplicate events to prevent React key errors
  const uniqueEvents = Array.from(
    new Map(events.map(event => [event.id, event])).values()
  );

  const handleLogout = () => {
    localStorage.removeItem('scanunion_user');
    localStorage.removeItem('scanunion_admin');
    window.location.href = '/login';
  };

  const handleEventSelect = async (eventId: string) => {
    try {
      const { api } = await import('@/lib/api');
      
      // Fetch event data and scan logs in parallel
      const [eventData, scanLogs] = await Promise.all([
        api.events.getById(eventId),
        api.scanLogs.list({ eventId })
      ]);
      
      // Transform basic event data into EventWithStats
      const eventWithStats = await transformEventToStats(eventData, scanLogs);
      setSelectedEvent(eventWithStats);
    } catch (error) {
      console.error('Error fetching event details:', error);
      // Set a basic event with default stats to prevent crashes
      const basicEvent = {
        id: eventId,
        name: 'Unknown Event',
        totalScans: 0,
        duplicateScans: 0,
        scansByUser: [],
        scansByHour: [],
        peakHour: { hour: 'N/A', scans: 0 },
        logs: [],
        startDate: null,
        endDate: null,
        location: '',
        description: '',
        scanningEnabled: false,
        status: 'UPCOMING',
        isPermanent: false,
        duplicatePolicy: 'ONCE_PER_EVENT'
      };
      setSelectedEvent(basicEvent);
    }
  };
  
  // Helper function to transform event data into stats
  async function transformEventToStats(event: any, scanLogs: any[]): Promise<any> {
    // Handle field name mapping from backend snake_case to frontend camelCase
    const mappedEvent = {
      ...event,
      scanningEnabled: event.scanningEnabled !== undefined ? event.scanningEnabled : 
                      (event.scanning_enabled !== undefined ? event.scanning_enabled : false),
      isPermanent: event.isPermanent !== undefined ? event.isPermanent : 
                  (event.is_permanent !== undefined ? event.is_permanent : false),
      duplicatePolicy: event.duplicatePolicy || event.duplicate_policy || 'ONCE_PER_EVENT',
      startDate: event.startDate || event.start_date,
      endDate: event.endDate || event.end_date,
    };
    
    const successLogs = scanLogs.filter(log => log.status === 'SUCCESS');
    const duplicateLogs = scanLogs.filter(log => log.status === 'DUPLICATE');
    const overrideLogs = scanLogs.filter(log => log.status === 'DUPLICATE_OVERRIDE');
    
    // Calculate hourly scan distribution
    const scansByHour: { [hour: string]: number } = {};
    successLogs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      const hourString = `${hour % 12 === 0 ? 12 : hour % 12} ${hour < 12 ? 'AM' : 'PM'}`;
      scansByHour[hourString] = (scansByHour[hourString] || 0) + 1;
    });
    
    const scansByHourArray = Object.entries(scansByHour).map(([hour, scans]) => ({ hour, scans }));
    const peakHour = scansByHourArray.length > 0 
      ? scansByHourArray.reduce((max, current) => current.scans > max.scans ? current : max, scansByHourArray[0])
      : { hour: 'N/A', scans: 0 };
    
    // Calculate scanner performance
    const scansByUser: { [userId: string]: number } = {};
    successLogs.forEach(log => {
      scansByUser[log.scanner_id] = (scansByUser[log.scanner_id] || 0) + 1;
    });
    
    // Get scanner names from event_users if available
    const scansByUserArray = Object.entries(scansByUser).map(([userId, scans]) => {
      let userName = `Scanner ${userId.slice(-4)}`; // Default fallback
      
      // Try to get actual user name from event_users
      if (event.event_users && Array.isArray(event.event_users)) {
        const eventUser = event.event_users.find((eu: any) => 
          (eu.user?.id === userId) || (eu.user_id === userId)
        );
        if (eventUser?.user?.name) {
          userName = eventUser.user.name;
        }
      }
      
      return { userId, userName, scans };
    });
    
    return {
      ...mappedEvent,
      totalScans: successLogs.length,
      duplicateScans: duplicateLogs.length,
      overriddenScans: overrideLogs.length,
      scansByUser: scansByUserArray,
      scansByHour: scansByHourArray,
      peakHour,
      logs: scanLogs.map(log => ({
        id: log.id,
        eventId: log.event_id || log.eventId,
        scannerId: log.scanner_id || log.scannerId,
        studentId: log.student_id || log.studentId,
        timestamp: log.timestamp,
        status: log.status.toLowerCase()
      }))
    };
  }

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

      {uniqueEvents.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {uniqueEvents.map((event) => {
            // Handle field mapping and timing for display
            const timing = formatEventTiming(event);
            return (
              <Card key={event.id} className="flex flex-col hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge 
                      className="w-fit capitalize" 
                      variant={event.status === 'ONGOING' ? 'default' : event.status === 'UPCOMING' ? 'secondary' : 'outline'}
                    >
                      {event.status}
                    </Badge>
                    {event.status === 'ONGOING' && (
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
                      <span>{timing.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{timing.time}</span>
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
                  disabled={event.status === 'UPCOMING'}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  {event.status === 'ONGOING' ? 'View Live Dashboard' : 
                   event.status === 'COMPLETED' ? 'View Analytics' : 
                   'Dashboard Unavailable'}
                </Button>
              </CardContent>
            </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-16">
          <p>No events available.</p>
        </div>
      )}
    </div>
  );
}
