"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { Asterisk, Delete } from 'lucide-react';
import { MOCK_USERS } from '@/lib/mock-data';

export function ScannerPinForm() {
  const [pin, setPin] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleKeyPress = (key: string) => {
    if (pin.length < 6) {
      setPin(pin + key);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = MOCK_USERS.find((u) => u.pin === pin);
    if (user) {
      // In a real app, you'd set a session here.
      if (typeof window !== 'undefined') {
        localStorage.setItem('scanunion_user', JSON.stringify(user));
      }
      toast({
        title: `Welcome, ${user.name}!`,
        description: 'Redirecting to event selection...',
      });
      router.push('/scan/events');
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid PIN',
        description: 'The PIN you entered is incorrect. Please try again.',
      });
      setPin('');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-xs">
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Logo />
            </div>
            <CardTitle className="text-2xl font-headline">Scanner Login</CardTitle>
            <CardDescription>Enter your 4-6 digit PIN.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex h-12 w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-center text-2xl tracking-[0.5em]">
              {pin.split('').map((_, i) => (
                <Asterisk key={i} className="h-5 w-5" />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <Button key={num} type="button" variant="outline" className="h-14 text-xl" onClick={() => handleKeyPress(String(num))}>
                  {num}
                </Button>
              ))}
              <div />
              <Button type="button" variant="outline" className="h-14 text-xl" onClick={() => handleKeyPress('0')}>
                0
              </Button>
              <Button type="button" variant="ghost" className="h-14" onClick={handleDelete}>
                <Delete className="h-6 w-6" />
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={pin.length < 4}>
              Login
            </Button>
            <Button variant="link" size="sm" asChild>
              <Link href="/login">Are you an admin?</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
