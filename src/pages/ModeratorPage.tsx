import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { Users, Clock, MessageSquare } from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../types';
import { RoleBadge, StatusBadge } from '../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function ModeratorPage() {
  const { isModerator } = useAuth();
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(query(collection(db, 'users'), orderBy('created_at', 'desc'))).then((snap) => {
      const all = snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile));
      setPendingUsers(all.filter((u) => u.status === 'pending'));
      setLoading(false);
    });
  }, []);

  if (!isModerator) return <div className="glass" style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>Access denied.</div>;

  return (
    <div style={{ maxWidth: 900 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 8 }}>Moderator Panel</h2>
      <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24 }}>Review pending users and monitor activity.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { icon: <Clock size={22} />, label: 'Pending Review', value: pendingUsers.length, color: '#f59e0b' },
          { icon: <MessageSquare size={22} />, label: 'Chat Inbox', value: 'View', color: '#00d4ff', action: () => navigate('/chat') },
        ].map((card) => (
          <div key={card.label} className="glass" style={{ padding: 20, cursor: card.action ? 'pointer' : 'default' }} onClick={card.action}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: `${card.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color, marginBottom: 12 }}>
              {card.icon}
            </div>
            <p style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: card.color }}>{card.value}</p>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>{card.label}</p>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#94a3b8', marginBottom: 14 }}>Pending Users</h3>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><LoadingSpinner size="lg" /></div>
      ) : pendingUsers.length === 0 ? (
        <div className="glass" style={{ padding: 40, textAlign: 'center', color: '#475569' }}>
          <Users size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
          <p>No pending users.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pendingUsers.map((u) => (
            <div key={u.uid} className="glass-sm" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={u.photo_url || `https://api.dicebear.com/8.x/identicon/svg?seed=${u.uid}`} className="avatar" style={{ width: 38, height: 38 }} alt="" />
                <div>
                  <p style={{ fontWeight: 600, fontSize: 15 }}>{u.display_name || '—'}</p>
                  <p style={{ fontSize: 12, color: '#475569' }}>{u.email}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <StatusBadge status={u.status} />
                <button onClick={() => navigate('/admin')} className="btn btn-secondary" style={{ fontSize: 12, padding: '5px 12px' }}>
                  Manage →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
