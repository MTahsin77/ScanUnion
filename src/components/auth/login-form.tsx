'use client';

import { useState } from 'react';
import { ScannerPinForm } from './scanner-pin-form';
import { AdminLoginForm } from './admin-login-form';
import { Button } from '@/components/ui/button';

export function LoginForm() {
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  if (isAdminLogin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm">
          <AdminLoginForm />
          <div className="flex justify-center mt-4">
            <Button variant="link" size="sm" onClick={() => setIsAdminLogin(false)}>
              Are you a scanning user?
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-xs">
        <ScannerPinForm />
        <div className="flex justify-center mt-4">
          <Button variant="link" size="sm" onClick={() => setIsAdminLogin(true)}>
            Are you an admin?
          </Button>
        </div>
      </div>
    </div>
  );
}
