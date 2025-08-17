import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { EventStatus } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        scanLogs: true,
        eventUsers: {
          include: {
            user: true
          }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Add stats to event
    const eventWithStats = {
      ...event,
      totalScans: event.scanLogs.length,
      uniqueScans: new Set(event.scanLogs.map(log => log.studentId)).size,
      duplicateScans: event.scanLogs.filter(log => log.status === 'DUPLICATE').length,
      errorScans: event.scanLogs.filter(log => log.status === 'ERROR').length,
      scansByHour: generateHourlyStats(event.scanLogs),
      scannerPerformance: generateScannerStats(event.scanLogs, event.eventUsers)
    };

    return NextResponse.json(eventWithStats);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, date, timeRange, location, scanningEnabled, status, assignedUsers, userLocations } = body;

    // First, delete existing user assignments
    await prisma.eventUser.deleteMany({
      where: { eventId: params.id }
    });

    // Update event with new data
    const event = await prisma.event.update({
      where: { id: params.id },
      data: {
        name,
        description,
        date: new Date(date),
        timeRange,
        location,
        scanningEnabled,
        status: status as EventStatus,
        eventUsers: assignedUsers ? {
          create: assignedUsers.map((userId: string) => ({
            userId,
            location: userLocations?.[userId] || null
          }))
        } : undefined
      },
      include: {
        eventUsers: {
          include: {
            user: true
          }
        }
      }
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.event.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}

function generateHourlyStats(scanLogs: any[]) {
  const hourlyData: { [key: string]: number } = {};
  
  scanLogs.forEach(log => {
    const hour = new Date(log.timestamp).getHours();
    const hourKey = `${hour}:00`;
    hourlyData[hourKey] = (hourlyData[hourKey] || 0) + 1;
  });

  return Object.entries(hourlyData).map(([hour, scans]) => ({
    hour,
    scans
  }));
}

function generateScannerStats(scanLogs: any[], eventUsers: any[]) {
  const scannerStats: { [key: string]: { scans: number; name: string } } = {};
  
  eventUsers.forEach(eventUser => {
    scannerStats[eventUser.userId] = {
      scans: 0,
      name: eventUser.user.name
    };
  });

  scanLogs.forEach(log => {
    if (scannerStats[log.scannerId]) {
      scannerStats[log.scannerId].scans++;
    }
  });

  return Object.entries(scannerStats).map(([scannerId, data]) => ({
    scanner: data.name,
    scans: data.scans
  }));
}
