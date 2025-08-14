'use client';

import type { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Download, Calendar as CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';

interface SettingsClientProps {
  users: User[];
}

export function SettingsClient({ users }: SettingsClientProps) {
  const [date, setDate] = useState<DateRange | undefined>();

  return (
    <div className="space-y-6">
       <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Settings</h1>
          <p className="text-muted-foreground">Manage users and export reports.</p>
        </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* User Management */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New User</CardTitle>
              <CardDescription>Create a new user with PIN access for scanning.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="John Doe" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="pin">PIN</Label>
                <Input id="pin" placeholder="Enter a 4-6 digit PIN" />
              </div>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </CardContent>
          </Card>
          
           <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>A list of all users with access to scan at events.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>PIN</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>
                        <span className="font-mono tracking-widest">{user.pin}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.enabled ? 'default' : 'secondary'}>{user.enabled ? 'Enabled' : 'Disabled'}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </div>

        {/* Report Generation */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Reports</CardTitle>
              <CardDescription>Generate a comprehensive report for a specific date range.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid gap-2">
                <Label>Date range</Label>
                 <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(date.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
