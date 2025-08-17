import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { ScanStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const scannerId = searchParams.get('scannerId');

    let whereClause: any = {};
    if (eventId) whereClause.eventId = eventId;
    if (scannerId) whereClause.scannerId = scannerId;

    const scanLogs = await prisma.scanLog.findMany({
      where: whereClause,
      include: {
        event: {
          select: {
            id: true,
            name: true
          }
        },
        scanner: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    return NextResponse.json(scanLogs);
  } catch (error) {
    console.error('Error fetching scan logs:', error);
    return NextResponse.json({ error: 'Failed to fetch scan logs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, scannerId, studentId } = body;

    // Check if this student was already scanned for this event
    const existingScan = await prisma.scanLog.findFirst({
      where: {
        eventId,
        studentId
      }
    });

    let status: ScanStatus = 'SUCCESS';
    if (existingScan) {
      status = 'DUPLICATE';
    }

    const scanLog = await prisma.scanLog.create({
      data: {
        eventId,
        scannerId,
        studentId,
        status
      },
      include: {
        event: {
          select: {
            id: true,
            name: true
          }
        },
        scanner: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json(scanLog, { status: 201 });
  } catch (error) {
    console.error('Error creating scan log:', error);
    return NextResponse.json({ error: 'Failed to create scan log' }, { status: 500 });
  }
}
