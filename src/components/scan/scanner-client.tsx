'use client';

import { useState, useEffect, FormEvent } from 'react';
import type { Event, User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, QrCode, WifiOff, Wifi, User as UserIcon, Home, LogOut } from 'lucide-react';

interface ScannerClientProps {
  event: Event;
}

type ScanStatus = 'idle' | 'success' | 'duplicate' | 'offline_success';

export function ScannerClient({ event }: ScannerClientProps) {
  const [user, setUser] = useState<User | null>(null);
  const [personalScanCount, setPersonalScanCount] = useState(0);
  const [studentId, setStudentId] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [scannedId, setScannedId] = useState('');
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem('scanunion_user');
    localStorage.removeItem('scanunion_admin');
    window.location.href = '/login';
  };

  const handleHome = () => {
    window.location.href = '/scan';
  };

  useEffect(() => {
    // Get user from local storage
    const storedUser = localStorage.getItem('scanunion_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Check initial online status
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    // Set up online/offline listeners
    const handleOnline = () => {
        setIsOnline(true);
        toast({ title: "You're back online!", description: "Offline scans will be synced.", variant: 'default' });
        // Here you would trigger the sync of queued scans
    };
    const handleOffline = () => {
        setIsOnline(false);
        toast({ title: "You've gone offline.", description: "Scans will be saved locally.", variant: 'destructive' });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);
  
  useEffect(() => {
    if (scanStatus !== 'idle') {
      const timer = setTimeout(() => setScanStatus('idle'), 2000);
      return () => clearTimeout(timer);
    }
  }, [scanStatus]);

  const handleScan = (e: FormEvent) => {
    e.preventDefault();
    if (!studentId) return;

    setScannedId(studentId);

    // Mock logic for scan result
    if (Math.random() > 0.1) { // 90% success rate
        if(!isOnline) {
            // Queue scan locally
            setScanStatus('offline_success');
        } else {
            setScanStatus('success');
        }
      setPersonalScanCount(prev => prev + 1);
    } else {
      setScanStatus('duplicate');
    }

    setStudentId('');
  };
  
  const statusInfo = {
      success: { icon: CheckCircle, color: "text-green-500", message: "Scan Successful"},
      duplicate: { icon: XCircle, color: "text-red-500", message: "Duplicate Scan"},
      offline_success: { icon: CheckCircle, color: "text-blue-500", message: "Saved Offline"},
  }

  return (
    <div className="container mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserIcon className="w-4 h-4" />
            <span>{user?.name || 'Scanner'}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 text-sm font-semibold ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
              {isOnline ? <Wifi className="w-4 h-4"/> : <WifiOff className="w-4 h-4"/>}
              <span>{isOnline ? 'Online' : 'Offline Mode'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleHome} className="gap-1">
              <Home className="w-4 h-4" />
              Home
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-center font-headline text-2xl">{event.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="rounded-lg border p-4 bg-card">
              <p className="text-sm font-medium text-foreground">Your Scans</p>
              <p className="text-4xl font-bold text-primary">{personalScanCount}</p>
            </div>
            <div className="rounded-lg border p-4 bg-card">
              <p className="text-sm font-medium text-foreground">Event Total</p>
              <p className="text-4xl font-bold text-primary">1,253</p>
            </div>
          </div>
          
          <div className="relative h-48 flex items-center justify-center overflow-hidden">
            <AnimatePresence>
            {scanStatus !== 'idle' && (() => {
                const StatusIcon = statusInfo[scanStatus].icon;
                return (
                    <motion.div
                        key={scanStatus}
                        initial={{ opacity: 0, y: 50, scale: 0.5 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.5, transition: { duration: 0.3 } }}
                        className={`text-center space-y-2 ${statusInfo[scanStatus].color}`}
                    >
                        <StatusIcon className="w-20 h-20 mx-auto" />
                        <p className="text-xl font-semibold">{statusInfo[scanStatus].message}</p>
                        <p className="font-mono text-sm">{scannedId}</p>
                    </motion.div>
                );
            })()}
            </AnimatePresence>
          </div>

          <form onSubmit={handleScan} className="flex gap-2">
            <Input
              type="text"
              placeholder="Scan or enter Student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              autoFocus
              className="text-center text-lg h-12"
            />
            <Button type="submit" size="lg" className="h-12">
              <QrCode className="mr-2 h-5 w-5" />
              Scan
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
