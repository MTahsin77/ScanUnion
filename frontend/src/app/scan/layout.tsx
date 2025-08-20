'use client';

import { Logo } from '@/components/logo';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated scanner
    const scannerUser = localStorage.getItem('scanunion_user');
    
    if (!scannerUser) {
      router.push('/login');
      return;
    }

    try {
      const scanner = JSON.parse(scannerUser);
      const userData = scanner.user || scanner; // Handle both data structures
      
      if (!userData || userData.role !== 'USER') {
        // Not a scanner user, redirect to login
        localStorage.removeItem('scanunion_user');
        router.push('/login');
        return;
      }
      
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error parsing scanner user:', error);
      localStorage.removeItem('scanunion_user');
      router.push('/login');
      return;
    }
    
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo clickable={true} redirectTo="/scan/events" />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
