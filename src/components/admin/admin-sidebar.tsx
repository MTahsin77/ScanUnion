'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { LayoutDashboard, CalendarDays, Users, LogOut, Settings } from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/events', label: 'Events', icon: CalendarDays },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent className="pt-12">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <SidebarMenuButton asChild tooltip="Logout">
            <Link href="/login">
              <LogOut />
              <span>Logout</span>
            </Link>
          </SidebarMenuButton>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
