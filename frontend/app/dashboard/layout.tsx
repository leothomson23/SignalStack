'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { UserProvider } from '@/lib/UserContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <UserProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        <div
          className={`lg:hidden fixed inset-y-0 left-0 z-40 transition-transform duration-300 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        </div>

        {/* Main content */}
        <div
          className={`transition-all duration-300 ${
            collapsed ? 'lg:ml-[68px]' : 'lg:ml-[250px]'
          }`}
        >
          <Header onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </UserProvider>
  );
}
