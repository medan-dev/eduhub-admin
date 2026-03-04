'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Stats {
  subjects: number;
  papers: number;
  videos: number;
  tutorials: number;
  schools: number;
  quizzes: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    subjects: 0, papers: 0, videos: 0, tutorials: 0, schools: 0, quizzes: 0,
  });
  const [recentPapers, setRecentPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const [subjects, papers, videos, tutorials, schools, quizzes] = await Promise.all([
        supabase.from('subjects').select('*', { count: 'exact', head: true }),
        supabase.from('papers').select('*', { count: 'exact', head: true }),
        supabase.from('videos').select('*', { count: 'exact', head: true }),
        supabase.from('tutorials').select('*', { count: 'exact', head: true }),
        supabase.from('schools').select('*', { count: 'exact', head: true }),
        supabase.from('quizzes').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        subjects: subjects.count || 0,
        papers: papers.count || 0,
        videos: videos.count || 0,
        tutorials: tutorials.count || 0,
        schools: schools.count || 0,
        quizzes: quizzes.count || 0,
      });

      // Fetch recent papers
      const { data } = await supabase
        .from('papers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentPapers(data || []);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Subjects', value: stats.subjects, icon: '📚', color: 'purple' },
    { label: 'Past Papers', value: stats.papers, icon: '📄', color: 'blue' },
    { label: 'Videos', value: stats.videos, icon: '🎬', color: 'green' },
    { label: 'Tutorials', value: stats.tutorials, icon: '🎓', color: 'orange' },
    { label: 'Schools', value: stats.schools, icon: '🏫', color: 'pink' },
    { label: 'Quizzes', value: stats.quizzes, icon: '❓', color: 'teal' },
  ];

  return (
    <>
      <header className="content-header">
        <div>
          <h2>Dashboard</h2>
          <p>Welcome back! Here&#39;s your content overview.</p>
        </div>
      </header>
      <div className="content-body">
        <div className="stats-grid">
          {statCards.map((card) => (
            <div key={card.label} className="glass-card stat-card">
              <div className={`stat-icon ${card.color}`}>{card.icon}</div>
              <div className="stat-info">
                <h3>{card.value}</h3>
                <p>{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Recent Papers</h3>
            <a href="/dashboard/papers" className="btn btn-ghost btn-sm">View All →</a>
          </div>
          {recentPapers.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Year</th>
                  <th>Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {recentPapers.map((paper) => (
                  <tr key={paper.id}>
                    <td>{paper.title}</td>
                    <td><span className="badge badge-purple">{paper.subject}</span></td>
                    <td>{paper.year}</td>
                    <td>
                      <span className="difficulty-stars">
                        {'★'.repeat(Math.round(paper.difficulty))}
                        {'☆'.repeat(5 - Math.round(paper.difficulty))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="icon">📄</div>
              <h3>No papers yet</h3>
              <p>Add your first past paper to get started</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
