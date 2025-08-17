'use client';

import type { EventWithStats } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, ScanLine, Clock, Zap, FileText, Settings, CalendarPlus, ArrowLeft, Activity, CheckCircle, XCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

interface DashboardClientProps {
  event: EventWithStats;
  onBack?: () => void;
}

export function DashboardClient({ event: initialEvent, onBack }: DashboardClientProps) {
  const [event, setEvent] = useState(initialEvent);
  
  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setEvent((prevEvent) => {
        const newTotalScans = prevEvent.totalScans + Math.floor(Math.random() * 5);
        const lastHourData = prevEvent.scansByHour[prevEvent.scansByHour.length - 1];
        
        const updatedScansByHour = [...prevEvent.scansByHour];
        if(lastHourData) {
            updatedScansByHour[updatedScansByHour.length - 1] = {
                ...lastHourData,
                scans: lastHourData.scans + Math.floor(Math.random() * 5),
            };
        }


        return {
          ...prevEvent,
          totalScans: newTotalScans,
          scansByHour: updatedScansByHour,
        };
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const userPerformanceData = event.scansByUser.sort((a, b) => b.scans - a.scans);
  const hourlyTrendData = event.scansByHour;

  const handleExportReport = () => {
    // Create workbook with multiple sheets
    const workbook = XLSX.utils.book_new();

    // Event Summary Sheet
    const eventSummary = [
      ['Event Report'],
      ['Event Name', event.name],
      ['Date', new Date(event.date).toDateString()],
      ['Total Scans', event.totalScans],
      ['Peak Hour', event.peakHour.hour],
      ['Peak Hour Scans', event.peakHour.scans],
      ['Active Scanners', event.scansByUser.length],
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
      ...event.logs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        event.scansByUser.find(u => u.userId === log.scannerId)?.userName || 'Unknown',
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
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-1">
           <Button variant="outline" onClick={() => handleExportReport()}>
            <FileText className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/events">
                <CalendarPlus className="mr-2 h-4 w-4" />
                Manage Events
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
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
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <ScanLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{event.totalScans.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">students checked in</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Hour</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{event.peakHour.hour}</div>
            <p className="text-xs text-muted-foreground">{event.peakHour.scans.toLocaleString()} scans</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Scanners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{event.scansByUser.length}</div>
            <p className="text-xs text-muted-foreground">users currently scanning</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userPerformanceData[0]?.userName || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">{userPerformanceData[0]?.scans.toLocaleString() || '0'} scans</p>
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
            {event.logs.slice().reverse().map((log) => {
              const scanner = event.scansByUser.find(u => u.userId === log.scannerId);
              const StatusIcon = log.status === 'success' ? CheckCircle : XCircle;
              const statusColor = log.status === 'success' ? 'text-green-600' : 'text-red-600';
              
              return (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
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
