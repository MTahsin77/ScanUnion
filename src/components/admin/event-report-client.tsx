'use client';

import type { EventWithStats } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface EventReportClientProps {
  event: EventWithStats;
}

export function EventReportClient({ event }: EventReportClientProps) {
  
  const exportToExcel = () => {
    try {
      console.log('Starting export for event:', event.name);
      
      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Event Summary Sheet
      const summaryData = [
        ['Event Summary'],
        ['Event Name', event.name],
        ['Total Scans', event.totalScans],
        ['Duplicate Scans', event.duplicateScans],
        ['Peak Hour', event.peakHour.hour],
        ['Peak Hour Scans', event.peakHour.scans],
        ['Active Scanners', event.scansByUser.length],
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Event Summary');

      // Scanner Performance Sheet
      const scannerData = [
        ['Scanner Name', 'Total Scans'],
        ...event.scansByUser.map(user => [user.userName, user.scans])
      ];
      const scannerSheet = XLSX.utils.aoa_to_sheet(scannerData);
      XLSX.utils.book_append_sheet(workbook, scannerSheet, 'Scanner Performance');

      // Hourly Breakdown Sheet
      const hourlyData = [
        ['Hour', 'Scans'],
        ...event.scansByHour.map(hour => [hour.hour, hour.scans])
      ];
      const hourlySheet = XLSX.utils.aoa_to_sheet(hourlyData);
      XLSX.utils.book_append_sheet(workbook, hourlySheet, 'Hourly Breakdown');

      // Detailed Scan Logs Sheet
      const logsData = [
        ['Student ID', 'Scanner', 'Timestamp', 'Status'],
        ...event.logs.map(log => [
          log.studentId,
          event.scansByUser.find(u => u.userId === log.scannerId)?.userName || 'Unknown',
          new Date(log.timestamp).toLocaleString(),
          log.status
        ])
      ];
      const logsSheet = XLSX.utils.aoa_to_sheet(logsData);
      XLSX.utils.book_append_sheet(workbook, logsSheet, 'Scan Logs');

      // Test different filename approaches
      const sanitizedName = event.name.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
      const timestamp = new Date().toISOString().slice(0, 10);
      const fileName = `Event_Report_${sanitizedName}_${timestamp}.xlsx`;
      
      console.log('Generated filename:', fileName);
      console.log('Filename length:', fileName.length);
      console.log('Contains special chars:', /[^\w\s\-_.]/.test(fileName));

      // Try multiple download approaches
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' });
      
      console.log('Blob size:', blob.size);
      console.log('Blob type:', blob.type);

      // Method 1: Standard approach
      if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
        // IE/Edge
        (window.navigator as any).msSaveOrOpenBlob(blob, fileName);
        console.log('Used IE/Edge method');
      } else {
        // Modern browsers
        const url = window.URL.createObjectURL(blob);
        console.log('Created URL:', url);
        
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.download = fileName;
        
        console.log('Link download attribute:', link.download);
        console.log('Link href:', link.href);
        
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          console.log('Cleanup completed');
        }, 100);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Event Report</h1>
          <p className="text-muted-foreground">
            Detailed analytics for: <span className="font-semibold text-primary">{event.name}</span>
          </p>
        </div>
        <Button onClick={exportToExcel} className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Export to Excel
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
                        {event.logs.map((log) =>(
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
