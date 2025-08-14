'use client';

import { useState } from 'react';
import type { EventWithStats } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface EventReportClientProps {
  event: EventWithStats;
}

export function EventReportClient({ event }: EventReportClientProps) {
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Event Report</h1>
          <p className="text-muted-foreground">
            Detailed analytics for: <span className="font-semibold text-primary">{event.name}</span>
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Stat Cards */}
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Scan Logs</CardTitle>
            <CardDescription>A detailed log of all scan activities during the event.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="max-h-[400px] overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student ID</TableHead>
                            <TableHead>Scanner</TableHead>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {event.logs.slice(0, 100).map((log) =>( // show first 100 logs for performance
                            <TableRow key={log.id}>
                                <TableCell>{log.studentId}</TableCell>
                                <TableCell>{event.scansByUser.find(u => u.userId === log.scannerId)?.userName || 'Unknown'}</TableCell>
                                <TableCell>{new Date(log.timestamp).toLocaleTimeString()}</TableCell>
                                <TableCell className='capitalize'>{log.status}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
