import React, { useEffect, useState } from 'react';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy
} from 'firebase/firestore';
import { Globe, Plus, Pencil, Trash2, ExternalLink, Search } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Platform } from '../types';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const EMPTY: Omit<Platform, 'id' | 'created_at'> = { name: '', logo_url: '', official_link: '', sector: '', execution_protocol: [] };

export default function PlatformsPage() {
  const { isModerator } = useAuth();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Platform | null>(null);
  const [form, setForm] = useState<Omit<Platform, 'id' | 'created_at'>>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'platforms'), orderBy('name')));
      setPlatforms(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Platform)));
    } catch { toast.error('Failed to load platforms'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (p: Platform) => { setEditing(p); setForm({ name: p.name, logo_url: p.logo_url, official_link: p.official_link, sector: p.sector || '', execution_protocol: p.execution_protocol || [] }); setModal(true); };

  const save = async () => {
    if (!form.name || !form.official_link) { toast.error('Name and link required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateDoc(doc(db, 'platforms', editing.id), { ...form });
        toast.success('Platform updated');
      } else {
        await addDoc(collection(db, 'platforms'), { ...form, created_at: serverTimestamp() });
        toast.success('Platform added');
      }
      setModal(false);
      load();
    } catch (e: any) { toast.error(e?.message || 'Save failed'); }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this platform?')) return;
    try {
      await deleteDoc(doc(db, 'platforms', id));
      toast.success('Deleted');
      setPlatforms((prev) => prev.filter((p) => p.id !== id));
    } catch { toast.error('Delete failed'); }
  };

  const filtered = platforms.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sector || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 4 }}>Platforms</h2>
          <p style={{ fontSize: 14, color: '#94a3b8' }}>{platforms.length} platforms available</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
            <input className="input" style={{ paddingLeft: 36, width: 220 }} placeholder="Search platforms…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {isModerator && (
            <button onClick={openAdd} className="btn btn-primary" style={{ gap: 8 }}>
              <Plus size={16} /> Add Node
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><LoadingSpinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass" style={{ padding: 60, textAlign: 'center', color: '#475569' }}>
          <Globe size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p>{search ? 'No platforms match your search.' : 'No platforms yet.'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.map((p) => (
            <div key={p.id} className="glass glow-cyan-hover" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {p.logo_url ? (
                    <img src={p.logo_url} alt={p.name} style={{ width: 36, height: 36, objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : <Globe size={22} color="#475569" />}
                </div>
                {isModerator && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => openEdit(p)} className="btn btn-ghost" style={{ padding: '5px 7px', borderRadius: 7 }}><Pencil size={14} /></button>
                    <button onClick={() => remove(p.id)} className="btn btn-danger" style={{ padding: '5px 7px', borderRadius: 7 }}><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{p.name}</h3>
              {p.sector && <p style={{ fontSize: 12, color: '#475569', marginBottom: 10 }}>{p.sector}</p>}
              <button onClick={() => window.open(p.official_link, '_blank')} 
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#00d4ff', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                <ExternalLink size={12} /> Open Node
              </button>
              {p.execution_protocol && p.execution_protocol.length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {p.execution_protocol.map((tag) => (
                    <span key={tag} className="badge badge-cyan" style={{ fontSize: 10 }}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Platform' : 'Add Platform'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[['name', 'Name *', 'e.g. Facebook'], ['logo_url', 'Logo URL', 'https://...'], ['official_link', 'Official Link *', 'https://...'], ['sector', 'Sector', 'e.g. Social Media']].map(([k, label, ph]) => (
            <div key={k}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 5 }}>{label}</label>
              <input className="input" placeholder={ph} value={(form as any)[k] || ''} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 5 }}>Protocols (comma-separated)</label>
            <input className="input" placeholder="e.g. IDOR, XSS, SQLi" value={form.execution_protocol?.join(', ') || ''} onChange={(e) => setForm((f) => ({ ...f, execution_protocol: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={() => setModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button onClick={save} disabled={saving} className="btn btn-primary" style={{ flex: 1 }}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
