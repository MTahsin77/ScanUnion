'use client';

import type { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlusCircle, LogOut, UserPlus, Shield, Users, Edit2, Trash2, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AdminPasswordModal } from './admin-password-modal';

interface SettingsClientProps {
  users: User[];
}

export function SettingsClient({ users }: SettingsClientProps) {
  const { toast } = useToast();
  
  // Ensure users is always an array
  const safeUsers = Array.isArray(users) ? users : [];
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    pin: '',
    role: 'USER' as 'ADMIN' | 'USER'
  });
  const [newAdminData, setNewAdminData] = useState({
    name: '',
    email: '',
    role: 'ADMIN' as 'ADMIN' | 'USER'
  });
  const [passwordModal, setPasswordModal] = useState({
    isOpen: false,
    adminName: '',
    tempPassword: ''
  });
  const [editUserModal, setEditUserModal] = useState({
    isOpen: false,
    user: null as User | null
  });
  const [editUserData, setEditUserData] = useState({
    name: '',
    pin: '',
    email: '',
    enabled: true
  });
  const [deleteUserModal, setDeleteUserModal] = useState({
    isOpen: false,
    user: null as User | null
  });

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('scanunion_user');
    localStorage.removeItem('scanunion_admin');
    
    // Redirect to login page
    window.location.href = '/login';
  };

  const generateTempPassword = () => {
    return Math.random().toString(36).slice(-8).toUpperCase();
  };

  // Bulk operations
  const handleSelectAll = () => {
    if (selectedUsers.length === safeUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(safeUsers.map(user => user.id));
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkEnable = async () => {
    try {
      // TODO: Implement bulk enable API call
      toast({
        title: "Users Enabled",
        description: `${selectedUsers.length} users have been enabled.`,
      });
      setSelectedUsers([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enable users.",
        variant: "destructive",
      });
    }
  };

  const handleBulkDisable = async () => {
    try {
      // TODO: Implement bulk disable API call
      toast({
        title: "Users Disabled",
        description: `${selectedUsers.length} users have been disabled.`,
      });
      setSelectedUsers([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disable users.",
        variant: "destructive",
      });
    }
  };

  const handleExportUsers = () => {
    const selectedUserData = safeUsers.filter(user => selectedUsers.includes(user.id));
    const csvContent = [
      ['Name', 'Role', 'Email', 'PIN', 'Status', 'First Login'],
      ...selectedUserData.map(user => [
        user.name,
        user.role === 'ADMIN' ? 'Admin' : 'Scanner',
        user.role === 'ADMIN' ? (user.email || `${user.pin}@example.com`) : '',
        user.pin,
        user.enabled ? 'Enabled' : 'Disabled',
        user.isFirstLogin ? 'Pending' : 'Complete'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Exported ${selectedUsers.length} users to CSV with separate email and PIN columns.`,
    });
  };

  const handleAddUser = async () => {
    if (!newUserData.name || !newUserData.pin) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { api } = await import('@/lib/api');
      await api.users.create({
        name: newUserData.name,
        pin: newUserData.pin,
        role: 'USER',
        enabled: true,
      });

      toast({
        title: "User Added",
        description: `${newUserData.name} has been added as a scanner user.`,
      });
      setNewUserData({ name: '', pin: '', role: 'user' });
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminData.name || !newAdminData.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const tempPassword = generateTempPassword();
    
    try {
      const { api } = await import('@/lib/api');
      const result = await api.users.create({
        name: newAdminData.name,
        email: newAdminData.email,
        pin: newAdminData.email.split('@')[0], // Use email prefix as PIN
        role: 'ADMIN',
        enabled: true,
      });

      // Show password modal with temp password
      setPasswordModal({
        isOpen: true,
        adminName: newAdminData.name,
        tempPassword: result.temp_password || tempPassword
      });
      
      setNewAdminData({ name: '', email: '', role: 'admin' });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create admin user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClosePasswordModal = () => {
    setPasswordModal({
      isOpen: false,
      adminName: '',
      tempPassword: ''
    });
  };

  const handleEditUser = (user: User) => {
    setEditUserData({
      name: user.name,
      pin: user.pin || '',
      email: user.role === 'admin' ? `${user.pin}@example.com` : '',
      enabled: user.enabled
    });
    setEditUserModal({
      isOpen: true,
      user: user
    });
  };

  const handleCloseEditModal = () => {
    setEditUserModal({
      isOpen: false,
      user: null
    });
    setEditUserData({
      name: '',
      pin: '',
      email: '',
      enabled: true
    });
  };

  const handleSaveUser = async () => {
    if (!editUserData.name || !editUserData.pin) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { api } = await import('@/lib/api');
      await api.users.update(editUserModal.user?.id!, {
        name: editUserData.name,
        pin: editUserData.pin,
        email: editUserData.email,
        enabled: editUserData.enabled
      });

      toast({
        title: "User Updated",
        description: `${editUserData.name} has been updated successfully.`,
      });
      handleCloseEditModal();
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = (user: User) => {
    setDeleteUserModal({
      isOpen: true,
      user: user
    });
  };

  const handleCloseDeleteModal = () => {
    setDeleteUserModal({
      isOpen: false,
      user: null
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteUserModal.user) return;

    try {
      const { api } = await import('@/lib/api');
      await api.users.delete(deleteUserModal.user.id);

      toast({
        title: "User Deleted",
        description: `${deleteUserModal.user.name} has been deleted successfully.`,
      });
      handleCloseDeleteModal();
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Settings</h1>
            <p className="text-muted-foreground">Manage users and system settings.</p>
          </div>
        </div>

      <div className="grid gap-8">
        {/* User Management */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Add New Scanner User
              </CardTitle>
              <CardDescription>Create a new user with PIN access for scanning events.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-name">Name *</Label>
                <Input 
                  id="user-name" 
                  placeholder="John Doe" 
                  value={newUserData.name}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-pin">PIN *</Label>
                <Input 
                  id="user-pin" 
                  placeholder="Enter a 4-6 digit PIN" 
                  value={newUserData.pin}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, pin: e.target.value }))}
                />
              </div>
              <Button onClick={handleAddUser}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Scanner User
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Add New Admin
              </CardTitle>
              <CardDescription>Create a new administrator with full system access.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-name">Name *</Label>
                <Input 
                  id="admin-name" 
                  placeholder="Jane Smith" 
                  value={newAdminData.name}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email *</Label>
                <Input 
                  id="admin-email" 
                  type="email"
                  placeholder="jane@example.com" 
                  value={newAdminData.email}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                <p className="font-medium mb-1">Note:</p>
                <p>A temporary password will be generated and shown. The new admin must change it on first login.</p>
              </div>
              <Button onClick={handleAddAdmin}>
                <Shield className="mr-2 h-4 w-4" />
                Create Admin
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Users ({safeUsers.length})
                {selectedUsers.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedUsers.length} selected
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>A list of all users and administrators in the system.</CardDescription>
            </CardHeader>
            
            {/* Bulk Actions Toolbar */}
            {selectedUsers.length > 0 && (
              <div className="px-6 pb-4">
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">
                    {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected:
                  </span>
                  <Button size="sm" variant="outline" onClick={handleBulkEnable}>
                    Enable
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleBulkDisable}>
                    Disable
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleExportUsers}>
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setSelectedUsers([])}
                    className="ml-auto"
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            )}
            
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedUsers.length === safeUsers.length && safeUsers.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all users"
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>PIN/Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>First Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeUsers.length > 0 ? (
                    safeUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/50">
                        <TableCell className="w-12">
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => handleSelectUser(user.id)}
                            aria-label={`Select ${user.name}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium cursor-pointer" onClick={() => handleEditUser(user)}>{user.name}</TableCell>
                        <TableCell className="cursor-pointer" onClick={() => handleEditUser(user)}>
                          <Badge variant={user.role === 'ADMIN' ? 'default' : 'outline'}>
                            {user.role === 'ADMIN' ? 'Admin' : 'Scanner'}
                          </Badge>
                        </TableCell>
                        <TableCell className="cursor-pointer" onClick={() => handleEditUser(user)}>
                          {user.role === 'ADMIN' ? (
                            <div className="text-sm font-medium">{user.email || `${user.pin}@example.com`}</div>
                          ) : (
                            <div className="font-mono text-lg font-bold tracking-wider">{user.pin}</div>
                          )}
                        </TableCell>
                        <TableCell className="cursor-pointer" onClick={() => handleEditUser(user)}>
                          <Badge variant={user.enabled ? 'default' : 'secondary'}>
                            {user.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </TableCell>
                        <TableCell className="cursor-pointer" onClick={() => handleEditUser(user)}>
                          {user.isFirstLogin ? (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                              Pending
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              Complete
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteUser(user);
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No users found. Create some users to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </div>
      </div>

      <AdminPasswordModal
        isOpen={passwordModal.isOpen}
        onClose={handleClosePasswordModal}
        adminName={passwordModal.adminName}
        tempPassword={passwordModal.tempPassword}
      />

      <Dialog open={editUserModal.isOpen} onOpenChange={handleCloseEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5" />
              Edit User: {editUserModal.user?.name}
            </DialogTitle>
            <DialogDescription>
              Update user information and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={editUserData.name}
                onChange={(e) => setEditUserData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-pin">{editUserModal.user?.role === 'admin' ? 'Username' : 'PIN'} *</Label>
              <Input
                id="edit-pin"
                value={editUserData.pin}
                onChange={(e) => setEditUserData(prev => ({ ...prev, pin: e.target.value }))}
                placeholder={editUserModal.user?.role === 'admin' ? 'Username' : '4-6 digit PIN'}
              />
            </div>
            {editUserModal.user?.role === 'admin' && (
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editUserData.email}
                  onChange={(e) => setEditUserData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            )}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-enabled"
                checked={editUserData.enabled}
                onChange={(e) => setEditUserData(prev => ({ ...prev, enabled: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="edit-enabled">User Enabled</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEditModal}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteUserModal.isOpen} onOpenChange={handleCloseDeleteModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete User: {deleteUserModal.user?.name}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
              <p className="text-sm text-destructive font-medium">
                Warning: This will permanently delete the user and all associated data.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDeleteModal}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
