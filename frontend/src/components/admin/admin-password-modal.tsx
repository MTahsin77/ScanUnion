'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Shield } from 'lucide-react';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminName: string;
  tempPassword: string;
}

export function AdminPasswordModal({ isOpen, onClose, adminName, tempPassword }: AdminPasswordModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      toast({
        title: "Password Copied",
        description: "The temporary password has been copied to your clipboard.",
      });
      
      // Reset copy state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy password to clipboard. Please copy manually.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Admin Created Successfully
          </DialogTitle>
          <DialogDescription>
            A new administrator account has been created for <strong>{adminName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg border-2 border-dashed border-muted-foreground/20">
            <Label htmlFor="temp-password" className="text-sm font-medium text-muted-foreground">
              Temporary Password
            </Label>
            <div className="flex items-center gap-2 mt-2">
              <Input
                id="temp-password"
                value={tempPassword}
                readOnly
                className="font-mono text-lg font-bold text-center bg-background"
              />
              <Button
                onClick={handleCopyPassword}
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <div className="text-yellow-600 mt-0.5">⚠️</div>
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Important:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Share this password securely with the new administrator</li>
                  <li>• They must change this password on their first login</li>
                  <li>• This password will not be shown again</li>
                  <li>• The admin account is immediately active</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} className="w-full">
            I've Saved the Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
