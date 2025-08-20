'use client';

import { SettingsClient } from '@/components/admin/settings-client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { User } from '@/lib/types';

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        // Check if user is authenticated
        const adminUser = localStorage.getItem('scanunion_admin');
        if (!adminUser) {
          window.location.href = '/login';
          return;
        }

        const data = await api.users.list();
        console.log('Users data received:', data); // Debug log
        
        // Ensure data is an array
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error('Expected array but got:', data);
          setUsers([]);
        }
      } catch (error: any) {
        console.error('Error fetching users:', error);
        setError(error.message || 'Failed to fetch users');
        setUsers([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return <SettingsClient users={users} />;
}
