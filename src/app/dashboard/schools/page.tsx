'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { School } from '@/types';

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editing, setEditing] = useState<School | null>(null);
  const [viewing, setViewing] = useState<School | null>(null);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [form, setForm] = useState({
    name: '', code: '', district: '', type: 'Government - Mixed Secondary', exam_board: 'UNEB',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchSchools(); }, []);

  async function fetchSchools() {
    const { data, error } = await supabase.from('schools').select('*').order('name');
    if (!error) setSchools(data || []);
    setLoading(false);
  }

  const filteredSchools = schools.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function showToast(message: string, type: string) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: '', code: '', district: '', type: 'Government - Mixed Secondary', exam_board: 'UNEB' });
    setShowModal(true);
  }

  function openEdit(school: School) {
    setEditing(school);
    setForm({ name: school.name, code: school.code, district: school.district, type: school.type, exam_board: school.exam_board });
    setShowModal(true);
  }

  function openView(school: School) {
    setViewing(school);
    setShowViewModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      const { error } = await supabase.from('schools').update(form).eq('id', editing.id);
      if (error) { showToast('Error updating', 'error'); return; }
      showToast('School updated!', 'success');
    } else {
      const { error } = await supabase.from('schools').insert([form]);
      if (error) { showToast('Error creating', 'error'); return; }
      showToast('School created!', 'success');
    }
    setShowModal(false);
    fetchSchools();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this school?')) return;
    const { error } = await supabase.from('schools').delete().eq('id', id);
    if (error) { showToast('Error', 'error'); return; }
    showToast('School deleted!', 'success');
    fetchSchools();
  }

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <>
      <header className="content-header">
        <div>
          <h2>🏫 Schools</h2>
          <p>Manage Ugandan schools database</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
           <div className="search-container">
            <input 
              type="text" 
              className="form-input search-input" 
              placeholder="Search schools..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ Add School</button>
        </div>
      </header>
      <div className="content-body">
        <div className="glass-card">
          <div style={{ marginBottom: '16px', display: 'flex', gap: 8, alignItems: 'center' }}>
             <span className="badge badge-purple">{filteredSchools.length} Total</span>
          </div>
          {filteredSchools.length > 0 ? (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Code</th>
                    <th>District</th>
                    <th>Type</th>
                    <th>Exam Board</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchools.map((s) => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td><span className="badge badge-blue">{s.code}</span></td>
                      <td>{s.district}</td>
                      <td>{s.type}</td>
                      <td><span className="badge badge-green">{s.exam_board}</span></td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => openView(s)} title="View">👁️</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)} title="Edit">✏️</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)} title="Delete">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="icon">🏫</div>
              <h3>No schools</h3>
              <p>Add Ugandan schools</p>
            </div>
          )}
        </div>
      </div>

      {/* Editor Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit School' : 'Add School'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">School Name</label>
                <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">School Code</label>
                  <input className="form-input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="UG/UKA/0001" />
                </div>
                <div className="form-group">
                  <label className="form-label">District</label>
                  <input className="form-input" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} required />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="Government - Mixed Secondary">Government - Mixed</option>
                    <option value="Private - Boys Secondary">Private - Boys</option>
                    <option value="Private - Girls Secondary">Private - Girls</option>
                    <option value="Private - Mixed Secondary">Private - Mixed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Exam Board</label>
                  <input className="form-input" value={form.exam_board} onChange={(e) => setForm({ ...form, exam_board: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewing && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>School Details</h3>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>✕</button>
            </div>
            <div className="view-details" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                <div style={{ width: 64, height: 64, borderRadius: '16px', background: 'linear-gradient(135deg, #00b894, #55efc4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                  🏫
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', margin: 0 }}>{viewing.name}</h2>
                  <span className="badge badge-blue" style={{ marginTop: '4px', display: 'inline-block' }}>{viewing.code}</span>
                </div>
              </div>
              
              <div className="form-grid">
                <div>
                  <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>District</label>
                  <p>{viewing.district}</p>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Type</label>
                  <p>{viewing.type}</p>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Exam Board</label>
                  <p>{viewing.exam_board}</p>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Created Date</label>
                  <p>{new Date(viewing.created_at).toLocaleDateString()}</p>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>System ID</label>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{viewing.id}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast toast-${toast.type}`}>{toast.type === 'success' ? '✅' : '❌'} {toast.message}</div>}
    </>
  );
}
