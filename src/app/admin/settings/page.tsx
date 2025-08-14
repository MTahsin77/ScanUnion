import { SettingsClient } from '@/components/admin/settings-client';
import { MOCK_USERS } from '@/lib/mock-data';

export default function SettingsPage() {
  const users = MOCK_USERS;
  return <SettingsClient users={users} />;
}
