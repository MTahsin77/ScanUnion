'use client';

import type { EventWithStats } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, ScanLine, Clock, Zap, FileText, Edit, ArrowLeft, Activity, CheckCircle, XCircle, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import * as XLSX from 'xlsx';

interface DashboardClientProps {
  event: EventWithStats;
  onBack?: () => void;
}

export function DashboardClient({ event: initialEvent, onBack }: DashboardClientProps) {
  const [event, setEvent] = useState(() => {
    // Ensure event has required statistics fields with defaults
    return {
      ...initialEvent,
      totalScans: initialEvent.totalScans || 0,
      duplicateScans: initialEvent.duplicateScans || 0,
      scansByUser: initialEvent.scansByUser || [],
      scansByHour: initialEvent.scansByHour || [],
      peakHour: initialEvent.peakHour || { hour: 'N/A', scans: 0 },
      logs: initialEvent.logs || []
    };
  });
  
  // State for date filtering
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD format
  });
  
  // Check if this is a multi-day or permanent event
  const isMultiDayEvent = initialEvent.isPermanent || initialEvent.is_permanent || 
    (initialEvent.startDate && initialEvent.endDate && 
     new Date(initialEvent.startDate).toDateString() !== new Date(initialEvent.endDate).toDateString());
  

  
  // Function to fetch live data from backend
  const fetchLiveEventData = async (filterDate?: string) => {
    try {
      // Fetch updated event stats and all scan logs
      const [eventsList, allScanLogs] = await Promise.all([
        api.events.list({ includeStats: true }),
        api.scanLogs.list({ eventId: initialEvent.id })
      ]);
      
      // Find the current event from the list
      const updatedEvent = eventsList.find((e: any) => e.id === initialEvent.id) || initialEvent;

      // Filter scan logs by date if provided
      let filteredScanLogs = allScanLogs;
      if (filterDate) {
        filteredScanLogs = allScanLogs.filter((log: any) => {
          const logDate = new Date(log.timestamp).toISOString().split('T')[0];
          return logDate === filterDate;
        });
      }

      // For multi-day events, calculate stats from filtered data
      let hourlyData, scannerPerformance, totalScans, duplicateScans, uniqueScans;
      
      if (isMultiDayEvent && filterDate) {
        // Calculate stats from filtered scan logs
        const successLogs = filteredScanLogs.filter((log: any) => log.status === 'SUCCESS');
        const duplicateLogs = filteredScanLogs.filter((log: any) => log.status === 'DUPLICATE');
        
        totalScans = filteredScanLogs.length;
        duplicateScans = duplicateLogs.length;
        uniqueScans = new Set(successLogs.map((log: any) => log.student_id)).size;
        

        
        // Calculate hourly distribution for the selected date
        const scansByHour: { [hour: string]: number } = {};
        successLogs.forEach((log: any) => {
          const hour24 = new Date(log.timestamp).getHours();
          const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
          const ampm = hour24 < 12 ? 'AM' : 'PM';
          const hourString = `${hour12} ${ampm}`;
          scansByHour[hourString] = (scansByHour[hourString] || 0) + 1;
        });
        
        hourlyData = Object.entries(scansByHour).map(([hour, scans]) => ({ hour, scans }));
        
        // Calculate scanner performance for the selected date
        const scansByUser: { [userId: string]: number } = {};
        successLogs.forEach((log: any) => {
          if (log.scanner_id) {
            scansByUser[log.scanner_id] = (scansByUser[log.scanner_id] || 0) + 1;
          }
        });
        
        scannerPerformance = Object.entries(scansByUser).map(([userId, scans]) => {
          const scannerName = allScanLogs.find((log: any) => log.scanner_id === userId)?.scanner_name || `Scanner ${userId.slice(-4)}`;
          return { userId, userName: scannerName, scans };
        });
      } else {
        // Use backend-calculated stats for single-day events or when no date filter
        totalScans = updatedEvent.total_scans || 0;
        duplicateScans = updatedEvent.duplicate_scans || 0;
        uniqueScans = updatedEvent.unique_scans || 0;
        
        hourlyData = (updatedEvent.scans_by_hour || []).map((item: any) => {
          const hour24 = parseInt(item.hour.split(':')[0]);
          const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
          const ampm = hour24 < 12 ? 'AM' : 'PM';
          return {
            hour: `${hour12} ${ampm}`,
            scans: item.scans
          };
        });

        scannerPerformance = (updatedEvent.scanner_performance || []).map((item: any) => ({
          userId: item.user_id,
          userName: item.user_name,
          scans: item.scans
        }));
      }

      // Calculate peak hour
      const peakHour = hourlyData.length > 0 
        ? hourlyData.reduce((max, current) => current.scans > max.scans ? current : max, hourlyData[0])
        : { hour: 'N/A', scans: 0 };

      // Update event state with live data
      setEvent(prevEvent => ({
        ...prevEvent,
        ...updatedEvent,
        totalScans,
        duplicateScans,
        unique_scans: uniqueScans,
        scansByUser: scannerPerformance,
        scansByHour: hourlyData,
        peakHour,
        logs: Array.from(
          new Map(
            filteredScanLogs.slice(-20).map((log: any) => [
              log.id,
              {
                id: log.id,
                studentId: log.student_id,
                scannerId: log.scanner_id,
                timestamp: log.timestamp,
                status: log.status.toLowerCase()
              }
            ])
          ).values()
        )
      }));
    } catch (error) {
      console.error('Error fetching live event data:', error);
    }
  };

  useEffect(() => {
    // Fetch initial live data
    fetchLiveEventData();
    
    // Set up real-time updates every 10 seconds
    const interval = setInterval(() => {
      fetchLiveEventData(isMultiDayEvent ? selectedDate : undefined);
    }, 10000);

    return () => clearInterval(interval);
  }, [initialEvent.id]);

  // Handle date changes for multi-day events
  useEffect(() => {
    if (isMultiDayEvent) {
      fetchLiveEventData(selectedDate);
    }
  }, [selectedDate]);

  const userPerformanceData = event.scansByUser?.sort((a, b) => b.scans - a.scans) || [];
  const hourlyTrendData = event.scansByHour || [];

  const handleExportReport = () => {
    // Create workbook with multiple sheets
    const workbook = XLSX.utils.book_new();

    // Event Summary Sheet
    const eventSummary = [
      ['Event Report'],
      ['Event Name', event.name],
      ['Date', new Date(event.date).toDateString()],
      ['Total Scans', event.totalScans],
      ['Peak Hour', event.peakHour?.hour || 'N/A'],
      ['Peak Hour Scans', event.peakHour?.scans || 0],
      ['Active Scanners', event.scansByUser?.length || 0],
      ['Generated On', new Date().toLocaleString()],
    ];
    const eventSummarySheet = XLSX.utils.aoa_to_sheet(eventSummary);
    XLSX.utils.book_append_sheet(workbook, eventSummarySheet, 'Event Summary');

    // Scanner Performance Sheet
    const scannerData = [
      ['Scanner Name', 'Total Scans'],
      ...userPerformanceData.map(user => [user.userName, user.scans])
    ];
    const scannerSheet = XLSX.utils.aoa_to_sheet(scannerData);
    XLSX.utils.book_append_sheet(workbook, scannerSheet, 'Scanner Performance');

    // Hourly Breakdown Sheet
    const hourlyData = [
      ['Hour', 'Scans'],
      ...hourlyTrendData.map(hour => [hour.hour, hour.scans])
    ];
    const hourlySheet = XLSX.utils.aoa_to_sheet(hourlyData);
    XLSX.utils.book_append_sheet(workbook, hourlySheet, 'Hourly Breakdown');

    // Detailed Scan Logs Sheet
    const logData = [
      ['Timestamp', 'Scanner', 'Student ID', 'Status'],
      ...(event.logs || []).map(log => [
        new Date(log.timestamp).toLocaleString(),
        event.scansByUser?.find(u => u.userId === log.scannerId)?.userName || 'Unknown',
        log.studentId,
        log.status
      ])
    ];
    const logSheet = XLSX.utils.aoa_to_sheet(logData);
    XLSX.utils.book_append_sheet(workbook, logSheet, 'Detailed Scan Logs');

    // Generate and download file
    const fileName = `${event.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4">
        <div className="space-y-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Live Dashboard</h1>
            <p className="text-muted-foreground">
              Showing real-time analytics for: <span className="font-semibold text-primary">{event.name}</span>
              {isMultiDayEvent && selectedDate && (
                <span className="ml-2 text-sm">
                  • {new Date(selectedDate).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>
          {isMultiDayEvent && (
            <div className="flex items-center gap-2">
              <Label htmlFor="date-picker" className="text-sm font-medium">
                <Calendar className="w-4 h-4 inline mr-1" />
                Select Date:
              </Label>
              <Input
                id="date-picker"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
                min={initialEvent.startDate ? new Date(initialEvent.startDate).toISOString().split('T')[0] : undefined}
                max={initialEvent.endDate ? new Date(initialEvent.endDate).toISOString().split('T')[0] : undefined}
              />
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-1">
           <Button variant="outline" onClick={() => handleExportReport()}>
            <FileText className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/events/${initialEvent.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Event
            </Link>
          </Button>
          {onBack && (
            <Button variant="outline" onClick={onBack} size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Students</CardTitle>
            <ScanLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(event.unique_scans || event.uniqueScans || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">students checked in</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duplicate Scans</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(event.duplicateScans || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">duplicate attempts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Scanners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{event.scansByUser?.length || 0}</div>
            <p className="text-xs text-muted-foreground">users currently scanning</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userPerformanceData[0]?.userName || userPerformanceData[0]?.user_name || 'No data'}</div>
            <p className="text-xs text-muted-foreground">{(userPerformanceData[0]?.scans || 0).toLocaleString()} scans</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Hourly Scan Trends</CardTitle>
            <CardDescription>Number of scans per hour.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="hour" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <YAxis 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Bar dataKey="scans" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Scanner Performance</CardTitle>
            <CardDescription>Total scans by each user.</CardDescription>
          </CardHeader>
          <CardContent>
             <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userPerformanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis 
                  type="number" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: '#000000' }}
                />
                <YAxis 
                  dataKey="userName" 
                  type="category" 
                  width={80} 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: '#000000' }}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Bar dataKey="scans" fill="#9CA3AF" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Scanner Logs
          </CardTitle>
          <CardDescription>Live feed of scanning activity.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {(event.logs || []).slice().reverse().map((log, index) => {
              const scanner = event.scansByUser?.find(u => u.userId === log.scannerId);
              const StatusIcon = log.status === 'success' ? CheckCircle : XCircle;
              const statusColor = log.status === 'success' ? 'text-green-600' : 'text-red-600';
              
              return (
                <div key={`${log.id}-${log.timestamp}-${index}`} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                    <div>
                      <p className="text-sm font-medium">Student ID: {log.studentId}</p>
                      <p className="text-xs text-muted-foreground">
                        Scanned by {scanner?.userName || 'Unknown'} • {new Date(log.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                    log.status === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {log.status === 'success' ? 'Success' : 'Duplicate'}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
