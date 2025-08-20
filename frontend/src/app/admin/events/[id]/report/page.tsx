'use client';

import { EventReportClient } from '@/components/admin/event-report-client';
import type { EventWithStats } from '@/lib/types';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface EventReportPageProps {
  params: {
    id: string;
  };
}

export default function EventReportPage({ params }: EventReportPageProps) {
  const [event, setEvent] = useState<EventWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEventReport() {
      try {
        // Check if user is authenticated
        const adminUser = localStorage.getItem('scanunion_admin');
        if (!adminUser) {
          window.location.href = '/login';
          return;
        }

        // Fetch event details with stats
        const eventData = await api.events.getById(params.id);
        const scanLogs = await api.scanLogs.list({ eventId: params.id });
        
        // Transform to EventWithStats format
        const successLogs = scanLogs.filter((log: any) => log.status === 'success');
        const scansByHour: { [hour: string]: number } = {};
        const scansByUser: { [userId: string]: number } = {};
        
        successLogs.forEach((log: any) => {
          const hour = new Date(log.timestamp).getHours();
          const hourString = `${hour % 12 === 0 ? 12 : hour % 12} ${hour < 12 ? 'AM' : 'PM'}`;
          scansByHour[hourString] = (scansByHour[hourString] || 0) + 1;
          
          scansByUser[log.scanner_id] = (scansByUser[log.scanner_id] || 0) + 1;
        });

        const scansByHourArray = Object.entries(scansByHour).map(([hour, scans]) => ({ hour, scans }));
        const peakHour = scansByHourArray.length > 0 
          ? scansByHourArray.reduce((max, current) => current.scans > max.scans ? current : max, scansByHourArray[0])
          : { hour: 'N/A', scans: 0 };
        
        const scansByUserArray = Object.entries(scansByUser).map(([userId, scans]) => ({
          userId,
          userName: scanLogs.find((log: any) => log.scanner_id === userId)?.scanner?.name || 'Unknown User',
          scans
        }));

        const eventWithStats: EventWithStats = {
          ...eventData,
          totalScans: successLogs.length,
          scansByHour: scansByHourArray,
          scansByUser: scansByUserArray,
          peakHour,
          duplicateScans: scanLogs.length - successLogs.length,
          logs: scanLogs.map((log: any) => ({
            id: log.id,
            eventId: log.event_id,
            scannerId: log.scanner_id,
            studentId: log.student_id,
            timestamp: log.timestamp,
            status: log.status.toLowerCase() as 'success' | 'duplicate' | 'error'
          }))
        };

        setEvent(eventWithStats);
      } catch (error: any) {
        console.error('Error fetching event report:', error);
        setError(error.message || 'Failed to fetch event report');
      } finally {
        setLoading(false);
      }
    }

    fetchEventReport();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading event report...</div>
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

  return <EventReportClient event={event} />;
}
