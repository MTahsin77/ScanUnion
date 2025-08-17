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
import { ArrowLeft, Save, X, Users } from 'lucide-react';
import type { User } from '@/lib/types';

export function CreateEventClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    location: '',
    status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed',
    scanningEnabled: true,
    assignedUsers: [] as string[],
    userLocations: {} as { [userId: string]: string | undefined },
  });

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users?role=user');
        if (response.ok) {
          const userData = await response.json();
          setUsers(userData);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
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

  const handleSave = () => {
    // Basic validation
    if (!formData.name || !formData.date || !formData.time) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, Date, Time).",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would make an API call to create the event
    toast({
      title: "Event Created",
      description: `${formData.name} has been successfully created.`,
    });
    
    router.push('/admin/events');
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
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Enter event location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter event description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
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
