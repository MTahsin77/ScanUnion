import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { EventStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('includeStats') === 'true';
    const userId = searchParams.get('userId');

    let events;

    if (includeStats) {
      // Get events with scan statistics
      events = await prisma.event.findMany({
        include: {
          scanLogs: true,
          eventUsers: {
            include: {
              user: true
            }
          }
        },
        orderBy: { date: 'desc' }
      });

      // Transform to include stats
      events = events.map(event => ({
        ...event,
        totalScans: event.scanLogs.length,
        uniqueScans: new Set(event.scanLogs.map(log => log.studentId)).size,
        duplicateScans: event.scanLogs.filter(log => log.status === 'DUPLICATE').length,
        errorScans: event.scanLogs.filter(log => log.status === 'ERROR').length,
        scansByHour: generateHourlyStats(event.scanLogs),
        scannerPerformance: generateScannerStats(event.scanLogs, event.eventUsers)
      }));
    } else if (userId) {
      // Get events assigned to specific user
      events = await prisma.event.findMany({
        where: {
          eventUsers: {
            some: {
              userId: userId
            }
          }
        },
        include: {
          eventUsers: {
            where: { userId },
            include: { user: true }
          }
        },
        orderBy: { date: 'desc' }
      });
    } else {
      // Get all events
      events = await prisma.event.findMany({
        include: {
          eventUsers: {
            include: {
              user: true
            }
          }
        },
        orderBy: { date: 'desc' }
      });
    }

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, date, timeRange, location, scanningEnabled, assignedUsers, userLocations } = body;

    const event = await prisma.event.create({
      data: {
        name,
        description,
        date: new Date(date),
        timeRange,
        location,
        scanningEnabled,
        status: 'UPCOMING' as EventStatus,
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

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
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
