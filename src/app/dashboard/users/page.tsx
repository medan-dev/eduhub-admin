'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setUsers(data || []);
    setLoading(false);
  }

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const roleColor: Record<string, string> = { admin: 'badge-pink', student: 'badge-green' };

  return (
    <>
      <header className="content-header">
        <div>
          <h2>👥 Users</h2>
          <p>View registered students and admins</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="badge badge-green">{users.length} Total</span>
        </div>
      </header>
      <div className="content-body">
        <div className="glass-card">
          {users.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>School</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.full_name || '—'}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td>{u.school || '—'}</td>
                    <td><span className={`badge ${roleColor[u.role] || 'badge-blue'}`}>{u.role}</span></td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="icon">👥</div>
              <h3>No users yet</h3>
              <p>Users will appear here when they register through the app</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
