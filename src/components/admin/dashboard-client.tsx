'use client';

import type { EventWithStats } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, ScanLine, Clock, Zap, FileText, Settings, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface DashboardClientProps {
  event: EventWithStats;
}

export function DashboardClient({ event: initialEvent }: DashboardClientProps) {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Live Dashboard</h1>
          <p className="text-muted-foreground">
            Showing real-time analytics for: <span className="font-semibold text-primary">{event.name}</span>
          </p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" asChild>
            <Link href={`/admin/events/${event.id}/report`}>
              <FileText className="mr-2 h-4 w-4" />
              View Report
            </Link>
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hourly Scan Trends</CardTitle>
            <CardDescription>Number of scans per hour.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hour" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
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
                <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="userName" type="category" width={80} fontSize={12} tickLine={false} axisLine={false}/>
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Bar dataKey="scans" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
