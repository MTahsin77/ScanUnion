export interface User {
  id: string;
  name: string;
  pin: string;
  enabled: boolean;
  role?: 'admin' | 'user';
  isFirstLogin?: boolean;
  tempPassword?: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  timeRange: string;
  location?: string;
  description?: string;
  scanningEnabled: boolean;
  status: 'upcoming' | 'ongoing' | 'completed';
  assignedUsers?: string[]; // Array of user IDs who can scan for this event
  userLocations?: { [userId: string]: string | undefined }; // Optional locations for each assigned user
}

export interface ScanLog {
  id: string;
  eventId: string;
  scannerId: string;
  studentId: string;
  timestamp: string;
  status: 'success' | 'duplicate' | 'error';
}

export interface EventWithStats extends Event {
  totalScans: number;
  scansByHour: { hour: string; scans: number }[];
  scansByUser: { userId: string; userName: string; scans: number }[];
  peakHour: { hour: string; scans: number };
  duplicateScans: number;
  logs: ScanLog[];
}
