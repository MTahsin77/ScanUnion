'use client';

import { AdminTopNav } from '@/components/admin/admin-topnav';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated admin
    const adminUser = localStorage.getItem('scanunion_admin');
    
    if (!adminUser) {
      router.push('/login');
      return;
    }

    try {
      const admin = JSON.parse(adminUser);
      if (!admin.user || admin.user.role !== 'ADMIN') {
        // Not an admin user, redirect to scanner login
        localStorage.removeItem('scanunion_admin');
        router.push('/login');
        return;
      }
      
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error parsing admin user:', error);
      localStorage.removeItem('scanunion_admin');
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
    <div className="min-h-screen bg-gray-50">
      <AdminTopNav />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
