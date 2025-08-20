'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, X, Users, Calendar, Clock, Shield } from 'lucide-react';
import type { User, DuplicatePolicy } from '@/lib/types';
import { getDuplicatePolicyText } from '@/lib/event-utils';

export function CreateEventClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    isPermanent: false,
    duplicatePolicy: 'ONCE_PER_EVENT' as DuplicatePolicy,
    scanningEnabled: true,
    assignedUsers: [] as string[],
    userLocations: {} as { [userId: string]: string | undefined },
  });

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { api, getCurrentUserRole } = await import('@/lib/api');
        
        // Only fetch users if current user is admin
        const userRole = getCurrentUserRole();
        if (userRole !== 'admin') {
          console.warn('⚠️ Only admin users can fetch user list');
          setUsers([]); // Set empty array for non-admin users
          return;
        }
        
        const userData = await api.users.list({ role: 'USER' });
        setUsers(userData);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]); // Set empty array on error
      }
    };
    fetchUsers();
  }, []);

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUserToggle = (userId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      assignedUsers: checked 
        ? [...prev.assignedUsers, userId]
        : prev.assignedUsers.filter(id => id !== userId),
      userLocations: checked 
        ? prev.userLocations
        : { ...prev.userLocations, [userId]: undefined }
    }));
  };

  const handleUserLocationChange = (userId: string, location: string) => {
    setFormData(prev => ({
      ...prev,
      userLocations: {
        ...prev.userLocations,
        [userId]: location
      }
    }));
  };

  const handleSave = async () => {
    try {
      // Basic validation
      if (!formData.name) {
        toast({
          title: "Validation Error",
          description: "Event name is required.",
          variant: "destructive",
        });
        return;
      }

      // Validate dates for non-permanent events
      if (!formData.isPermanent) {
        if (!formData.startDate) {
          toast({
            title: "Validation Error",
            description: "Start date is required for non-permanent events.",
            variant: "destructive",
          });
          return;
        }

        // Validate end date is after start date
        if (formData.endDate && formData.startDate) {
          const startDateTime = new Date(`${formData.startDate}T${formData.startTime || '00:00'}`);
          const endDateTime = new Date(`${formData.endDate}T${formData.endTime || '23:59'}`);
          
          if (endDateTime <= startDateTime) {
            toast({
              title: "Validation Error",
              description: "End date must be after start date.",
              variant: "destructive",
            });
            return;
          }
        }
      }

      const { api } = await import('@/lib/api');
      
      // Prepare the event data
      const eventData = {
        name: formData.name,
        description: formData.description,
        startDate: formData.isPermanent ? null : (formData.startDate && formData.startTime ? 
          new Date(`${formData.startDate}T${formData.startTime}`).toISOString() : null),
        endDate: formData.isPermanent ? null : (formData.endDate && formData.endTime ? 
          new Date(`${formData.endDate}T${formData.endTime}`).toISOString() : null),
        location: formData.location,
        isPermanent: formData.isPermanent,
        duplicatePolicy: formData.duplicatePolicy,
        scanningEnabled: formData.scanningEnabled,
        assignedUsers: formData.assignedUsers,
        userLocations: formData.userLocations,
      };

      await api.events.create(eventData);
      
      toast({
        title: "Event Created",
        description: `${formData.name} has been successfully created.`,
      });
      
      // Navigate back to events list
      router.push('/admin/events');
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    router.push('/admin/events');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Create New Event</h1>
            <p className="text-muted-foreground">Set up a new event for scanning and management.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>Basic information about your event.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Event Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter event name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Event location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Event description (optional)"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Event Timing Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Event Timing
              </CardTitle>
              <CardDescription>Configure when the event runs and its status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="permanent"
                  checked={formData.isPermanent}
                  onCheckedChange={(checked) => handleInputChange('isPermanent', checked)}
                />
                <Label htmlFor="permanent" className="text-sm font-medium">
                  Permanent Event
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {formData.isPermanent 
                  ? "This event will always be ongoing with no start or end date."
                  : "Event will have specific start and end times with auto-calculated status."}
              </p>

              {!formData.isPermanent && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => handleInputChange('startTime', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date (Optional)</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => handleInputChange('endTime', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Status Logic:</strong><br/>
                      • Before start date: <strong>Upcoming</strong><br/>
                      • Between start and end date: <strong>Ongoing</strong><br/>
                      • After end date: <strong>Completed</strong>
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Duplicate Policy Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Duplicate Scan Policy
              </CardTitle>
              <CardDescription>Configure how duplicate scans are handled for this event.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="duplicatePolicy">Policy</Label>
                <Select value={formData.duplicatePolicy} onValueChange={(value: DuplicatePolicy) => handleInputChange('duplicatePolicy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONCE_PER_EVENT">Once per event</SelectItem>
                    <SelectItem value="ONCE_PER_DAY">Once per day</SelectItem>
                    <SelectItem value="ALLOW_DUPLICATES">Allow duplicates</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {formData.duplicatePolicy === 'ONCE_PER_EVENT' && (
                    <>
                      <strong>Once per event:</strong> Only 1 scan accepted per student ID for the entire event.
                      Duplicates will be flagged with override option.
                    </>
                  )}
                  {formData.duplicatePolicy === 'ONCE_PER_DAY' && (
                    <>
                      <strong>Once per day:</strong> 1 scan per student ID per calendar day.
                      Duplicates on the same day will be flagged with override option.
                    </>
                  )}
                  {formData.duplicatePolicy === 'ALLOW_DUPLICATES' && (
                    <>
                      <strong>Allow duplicates:</strong> No restrictions on duplicate scans.
                      All scans will be accepted and counted.
                    </>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>


        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scanning Settings</CardTitle>
              <CardDescription>Configure scanning options for this event.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch
                  id="scanning-enabled"
                  checked={formData.scanningEnabled}
                  onCheckedChange={(checked) => handleInputChange('scanningEnabled', checked)}
                />
                <Label htmlFor="scanning-enabled">Enable Scanning</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Assigned Scanners
              </CardTitle>
              <CardDescription>
                Select which users can scan for this event. Only assigned users will see this event on their scanner dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user: User) => (
                  <div key={user.id} className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={user.id}
                        checked={formData.assignedUsers.includes(user.id)}
                        onCheckedChange={(checked) => handleUserToggle(user.id, checked as boolean)}
                      />
                      <Label htmlFor={user.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{user.name}</span>
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            user.enabled 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.enabled ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                      </Label>
                    </div>
                    {formData.assignedUsers.includes(user.id) && (
                      <div className="ml-7">
                        <Label htmlFor={`location-${user.id}`} className="text-sm text-muted-foreground">
                          Location (optional)
                        </Label>
                        <Input
                          id={`location-${user.id}`}
                          placeholder="e.g., Main Entrance, Building A"
                          value={formData.userLocations[user.id] || ''}
                          onChange={(e) => handleUserLocationChange(user.id, e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>
                ))}
                
                {formData.assignedUsers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No users assigned to this event</p>
                    <p className="text-sm">Select users above to allow them to scan for this event</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

