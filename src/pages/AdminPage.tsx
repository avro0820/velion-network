import React, { useEffect, useState } from 'react';
import {
  collection, getDocs, updateDoc, doc, query, orderBy, where, limit
} from 'firebase/firestore';
import { Users, Check, X, Globe, Shield, Search, Ban, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile, Platform } from '../types';
import { RoleBadge, StatusBadge } from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function AdminPage() {
  const { isAdmin, isOwner, user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ role: '', status: '', system_message: '', has_global_access: false, approved_platforms: [] as string[] });
  const [saving, setSaving] = useState(false);
  const [backingUp, setBackingUp] = useState(false);

  const runBackup = async () => {
    if (!isSupabaseConfigured || !supabase) {
      toast.error('Supabase is not configured in .env.local');
      return;
    }
    if (!confirm('Start full backup to Supabase? Make sure tables match Firestore structure.')) return;
    
    setBackingUp(true);
    toast.info('Starting backup...');
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersData = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (usersData.length) await supabase.from('users').upsert(usersData);

      const platsSnap = await getDocs(collection(db, 'platforms'));
      const platsData = platsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (platsData.length) await supabase.from('platforms').upsert(platsData);

      const tempsSnap = await getDocs(collection(db, 'templates'));
      const tempsData = tempsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (tempsData.length) await supabase.from('templates').upsert(tempsData);

      toast.success('Backup completed successfully!');
    } catch (e: any) {
      console.error(e);
      toast.error('Backup failed. Check console.');
    }
    setBackingUp(false);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [us, ps] = await Promise.all([
        getDocs(query(collection(db, 'users'), orderBy('created_at', 'desc'))),
        getDocs(query(collection(db, 'platforms'), orderBy('name'))),
      ]);
      setUsers(us.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile)));
      setPlatforms(ps.docs.map((d) => ({ id: d.id, ...d.data() } as Platform)));
    } catch { toast.error('Failed to load users'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openEdit = (u: UserProfile) => {
    setSelectedUser(u);
    setEditForm({
      role: u.role,
      status: u.status,
      system_message: u.system_message || '',
      has_global_access: u.has_global_access || false,
      approved_platforms: u.approved_platforms || [],
    });
    setEditModal(true);
  };

  const quickApprove = async (uid: string) => {
    await updateDoc(doc(db, 'users', uid), { status: 'approved' });
    setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, status: 'approved' as const } : u));
    toast.success('User approved');
  };

  const quickSuspend = async (uid: string) => {
    await updateDoc(doc(db, 'users', uid), { status: 'suspended', is_suspended: true });
    setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, status: 'suspended' as const, is_suspended: true } : u));
    toast.success('User suspended');
  };

  const saveUser = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', selectedUser.uid), { ...editForm });
      setUsers((prev) => prev.map((u) => u.uid === selectedUser.uid ? { ...u, ...editForm, role: editForm.role as any, status: editForm.status as any } : u));
      toast.success('User updated');
      setEditModal(false);
    } catch (e: any) {
      toast.error(e?.message || 'Save failed');
    }
    setSaving(false);
  };

  const togglePlatform = (pid: string) => {
    setEditForm((f) => ({
      ...f,
      approved_platforms: f.approved_platforms.includes(pid)
        ? f.approved_platforms.filter((p) => p !== pid)
        : [...f.approved_platforms, pid],
    }));
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = (u.display_name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
    const matchStatus = !filterStatus || u.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const pending = users.filter((u) => u.status === 'pending').length;

  if (!isAdmin) return <div className="glass" style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>Access denied.</div>;

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 4 }}>Admin Panel</h2>
          <p style={{ fontSize: 14, color: '#94a3b8' }}>
            {users.length} users · {pending > 0 && <span style={{ color: '#f59e0b' }}>{pending} pending</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={runBackup} disabled={backingUp} className="btn btn-secondary" style={{ padding: '10px 14px', gap: 6 }}>
            {backingUp ? <LoadingSpinner size="sm" /> : <><Globe size={15} /> Backup to Supabase</>}
          </button>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
            <input className="input" style={{ paddingLeft: 34, width: 220 }} placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input" style={{ width: 150 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="suspended">Suspended</option>
          </select>
          <button onClick={load} className="btn btn-secondary" style={{ padding: '10px 12px' }}><RefreshCw size={15} /></button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="glass" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['User', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#475569', fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.uid} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img
                        src={u.photo_url || `https://api.dicebear.com/8.x/identicon/svg?seed=${u.uid}`}
                        className="avatar"
                        style={{ width: 34, height: 34 }}
                        alt=""
                      />
                      <div>
                        <p style={{ fontWeight: 600 }}>{u.display_name || '—'}</p>
                        <p style={{ fontSize: 12, color: '#475569' }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}><RoleBadge role={u.role} /></td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge status={u.status} /></td>
                  <td style={{ padding: '12px 16px', color: '#475569', fontSize: 13 }}>
                    {u.created_at ? new Date(typeof u.created_at === 'string' ? u.created_at : (u.created_at as any).toDate()).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {u.status === 'pending' && (
                        <button onClick={() => quickApprove(u.uid)} className="btn btn-secondary" style={{ padding: '5px 10px', gap: 4, fontSize: 12, color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }}>
                          <Check size={13} /> Approve
                        </button>
                      )}
                      {u.status !== 'suspended' && (
                        <button onClick={() => quickSuspend(u.uid)} className="btn btn-danger" style={{ padding: '5px 10px', gap: 4, fontSize: 12 }}>
                          <Ban size={13} /> Suspend
                        </button>
                      )}
                      <button onClick={() => openEdit(u)} className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: 12 }}>
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#475569' }}>No users match the filter.</div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title={`Edit: ${selectedUser?.display_name || selectedUser?.email}`} maxWidth={520}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 5 }}>Role</label>
              <select className="input" value={editForm.role} disabled={selectedUser?.uid === user?.uid} onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value as any }))}>
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
                {isOwner && <option value="owner">Owner</option>}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 5 }}>Status</label>
              <select className="input" value={editForm.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as any }))}>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={editForm.has_global_access} onChange={(e) => setEditForm((f) => ({ ...f, has_global_access: e.target.checked }))} style={{ accentColor: '#00d4ff', width: 15, height: 15 }} />
              <span style={{ color: '#e2e8f0' }}>Global Platform Access</span>
            </label>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>Approved Platforms</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {platforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className={`badge ${editForm.approved_platforms.includes(p.id) ? 'badge-cyan' : 'badge-gray'}`}
                  style={{ cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 5 }}>System Message</label>
            <textarea className="input" style={{ minHeight: 70 }} placeholder="Message shown to user on their pending page…" value={editForm.system_message} onChange={(e) => setEditForm((f) => ({ ...f, system_message: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={() => setEditModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button onClick={saveUser} disabled={saving} className="btn btn-primary" style={{ flex: 1 }}>{saving ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
