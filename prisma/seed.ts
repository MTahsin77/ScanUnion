import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const adminPasswordHash = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@scanunion.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@scanunion.com',
      pin: 'admin',
      role: 'ADMIN',
      enabled: true,
      isFirstLogin: false,
      passwordHash: adminPasswordHash,
    },
  });

  // Create sample scanner users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { pin: '1234' },
      update: {},
      create: {
        name: 'John Doe',
        pin: '1234',
        role: 'USER',
        enabled: true,
        isFirstLogin: false,
      },
    }),
    prisma.user.upsert({
      where: { pin: '5678' },
      update: {},
      create: {
        name: 'Jane Smith',
        pin: '5678',
        role: 'USER',
        enabled: true,
        isFirstLogin: false,
      },
    }),
    prisma.user.upsert({
      where: { pin: '9012' },
      update: {},
      create: {
        name: 'Peter Jones',
        pin: '9012',
        role: 'USER',
        enabled: true,
        isFirstLogin: false,
      },
    }),
    prisma.user.upsert({
      where: { pin: '3456' },
      update: {},
      create: {
        name: 'Alice Williams',
        pin: '3456',
        role: 'USER',
        enabled: false,
        isFirstLogin: false,
      },
    }),
  ]);

  // Create sample events
  const events = await Promise.all([
    prisma.event.create({
      data: {
        name: 'Freshman Welcome Week Party',
        description: 'The biggest party to kick off the new academic year!',
        date: new Date(new Date().setDate(new Date().getDate() + 1)),
        timeRange: '7:00 PM - 11:00 PM',
        location: 'Main Quad',
        status: 'UPCOMING',
        scanningEnabled: true,
      },
    }),
    prisma.event.create({
      data: {
        name: 'Spring Career Fair',
        description: 'Connect with top employers and explore career opportunities.',
        date: new Date(new Date().setDate(new Date().getDate() + 7)),
        timeRange: '10:00 AM - 4:00 PM',
        location: 'Student Center',
        status: 'UPCOMING',
        scanningEnabled: true,
      },
    }),
    prisma.event.create({
      data: {
        name: 'Alumni Networking Night',
        description: 'Network with successful alumni from various industries.',
        date: new Date(new Date().setDate(new Date().getDate() - 5)),
        timeRange: '6:00 PM - 9:00 PM',
        location: 'Conference Hall',
        status: 'COMPLETED',
        scanningEnabled: false,
      },
    }),
  ]);

  // Assign users to events
  await Promise.all([
    // Assign John and Jane to first event
    prisma.eventUser.create({
      data: {
        eventId: events[0].id,
        userId: users[0].id,
        location: 'Main Entrance',
      },
    }),
    prisma.eventUser.create({
      data: {
        eventId: events[0].id,
        userId: users[1].id,
        location: 'Side Gate',
      },
    }),
    // Assign Peter to second event
    prisma.eventUser.create({
      data: {
        eventId: events[1].id,
        userId: users[2].id,
        location: 'Registration Desk',
      },
    }),
  ]);

  // Create sample scan logs for completed event
  const scanLogs = await Promise.all([
    prisma.scanLog.create({
      data: {
        eventId: events[2].id,
        scannerId: users[0].id,
        studentId: 'STU001',
        status: 'SUCCESS',
        timestamp: new Date(new Date().setHours(new Date().getHours() - 2)),
      },
    }),
    prisma.scanLog.create({
      data: {
        eventId: events[2].id,
        scannerId: users[1].id,
        studentId: 'STU002',
        status: 'SUCCESS',
        timestamp: new Date(new Date().setHours(new Date().getHours() - 1)),
      },
    }),
    prisma.scanLog.create({
      data: {
        eventId: events[2].id,
        scannerId: users[0].id,
        studentId: 'STU001',
        status: 'DUPLICATE',
        timestamp: new Date(new Date().setMinutes(new Date().getMinutes() - 30)),
      },
    }),
  ]);

  console.log('Database seeded successfully!');
  console.log('Admin user created:', admin);
  console.log('Sample users created:', users.length);
  console.log('Sample events created:', events.length);
  console.log('Sample scan logs created:', scanLogs.length);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
