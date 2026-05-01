import React, { useEffect, useState } from 'react';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, where
} from 'firebase/firestore';
import { FileText, Plus, Pencil, Trash2, Copy, Check, Search, Download } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '../lib/firebase';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { upload } from '@vercel/blob/client';
import { useAuth } from '../contexts/AuthContext';
import { Template, Platform } from '../types';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const EMPTY = { platform_id: '', category: '', text: '', instructions: '', video_url: '', file_url: '' };

export default function TemplatesPage() {
  const { isModerator, userProfile } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPlat, setFilterPlat] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [ts, ps] = await Promise.all([
        getDocs(query(collection(db, 'templates'), orderBy('category'))),
        getDocs(query(collection(db, 'platforms'), orderBy('name'))),
      ]);
      setTemplates(ts.docs.map((d) => ({ id: d.id, ...d.data() } as Template)));
      setPlatforms(ps.docs.map((d) => ({ id: d.id, ...d.data() } as Platform)));
    } catch { toast.error('Failed to load templates'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const copy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success('Copied to clipboard!');
  };

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (t: Template) => { setEditing(t); setForm({ platform_id: t.platform_id, category: t.category, text: t.text, instructions: t.instructions || '', video_url: t.video_url || '', file_url: t.file_url || '' }); setModal(true); };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSupabaseConfigured || !supabase) {
      toast.error('Supabase is not configured. Add VITE_SUPABASE_URL and KEY to .env');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
      
      // Try Vercel Blob first
      try {
        const newBlob = await upload(fileName, file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        });
        setForm(f => ({ ...f, file_url: newBlob.url }));
        toast.success('File uploaded to Vercel Blob successfully');
        setUploading(false);
        return;
      } catch (vErr) {
        console.warn('Vercel Blob failed or not configured, falling back to Supabase:', vErr);
      }

      // Fallback to Supabase Storage
      const { error } = await supabase.storage.from('velion-storage').upload(`templates/${fileName}`, file);
      if (error) throw error;
      
      const { data } = supabase.storage.from('velion-storage').getPublicUrl(`templates/${fileName}`);
      setForm(f => ({ ...f, file_url: data.publicUrl }));
      toast.success('File uploaded to Supabase successfully');
    } catch (err: any) {
      toast.error('File upload failed: ' + err.message);
    }
    setUploading(false);
  };

  const save = async () => {
    if (!form.platform_id || !form.category || (!form.text && !form.file_url)) { toast.error('Platform, category, and either text or file required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateDoc(doc(db, 'templates', editing.id), { ...form });
        toast.success('Template updated');
      } else {
        await addDoc(collection(db, 'templates'), { ...form, created_at: serverTimestamp() });
        toast.success('Template added');
      }
      setModal(false);
      load();
    } catch (e: any) { toast.error(e?.message || 'Save failed'); }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    await deleteDoc(doc(db, 'templates', id));
    toast.success('Deleted');
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const platName = (id: string) => platforms.find((p) => p.id === id)?.name ?? id;

  const filtered = templates.filter((t) => {
    const matchSearch = t.text.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
    const matchPlat = !filterPlat || t.platform_id === filterPlat;
    return matchSearch && matchPlat;
  });

  return (
    <div style={{ maxWidth: 1200 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 4 }}>Templates</h2>
          <p style={{ fontSize: 14, color: '#94a3b8' }}>{templates.length} report templates</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
            <input className="input" style={{ paddingLeft: 36, width: 200 }} placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input" style={{ width: 160 }} value={filterPlat} onChange={(e) => setFilterPlat(e.target.value)}>
            <option value="">All Platforms</option>
            {platforms.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {isModerator && <button onClick={openAdd} className="btn btn-primary" style={{ gap: 8 }}><Plus size={16} /> Add Template</button>}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><LoadingSpinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass" style={{ padding: 60, textAlign: 'center', color: '#475569' }}>
          <FileText size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p>No templates found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map((t) => (
            <div key={t.id} className="glass" style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span className="badge badge-cyan">{platName(t.platform_id)}</span>
                  <span className="badge badge-purple">{t.category}</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => copy(t.text, t.id)} className="btn btn-secondary" style={{ padding: '6px 12px', gap: 5, fontSize: 12 }}>
                    {copied === t.id ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
                  </button>
                  {t.file_url && (
                    <button onClick={() => window.open(t.file_url, '_blank')} className="btn btn-secondary" style={{ padding: '6px 12px', gap: 5, fontSize: 12, color: '#00d4ff', borderColor: 'rgba(0,212,255,0.3)' }}>
                      <Download size={13} /> Download File
                    </button>
                  )}
                  {isModerator && <>
                    <button onClick={() => openEdit(t)} className="btn btn-ghost" style={{ padding: '6px 8px' }}><Pencil size={14} /></button>
                    <button onClick={() => remove(t.id)} className="btn btn-danger" style={{ padding: '6px 8px' }}><Trash2 size={14} /></button>
                  </>}
                </div>
              </div>
              {t.text && (
                <pre style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: '#e2e8f0', whiteSpace: 'pre-wrap', lineHeight: 1.7, background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                  {t.text}
                </pre>
              )}
              {t.instructions && (
                <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(0,212,255,0.05)', borderRadius: 8, border: '1px solid rgba(0,212,255,0.15)' }}>
                  <p style={{ fontSize: 12, color: '#00d4ff', fontWeight: 600, marginBottom: 4 }}>Instructions</p>
                  <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{t.instructions}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Template' : 'Add Template'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 5 }}>Platform *</label>
            <select className="input" value={form.platform_id} onChange={(e) => setForm((f) => ({ ...f, platform_id: e.target.value }))}>
              <option value="">Select platform…</option>
              {platforms.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 5 }}>Category *</label>
            <input className="input" placeholder="e.g. IDOR, XSS, Account Takeover" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 5 }}>Template Text</label>
            <textarea className="input" style={{ minHeight: 140 }} placeholder="Report template text…" value={form.text} onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 5 }}>Upload File / App (Optional)</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input type="file" onChange={handleFileUpload} disabled={uploading} className="input" style={{ padding: '8px' }} />
              {uploading && <LoadingSpinner size="sm" />}
            </div>
            {form.file_url && <p style={{ fontSize: 12, color: '#10b981', marginTop: 4 }}>File attached successfully.</p>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 5 }}>Instructions</label>
            <textarea className="input" style={{ minHeight: 80 }} placeholder="Usage instructions…" value={form.instructions} onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))} />
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
