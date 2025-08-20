export interface User {
  id: string;
  name: string;
  pin: string;
  email?: string; // For admin users
  enabled: boolean;
  role?: 'ADMIN' | 'USER';
  isFirstLogin?: boolean;
  tempPassword?: string;
}

export type EventStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED';
export type DuplicatePolicy = 'ONCE_PER_EVENT' | 'ONCE_PER_DAY' | 'ALLOW_DUPLICATES';
export type ScanStatus = 'success' | 'duplicate' | 'duplicate_override' | 'error';

export interface Event {
  id: string;
  name: string;
  startDate?: string; // Optional start date (ISO string)
  endDate?: string;   // Optional end date (ISO string)
  location?: string;
  description?: string;
  scanningEnabled: boolean;
  status: EventStatus; // Auto-calculated based on dates
  isPermanent: boolean; // If true, no start/end dates and always ongoing
  duplicatePolicy: DuplicatePolicy;
  assignedUsers?: string[]; // Array of user IDs who can scan for this event
  userLocations?: { [userId: string]: string | undefined }; // Optional locations for each assigned user
  createdAt?: string;
  updatedAt?: string;
}

export interface ScanLog {
  id: string;
  eventId: string;
  scannerId: string;
  studentId: string;
  timestamp: string;
  status: ScanStatus;
  isOverride?: boolean; // If this duplicate scan was manually overridden
  overrideReason?: string;
  lastScanAt?: string; // For duplicate detection
}

export interface EventWithStats extends Event {
  totalScans: number; // Only accepted scans
  duplicateScans: number; // Duplicate scans (flagged but not overridden)
  overriddenScans: number; // Duplicate scans that were manually overridden
  scansByHour: { hour: string; scans: number; duplicates: number }[];
  scansByDay?: { day: string; scans: number; duplicates: number }[];
  scansByWeek?: { week: string; scans: number; duplicates: number }[];
  scansByMonth?: { month: string; scans: number; duplicates: number }[];
  scansByUser: { userId: string; userName: string; scans: number; duplicates: number }[];
  peakPeriod: { period: string; scans: number; type: 'hour' | 'day' | 'week' | 'month' };
  logs: ScanLog[];
  duration: {
    days: number;
    hours: number;
    isMultiDay: boolean;
    defaultTrendView: 'hour' | 'day' | 'week' | 'month';
  };
}

// Utility type for status calculation
export interface StatusCalculationResult {
  status: EventStatus;
  timeUntilStart?: number; // milliseconds
  timeUntilEnd?: number;   // milliseconds
  isActive: boolean;
}
