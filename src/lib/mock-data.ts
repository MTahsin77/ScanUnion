import type { EventWithStats, User, ScanLog, Event } from './types';

export const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'John Doe', pin: '1234', enabled: true },
  { id: 'user-2', name: 'Jane Smith', pin: '5678', enabled: true },
  { id: 'user-3', name: 'Peter Jones', pin: '9876', enabled: true },
  { id: 'user-4', name: 'Alice Williams', pin: '4321', enabled: false },
];

export const MOCK_EVENTS: Event[] = [
  {
    id: 'event-1',
    name: 'Freshman Welcome Week Party',
    date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
    timeRange: '7:00 PM - 11:00 PM',
    location: 'Main Quad',
    description: 'The biggest party to kick off the new academic year!',
    scanningEnabled: true,
    status: 'ongoing',
  },
  {
    id: 'event-2',
    name: 'Career Fair 2024',
    date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0],
    timeRange: '10:00 AM - 4:00 PM',
    location: 'University Gymnasium',
    scanningEnabled: true,
    status: 'upcoming',
  },
  {
    id: 'event-3',
    name: 'Spring Music Festival',
    date: '2024-05-20',
    timeRange: '2:00 PM - 10:00 PM',
    location: 'South Lawn',
    scanningEnabled: true,
    status: 'completed',
  },
  {
    id: 'event-4',
    name: 'Alumni Homecoming Gala',
    date: '2024-10-15',
    timeRange: '6:00 PM - 9:00 PM',
    description: 'An exclusive event for our esteemed alumni.',
    scanningEnabled: false,
    status: 'completed',
  },
];

const generateScanLogs = (eventId: string, userIds: string[], count: number, startTime: Date): ScanLog[] => {
  const logs: ScanLog[] = [];
  const studentIds = new Set<string>();
  for (let i = 0; i < count; i++) {
    const timestamp = new Date(startTime.getTime() + i * 1000 * (Math.random() * 10));
    const studentId = `SID${Math.floor(100000 + Math.random() * 900000)}`;
    const isDuplicate = studentIds.has(studentId) && Math.random() > 0.9;
    if(!isDuplicate) studentIds.add(studentId);
    
    logs.push({
      id: `scan-${eventId}-${i}`,
      eventId,
      scannerId: userIds[Math.floor(Math.random() * userIds.length)],
      studentId,
      timestamp: timestamp.toISOString(),
      status: isDuplicate ? 'duplicate' : 'success',
    });
  }
  return logs;
};

const event1Logs = generateScanLogs('event-1', ['user-1', 'user-2', 'user-3'], 1253, new Date(new Date().setHours(19, 0, 0, 0)));
const event3Logs = generateScanLogs('event-3', ['user-1', 'user-2'], 2489, new Date('2024-05-20T14:00:00Z'));


const processLogs = (event: Event, logs: ScanLog[]): EventWithStats => {
    const successLogs = logs.filter(l => l.status === 'success');
    const scansByHour: { [hour: string]: number } = {};
    const scansByUser: { [userId: string]: number } = {};
    
    successLogs.forEach(log => {
        const hour = new Date(log.timestamp).getHours();
        const hourString = `${hour % 12 === 0 ? 12 : hour % 12} ${hour < 12 ? 'AM' : 'PM'}`;
        scansByHour[hourString] = (scansByHour[hourString] || 0) + 1;
        
        scansByUser[log.scannerId] = (scansByUser[log.scannerId] || 0) + 1;
    });

    const scansByHourArray = Object.entries(scansByHour).map(([hour, scans]) => ({ hour, scans })).sort((a,b) => new Date(`1/1/1970 ${a.hour}`).getTime() - new Date(`1/1/1970 ${b.hour}`).getTime());
    
    let peakHour = { hour: 'N/A', scans: 0 };
    if (scansByHourArray.length > 0) {
        peakHour = scansByHourArray.reduce((max, current) => current.scans > max.scans ? current : max, scansByHourArray[0]);
    }
    
    const scansByUserArray = Object.entries(scansByUser).map(([userId, scans]) => ({
        userId,
        userName: MOCK_USERS.find(u => u.id === userId)?.name || 'Unknown User',
        scans
    }));

    return {
        ...event,
        totalScans: successLogs.length,
        scansByHour: scansByHourArray,
        scansByUser: scansByUserArray,
        peakHour,
        duplicateScans: logs.length - successLogs.length,
        logs: logs,
    };
};

export const MOCK_EVENT_WITH_STATS_1: EventWithStats = processLogs(MOCK_EVENTS.find(e => e.id === 'event-1')!, event1Logs);
export const MOCK_EVENT_WITH_STATS_3: EventWithStats = processLogs(MOCK_EVENTS.find(e => e.id === 'event-3')!, event3Logs);

export const getMockEventById = (id: string): EventWithStats | Event | undefined => {
    if (id === 'event-1') return MOCK_EVENT_WITH_STATS_1;
    if (id === 'event-3') return MOCK_EVENT_WITH_STATS_3;
    return MOCK_EVENTS.find(e => e.id === id);
}
