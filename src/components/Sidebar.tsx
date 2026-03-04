'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  {
    section: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    ],
  },
  {
    section: 'Content',
    items: [
      { label: 'Subjects', href: '/dashboard/subjects', icon: '📚' },
      { label: 'Papers', href: '/dashboard/papers', icon: '📄' },
      { label: 'Videos', href: '/dashboard/videos', icon: '🎬' },
      { label: 'Tutorials', href: '/dashboard/tutorials', icon: '🎓' },
      { label: 'Quizzes', href: '/dashboard/quizzes', icon: '❓' },
    ],
  },
  {
    section: 'Management',
    items: [
      { label: 'Schools', href: '/dashboard/schools', icon: '🏫' },
      { label: 'Users', href: '/dashboard/users', icon: '👥' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">E</div>
          <div className="sidebar-logo-text">
            <h1>EduHub UG</h1>
            <p>Admin Panel</p>
          </div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((section) => (
          <div key={section.section}>
            <div className="nav-section-title">{section.section}</div>
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${pathname === item.href ? 'active' : ''}`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border-color)' }}>
        <Link href="/" className="nav-link" style={{ color: 'var(--danger)' }}>
          <span>🚪</span>
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
}
