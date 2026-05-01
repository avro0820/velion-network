import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Camera, MapPin, Globe, Edit2, Save, X, Users, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '../lib/firebase';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../types';
import { RoleBadge, StatusBadge } from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import './HomePage.css';

export default function ProfilePage() {
  const { userId } = useParams<{ userId?: string }>();
  const { user, userProfile, updateUserProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ 
    display_name: '', username: '', bio: '', location: '', website: '',
    social_links: { twitter: '', github: '', linkedin: '', whatsapp: '', facebook: '', tiktok: '', instagram: '', discord: '' }
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const targetUid = userId || user?.uid;
  const isOwn = !userId || userId === user?.uid;

  useEffect(() => {
    if (!targetUid) return;
    if (isOwn && userProfile) {
      setProfile(userProfile);
      setForm({
        display_name: userProfile.display_name || '',
        username: userProfile.username || '',
        bio: userProfile.bio || '',
        location: userProfile.location || '',
        website: userProfile.website || '',
        social_links: {
          twitter: userProfile.social_links?.twitter || '',
          github: userProfile.social_links?.github || '',
          linkedin: userProfile.social_links?.linkedin || '',
          whatsapp: userProfile.social_links?.whatsapp || '',
          facebook: userProfile.social_links?.facebook || '',
          tiktok: userProfile.social_links?.tiktok || '',
          instagram: userProfile.social_links?.instagram || '',
          discord: userProfile.social_links?.discord || '',
        }
      });
      setLoading(false);
    } else {
      getDoc(doc(db, 'users', targetUid)).then((snap) => {
        if (snap.exists()) setProfile({ uid: snap.id, ...snap.data() } as UserProfile);
        else navigate('/404');
        setLoading(false);
      });
    }
  }, [targetUid, isOwn, userProfile]);

  const handleSave = async () => {
    if (!form.display_name.trim()) { toast.error('Display name required'); return; }
    setSaving(true);
    try {
      await updateUserProfile(form);
      await refreshProfile();
      setEditing(false);
      toast.success('Profile updated');
    } catch (e: any) {
      toast.error(e?.message || 'Save failed');
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSupabaseConfigured || !supabase) {
      toast.error('Supabase is not configured. Add VITE_SUPABASE_URL and KEY to .env');
      return;
    }
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be < 5MB'); return; }
    setUploading(true);
    try {
      const fileName = `avatars/${user.uid}_${Date.now()}`;
      const { error } = await supabase.storage.from('velion-storage').upload(fileName, file);
      if (error) throw error;
      
      const { data } = supabase.storage.from('velion-storage').getPublicUrl(fileName);
      await updateUserProfile({ photo_url: data.publicUrl });
      await refreshProfile();
      toast.success('Avatar uploaded to Supabase!');
    } catch (e: any) {
      toast.error('Upload failed: ' + e.message);
    }
    setUploading(false);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><LoadingSpinner size="lg" /></div>;
  if (!profile) return null;

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Cover + Avatar */}
      <div className="glass" style={{ overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ height: 160, background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(124,58,237,0.2))', position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              bottom: -40,
              left: 24,
              display: 'flex',
              alignItems: 'flex-end',
              gap: 16,
            }}
          >
            <div style={{ position: 'relative' }}>
              <img
                src={profile.photo_url || `https://api.dicebear.com/8.x/identicon/svg?seed=${profile.uid}`}
                className="avatar avatar-ring"
                style={{ width: 80, height: 80, border: '3px solid #050a14' }}
                alt="avatar"
              />
              {isOwn && (
                <>
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: '#00d4ff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {uploading ? <LoadingSpinner size="sm" /> : <Camera size={13} color="#050a14" />}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                </>
              )}
            </div>
          </div>
        </div>

        <div style={{ padding: '52px 24px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 6 }}>
              {profile.display_name || profile.email}
            </h1>
            {profile.username && <p style={{ color: '#475569', fontSize: 14, marginBottom: 8 }}>@{profile.username}</p>}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <RoleBadge role={profile.role} />
              <StatusBadge status={profile.status} />
            </div>
          </div>
          {isOwn && !editing && (
            <button onClick={() => setEditing(true)} className="btn btn-secondary" style={{ gap: 8 }}>
              <Edit2 size={15} /> Edit Profile
            </button>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 24, padding: '0 24px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
          {[
            { label: 'Posts', value: profile.post_count || 0 },
            { label: 'Followers', value: profile.followers?.length || 0 },
            { label: 'Following', value: profile.following?.length || 0 },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif" }}>{value}</p>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Form / Bio */}
      <div className="glass" style={{ padding: 24 }}>
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Edit Profile</h3>
            {[
              { k: 'display_name', label: 'Display Name *', ph: 'Your name' },
              { k: 'username', label: 'Username', ph: 'handle (no @)' },
              { k: 'location', label: 'Location', ph: 'City, Country' },
              { k: 'website', label: 'Website', ph: 'https://…' },
            ].map(({ k, label, ph }) => (
              <div key={k}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 5 }}>{label}</label>
                <input className="input" placeholder={ph} value={(form as any)[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 5 }}>Bio</label>
              <textarea className="input" style={{ minHeight: 90 }} placeholder="Tell the network about yourself…" value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
            </div>
            
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginTop: 10, marginBottom: 5 }}>Social Links</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {['whatsapp', 'twitter', 'github', 'linkedin', 'facebook', 'instagram', 'tiktok', 'discord'].map(net => (
                <div key={net}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 4, textTransform: 'capitalize' }}>{net}</label>
                  <input 
                    className="input" 
                    placeholder={net === 'whatsapp' ? 'Phone number' : 'Username or URL'} 
                    value={(form.social_links as any)[net]} 
                    onChange={(e) => setForm(f => ({...f, social_links: {...f.social_links, [net]: e.target.value}}))} 
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button onClick={() => setEditing(false)} className="btn btn-secondary" style={{ flex: 1, gap: 6 }}><X size={14} />Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ flex: 1, gap: 6 }}>
                {saving ? <LoadingSpinner size="sm" /> : <><Save size={14} />Save</>}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {profile.bio && <p style={{ fontSize: 15, lineHeight: 1.7, color: '#e2e8f0' }}>{profile.bio}</p>}
            {(profile.location || profile.website) && (
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {profile.location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#94a3b8' }}>
                    <MapPin size={14} color="#475569" /> {profile.location}
                  </span>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#00d4ff', textDecoration: 'none' }}>
                    <Globe size={14} /> {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            )}
            {!profile.bio && !profile.location && !profile.website && (
              <p style={{ color: '#475569', fontSize: 14 }}>
                {isOwn ? 'Add a bio, location, and website to complete your profile.' : 'No profile info yet.'}
              </p>
            )}

            {/* Social Buttons display */}
            {profile.social_links && Object.entries(profile.social_links).some(([_, val]) => val) && (
              <div style={{ marginTop: 20 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Connect</h4>
                <div className="social-wrapper" style={{ justifyContent: 'flex-start', padding: 0, background: 'transparent', boxShadow: 'none', border: 'none', gap: 12 }}>
                  {Object.entries(profile.social_links).map(([net, val]) => {
                    if (!val) return null;
                    let href = val;
                    if (net === 'whatsapp' && !val.startsWith('http')) href = `https://wa.me/${val.replace(/[^0-9]/g, '')}`;
                    else if (net === 'twitter' && !val.startsWith('http')) href = `https://twitter.com/${val.replace('@', '')}`;
                    else if (net === 'github' && !val.startsWith('http')) href = `https://github.com/${val}`;
                    else if (net === 'instagram' && !val.startsWith('http')) href = `https://instagram.com/${val.replace('@', '')}`;
                    else if (!val.startsWith('http')) href = `https://${val}`;
                    
                    return (
                      <a key={net} href={href} target="_blank" rel="noopener noreferrer" className={`social-btn ${net}`} style={{ height: 46, width: 46, padding: 12 }}>
                        <i className={`fa-brands fa-${net}`}></i>
                        <span className="btn-text" style={{ fontSize: 14 }}>{net.charAt(0).toUpperCase() + net.slice(1)}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
