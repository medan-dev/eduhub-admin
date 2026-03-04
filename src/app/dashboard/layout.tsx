'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import PageTransition from '@/components/layout/PageTransition';
import { Menu, X } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="main-content">
        <div className="mobile-header" style={{ 
          padding: '16px', 
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          position: 'sticky',
          top: 0,
          zIndex: 35
        }}>
          <button className="mobile-toggle" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="sidebar-logo-text">
            <h1 style={{ fontSize: '14px' }}>EduHub UG</h1>
          </div>
        </div>
        <PageTransition>
          {children}
        </PageTransition>
      </main>
    </div>
  );
}
