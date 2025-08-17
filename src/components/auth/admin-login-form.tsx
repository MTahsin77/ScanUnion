"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { ChangePasswordModal } from './change-password-modal';

export function AdminLoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [changePasswordModal, setChangePasswordModal] = useState({
    isOpen: false,
    userId: '',
    userEmail: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data in both localStorage and cookies
        localStorage.setItem('scanunion_admin', JSON.stringify(data.user));
        document.cookie = `scanunion_admin=${JSON.stringify(data.user)}; path=/; max-age=86400`;

        if (data.user.isFirstLogin) {
          // Show change password modal
          setChangePasswordModal({
            isOpen: true,
            userId: data.user.id,
            userEmail: data.user.email
          });
        } else {
          // Redirect to admin dashboard
          router.push('/admin');
        }
      } else {
        toast({
          title: "Login Failed",
          description: data.error || "Invalid credentials.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChanged = () => {
    // Update stored user data to reflect password change
    const storedUser = localStorage.getItem('scanunion_admin');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      user.isFirstLogin = false;
      localStorage.setItem('scanunion_admin', JSON.stringify(user));
    }
    
    toast({
      title: "Welcome!",
      description: "Password changed successfully. Redirecting to dashboard...",
    });
    
    setTimeout(() => {
      router.push('/admin');
    }, 1000);
  };

  const handleClosePasswordModal = () => {
    // Don't allow closing without changing password
    toast({
      title: "Password Change Required",
      description: "You must change your temporary password to continue.",
      variant: "destructive",
    });
  };

  return (
    <>
      <Card className="w-full max-w-sm">
        <form onSubmit={handleLogin}>
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <Logo />
            </div>
            <CardTitle className="text-2xl font-headline">Admin Login</CardTitle>
            <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@example.com" 
                required 
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <ChangePasswordModal
        isOpen={changePasswordModal.isOpen}
        onClose={handleClosePasswordModal}
        onPasswordChanged={handlePasswordChanged}
        userId={changePasswordModal.userId}
        userEmail={changePasswordModal.userEmail}
      />
    </>
  );
}
