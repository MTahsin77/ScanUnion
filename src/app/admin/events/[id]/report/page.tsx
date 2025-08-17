import { EventReportClient } from '@/components/admin/event-report-client';
import { prisma } from '@/lib/database';
import type { EventWithStats } from '@/lib/types';
import { notFound } from 'next/navigation';

interface EventReportPageProps {
  params: {
    id: string;
  };
}

export default async function EventReportPage({ params }: EventReportPageProps) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      scanLogs: {
        include: {
          scanner: true
        }
      },
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

  // Transform to EventWithStats format
  const successLogs = event.scanLogs.filter((log: any) => log.status === 'SUCCESS');
  const scansByHour: { [hour: string]: number } = {};
  const scansByUser: { [userId: string]: number } = {};
  
  successLogs.forEach((log: any) => {
    const hour = new Date(log.timestamp).getHours();
    const hourString = `${hour % 12 === 0 ? 12 : hour % 12} ${hour < 12 ? 'AM' : 'PM'}`;
    scansByHour[hourString] = (scansByHour[hourString] || 0) + 1;
    
    scansByUser[log.scannerId] = (scansByUser[log.scannerId] || 0) + 1;
  });

  const scansByHourArray = Object.entries(scansByHour).map(([hour, scans]) => ({ hour, scans }));
  const peakHour = scansByHourArray.length > 0 
    ? scansByHourArray.reduce((max, current) => current.scans > max.scans ? current : max, scansByHourArray[0])
    : { hour: 'N/A', scans: 0 };
  
  const scansByUserArray = Object.entries(scansByUser).map(([userId, scans]) => ({
    userId,
    userName: event.scanLogs.find((log: any) => log.scannerId === userId)?.scanner.name || 'Unknown User',
    scans
  }));

  const eventWithStats: EventWithStats = {
    ...event,
    totalScans: successLogs.length,
    scansByHour: scansByHourArray,
    scansByUser: scansByUserArray,
    peakHour,
    duplicateScans: event.scanLogs.length - successLogs.length,
    logs: event.scanLogs.map((log: any) => ({
      id: log.id,
      eventId: log.eventId,
      scannerId: log.scannerId,
      studentId: log.studentId,
      timestamp: log.timestamp.toISOString(),
      status: log.status.toLowerCase() as 'success' | 'duplicate' | 'error'
    }))
  };

  return <EventReportClient event={eventWithStats} />;
}
