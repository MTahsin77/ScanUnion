import { Event, EventStatus, StatusCalculationResult, DuplicatePolicy, ScanLog } from './types';

/**
 * Calculate event status based on current time and event dates
 */
export function calculateEventStatus(event: Event): StatusCalculationResult {
  const now = new Date();
  
  // Permanent events are always ongoing
  if (event.isPermanent) {
    return {
      status: 'ONGOING',
      isActive: true
    };
  }

  // If no dates are set, treat as ongoing for backward compatibility
  if (!event.startDate && !event.endDate) {
    return {
      status: 'ONGOING',
      isActive: true
    };
  }

  const startDate = event.startDate ? new Date(event.startDate) : null;
  const endDate = event.endDate ? new Date(event.endDate) : null;

  // If only start date is set
  if (startDate && !endDate) {
    if (now < startDate) {
      return {
        status: 'UPCOMING',
        timeUntilStart: startDate.getTime() - now.getTime(),
        isActive: false
      };
    } else {
      return {
        status: 'ONGOING',
        isActive: true
      };
    }
  }

  // If only end date is set
  if (!startDate && endDate) {
    if (now > endDate) {
      return {
        status: 'COMPLETED',
        isActive: false
      };
    } else {
      return {
        status: 'ONGOING',
        isActive: true
      };
    }
  }

  // Both dates are set
  if (startDate && endDate) {
    if (now < startDate) {
      return {
        status: 'UPCOMING',
        timeUntilStart: startDate.getTime() - now.getTime(),
        isActive: false
      };
    } else if (now >= startDate && now <= endDate) {
      return {
        status: 'ONGOING',
        timeUntilEnd: endDate.getTime() - now.getTime(),
        isActive: true
      };
    } else {
      return {
        status: 'COMPLETED',
        isActive: false
      };
    }
  }

  // Fallback
  return {
    status: 'ONGOING',
    isActive: true
  };
}

/**
 * Calculate event duration and determine default trend view
 */
export function calculateEventDuration(event: Event) {
  if (event.isPermanent) {
    return {
      days: Infinity,
      hours: Infinity,
      isMultiDay: true,
      defaultTrendView: 'day' as const
    };
  }

  const startDate = event.startDate ? new Date(event.startDate) : new Date();
  const endDate = event.endDate ? new Date(event.endDate) : new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // Default to 1 day

  const durationMs = endDate.getTime() - startDate.getTime();
  const days = Math.ceil(durationMs / (24 * 60 * 60 * 1000));
  const hours = Math.ceil(durationMs / (60 * 60 * 1000));

  let defaultTrendView: 'hour' | 'day' | 'week' | 'month';

  if (days <= 1) {
    defaultTrendView = 'hour';
  } else if (days <= 7) {
    defaultTrendView = 'day';
  } else if (days <= 30) {
    defaultTrendView = 'week';
  } else {
    defaultTrendView = 'month';
  }

  return {
    days,
    hours,
    isMultiDay: days > 1,
    defaultTrendView
  };
}

/**
 * Check if a scan would be a duplicate based on policy
 */
export function isDuplicateScan(
  studentId: string,
  eventId: string,
  policy: DuplicatePolicy,
  existingScans: ScanLog[]
): { isDuplicate: boolean; lastScanAt?: string; duplicateCount: number } {
  
  if (policy === 'ALLOW_DUPLICATES') {
    return { isDuplicate: false, duplicateCount: 0 };
  }

  const relevantScans = existingScans.filter(scan => 
    scan.studentId === studentId && 
    scan.eventId === eventId &&
    (scan.status === 'success' || scan.status === 'duplicate_override')
  );

  if (relevantScans.length === 0) {
    return { isDuplicate: false, duplicateCount: 0 };
  }

  if (policy === 'ONCE_PER_EVENT') {
    const lastScan = relevantScans[relevantScans.length - 1];
    return {
      isDuplicate: true,
      lastScanAt: lastScan.timestamp,
      duplicateCount: relevantScans.length
    };
  }

  if (policy === 'ONCE_PER_DAY') {
    const today = new Date().toDateString();
    const todayScans = relevantScans.filter(scan => 
      new Date(scan.timestamp).toDateString() === today
    );

    if (todayScans.length > 0) {
      const lastScan = todayScans[todayScans.length - 1];
      return {
        isDuplicate: true,
        lastScanAt: lastScan.timestamp,
        duplicateCount: todayScans.length
      };
    }
  }

  return { isDuplicate: false, duplicateCount: relevantScans.length };
}

/**
 * Format time remaining until event start/end
 */
export function formatTimeRemaining(milliseconds: number): string {
  const days = Math.floor(milliseconds / (24 * 60 * 60 * 1000));
  const hours = Math.floor((milliseconds % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Get duplicate policy display text
 */
export function getDuplicatePolicyText(policy: DuplicatePolicy): string {
  switch (policy) {
    case 'ONCE_PER_EVENT':
      return 'Once per event';
    case 'ONCE_PER_DAY':
      return 'Once per day';
    case 'ALLOW_DUPLICATES':
      return 'Allow duplicates';
  }
}

/**
 * Get event status badge variant
 */
export function getEventStatusVariant(status: EventStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'ONGOING':
      return 'default';
    case 'UPCOMING':
      return 'secondary';
    case 'COMPLETED':
      return 'outline';
  }
}

/**
 * Format date in DD/MM/YYYY format
 */
function formatDateDDMMYYYY(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format event timing for display
 */
export function formatEventTiming(event: any): { date: string; time: string } {
  if (event.isPermanent || event.is_permanent) {
    return {
      date: 'Permanent Event',
      time: 'Always Available'
    };
  }

  // Use enhanced fields if available, fall back to legacy fields
  const startDate = event.startDate || event.start_date || event.date;
  const endDate = event.endDate || event.end_date;
  
  if (!startDate) {
    return {
      date: 'Date TBD',
      time: event.timeRange || event.time_range || 'Time TBD'
    };
  }

  const start = new Date(startDate);
  let dateDisplay = formatDateDDMMYYYY(start);
  let timeDisplay = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (endDate) {
    const end = new Date(endDate);
    const sameDay = start.toDateString() === end.toDateString();
    
    if (sameDay) {
      // Same day: "25/12/2024" and "9:00 AM - 5:00 PM"
      timeDisplay += ' - ' + end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      // Multi-day: "25/12/2024 - 27/12/2024" and "9:00 AM (start)"
      dateDisplay = `${formatDateDDMMYYYY(start)} - ${formatDateDDMMYYYY(end)}`;
      timeDisplay += ' (start)';
    }
  }

  return {
    date: dateDisplay,
    time: timeDisplay
  };
}
