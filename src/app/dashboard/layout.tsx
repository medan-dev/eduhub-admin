import Sidebar from '@/components/layout/Sidebar';
import PageTransition from '@/components/layout/PageTransition';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="main-content">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
    </div>
  );
}
