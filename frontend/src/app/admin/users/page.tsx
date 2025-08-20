import { redirect } from 'next/navigation';

export default function UsersPage() {
  // Redirect to the new settings page which now contains user management
  redirect('/admin/settings');
}
