import { SettingsClient } from '@/components/admin/settings-client';

import { prisma } from '@/lib/database';

async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        pin: true,
        enabled: true,
        role: true,
        isFirstLogin: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export default async function SettingsPage() {
  const users = await getUsers();
  return <SettingsClient users={users} />;
}
