'use client';

import type { Event } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface EventListClientProps {
  events: Event[];
}

export function EventListClient({ events }: EventListClientProps) {
  const [eventList, setEventList] = useState<Event[]>(events);
  const { toast } = useToast();
  const [deleteEventModal, setDeleteEventModal] = useState({
    isOpen: false,
    event: null as Event | null
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'default';
      case 'completed':
        return 'default';
      case 'upcoming':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const toggleScanning = (eventId: string) => {
    setEventList(prevEvents => 
      prevEvents.map(event => 
        event.id === eventId 
          ? { ...event, scanningEnabled: !event.scanningEnabled }
          : event
      )
    );
    
    const event = eventList.find(e => e.id === eventId);
    const newStatus = !event?.scanningEnabled;
    
    toast({
      title: "Scanning Updated",
      description: `Scanning ${newStatus ? 'enabled' : 'disabled'} for ${event?.name}`,
    });
  };

  const handleViewReport = (eventId: string) => {
    window.location.href = `/admin/events/${eventId}/report`;
  };

  const handleEditEvent = (eventId: string) => {
    window.location.href = `/admin/events/${eventId}/edit`;
  };

  const handleArchiveEvent = (eventId: string) => {
    const event = eventList.find(e => e.id === eventId);
    toast({
      title: "Archive Event",
      description: `Archive functionality for ${event?.name} coming soon`,
    });
  };

  const handleDeleteEvent = (event: Event) => {
    setDeleteEventModal({
      isOpen: true,
      event: event
    });
  };

  const handleCloseDeleteModal = () => {
    setDeleteEventModal({
      isOpen: false,
      event: null
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteEventModal.event) return;

    try {
      const response = await fetch(`/api/events/${deleteEventModal.event.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Event Deleted",
          description: `${deleteEventModal.event.name} has been deleted successfully.`,
        });
        setEventList(prevEvents => prevEvents.filter(e => e.id !== deleteEventModal.event?.id));
        handleCloseDeleteModal();
      } else {
        throw new Error('Failed to delete event');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Event Management</h1>
          <p className="text-muted-foreground">Create, view, and manage all your events.</p>
        </div>
        <Button asChild>
          <Link href="/admin/events/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
          <CardDescription>A list of all past, ongoing, and upcoming events.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scanning</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventList.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.name}</TableCell>
                  <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={getStatusVariant(event.status)} 
                      className={`capitalize ${event.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-100/80' : ''}`}
                    >
                      {event.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleScanning(event.id)}
                      className="p-0 h-auto"
                    >
                      <Badge 
                        variant={event.scanningEnabled ? 'default' : 'destructive'} 
                        className="bg-opacity-20 text-opacity-100 cursor-pointer hover:bg-opacity-30 transition-colors"
                      >
                        {event.scanningEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewReport(event.id)}>
                          View Report
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditEvent(event.id)}>
                          Edit Event
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleArchiveEvent(event.id)}>
                          Archive Event
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteEvent(event)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Event
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={deleteEventModal.isOpen} onOpenChange={handleCloseDeleteModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Event: {deleteEventModal.event?.name}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
              <p className="text-sm text-destructive font-medium">
                Warning: This will permanently delete the event and all associated data including scan logs.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDeleteModal}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
