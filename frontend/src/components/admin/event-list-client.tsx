'use client';

import type { Event } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal, Trash2, Archive } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { formatEventTiming } from '@/lib/event-utils';
import { api } from '@/lib/api';

interface EventListClientProps {
  events: Event[];
}

export function EventListClient({ events }: EventListClientProps) {
  const [eventList, setEventList] = useState<Event[]>(events);
  const { toast } = useToast();
  const [loadingEvents, setLoadingEvents] = useState<Set<string>>(new Set());
  const [deleteEventModal, setDeleteEventModal] = useState({
    isOpen: false,
    event: null as Event | null
  });

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ongoing':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'upcoming':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ongoing':
        return 'bg-green-100 text-green-800 hover:bg-green-100/80 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100/80 border-blue-200';
      case 'upcoming':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-100/80 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100/80 border-gray-200';
    }
  };

  const toggleScanning = async (eventId: string) => {
    const event = eventList.find(e => e.id === eventId);
    if (!event || loadingEvents.has(eventId)) return;

    const currentScanning = event.scanningEnabled !== undefined ? event.scanningEnabled : 
                           (event.scanning_enabled !== undefined ? event.scanning_enabled : false);
    const newStatus = !currentScanning;

    // Add to loading set
    setLoadingEvents(prev => new Set([...prev, eventId]));

    try {
      // Optimistically update the UI
      setEventList(prevEvents => 
        prevEvents.map(e => {
          if (e.id === eventId) {
            return { 
              ...e, 
              scanningEnabled: newStatus,
              scanning_enabled: newStatus 
            };
          }
          return e;
        })
      );

      // Call backend API
      await api.events.update(eventId, { 
        scanning_enabled: newStatus 
      });
      
      toast({
        title: "Scanning Updated",
        description: `Scanning ${newStatus ? 'enabled' : 'disabled'} for ${event.name}`,
      });
    } catch (error) {
      // Revert optimistic update on error
      setEventList(prevEvents => 
        prevEvents.map(e => {
          if (e.id === eventId) {
            return { 
              ...e, 
              scanningEnabled: currentScanning,
              scanning_enabled: currentScanning 
            };
          }
          return e;
        })
      );
      
      toast({
        title: "Error",
        description: "Failed to update scanning status. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Remove from loading set
      setLoadingEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  const handleViewReport = (eventId: string) => {
    window.location.href = `/admin/events/${eventId}/report`;
  };

  const handleEditEvent = (eventId: string) => {
    window.location.href = `/admin/events/${eventId}/edit`;
  };

  const handleArchiveEvent = async (eventId: string) => {
    const event = eventList.find(e => e.id === eventId);
    if (!event) return;

    try {
      // For now, we'll update the event status to 'archived' 
      // You can modify this based on your backend implementation
      await api.events.update(eventId, { 
        scanning_enabled: false  // Disable scanning when archiving
      });

      // Remove from current list (simulate archiving)
      setEventList(prevEvents => prevEvents.filter(e => e.id !== eventId));
      
      toast({
        title: "Event Archived",
        description: `${event.name} has been archived successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive event. Please try again.",
        variant: "destructive",
      });
    }
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
      await api.events.delete(deleteEventModal.event.id);
      
      toast({
        title: "Event Deleted",
        description: `${deleteEventModal.event.name} has been deleted successfully.`,
      });
      setEventList(prevEvents => prevEvents.filter(e => e.id !== deleteEventModal.event?.id));
      handleCloseDeleteModal();
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
              {eventList.map((event) => {
                // Handle both camelCase and snake_case field names from backend
                const scanningEnabled = event.scanningEnabled !== undefined ? event.scanningEnabled : 
                                       (event.scanning_enabled !== undefined ? event.scanning_enabled : false);
                const timing = formatEventTiming(event);
                
                return (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.name}</TableCell>
                    <TableCell>{timing.date}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusVariant(event.status)} 
                        className={`capitalize ${getStatusColor(event.status)}`}
                      >
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleScanning(event.id)}
                        disabled={loadingEvents.has(event.id)}
                        className="p-0 h-auto"
                      >
                        <Badge 
                          variant={scanningEnabled ? 'default' : 'destructive'} 
                          className={`cursor-pointer transition-all duration-200 ${
                            scanningEnabled 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200'
                          } ${loadingEvents.has(event.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {loadingEvents.has(event.id) ? 'Updating...' : (scanningEnabled ? 'Enabled' : 'Disabled')}
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
                          <Archive className="mr-2 h-4 w-4" />
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
                );
              })}
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
