import { UserListClient } from '@/components/admin/user-list-client';
import { MOCK_USERS } from '@/lib/mock-data';

export default function UsersPage() {
  const users = MOCK_USERS;
  return <UserListClient users={users} />;
}
