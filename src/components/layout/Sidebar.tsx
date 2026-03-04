'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Video, 
  GraduationCap, 
  HelpCircle, 
  School, 
  Users, 
  LogOut 
} from 'lucide-react';

const navItems = [
  {
    section: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    section: 'Content',
    items: [
      { label: 'Subjects', href: '/dashboard/subjects', icon: BookOpen },
      { label: 'Papers', href: '/dashboard/papers', icon: FileText },
      { label: 'Videos', href: '/dashboard/videos', icon: Video },
      { label: 'Tutorials', href: '/dashboard/tutorials', icon: GraduationCap },
      { label: 'Quizzes', href: '/dashboard/quizzes', icon: HelpCircle },
    ],
  },
  {
    section: 'Management',
    items: [
      { label: 'Schools', href: '/dashboard/schools', icon: School },
      { label: 'Users', href: '/dashboard/users', icon: Users },
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1 },
};

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
      
      <motion.nav 
        className="sidebar-nav"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {navItems.map((section) => (
          <div key={section.section}>
            <div className="nav-section-title">{section.section}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.href} variants={itemVariants}>
                  <Link
                    href={item.href}
                    className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                  >
                    <span><Icon size={18} /></span>
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ))}
      </motion.nav>

      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border-color)' }}>
        <Link href="/" className="nav-link" style={{ color: 'var(--danger)' }}>
          <LogOut size={18} />
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
}
