'use client';

import { useState } from 'react';
import type { EventWithStats } from '@/lib/types';
import { generateEventSummary } from '@/ai/flows/generate-event-summary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Bot, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface EventReportClientProps {
  event: EventWithStats;
}

export function EventReportClient({ event }: EventReportClientProps) {
  const { toast } = useToast();
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setSummary('');

    // Format event data for the AI prompt
    const eventData = `
      Event Name: ${event.name}
      Date: ${event.date}
      Total Attendees: ${event.totalScans}
      Peak Hour: ${event.peakHour.hour} with ${event.peakHour.scans} scans.
      Duplicate Scan Attempts: ${event.duplicateScans}
      
      Hourly Breakdown:
      ${event.scansByHour.map((h) => `- ${h.hour}: ${h.scans} scans`).join('\n')}
      
      Scanner Performance:
      ${event.scansByUser.map((u) => `- ${u.userName}: ${u.scans} scans`).join('\n')}
    `;

    try {
      const result = await generateEventSummary({ eventData });
      setSummary(result.summary);
      toast({
        title: 'AI Summary Generated',
        description: 'The event summary has been successfully created.',
      });
    } catch (error) {
      console.error('AI Summary Generation Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error Generating Summary',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
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
          <CardTitle>AI-Powered Summary</CardTitle>
          <CardDescription>Click the button to generate an intelligent summary of the event highlights and patterns.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleGenerateSummary} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Bot className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Generating...' : 'Generate AI Summary'}
          </Button>
          {(isLoading || summary) && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                {isLoading && <p className="text-muted-foreground">The AI is analyzing the data...</p>}
                {summary && <p className="text-sm whitespace-pre-wrap">{summary}</p>}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
      
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
