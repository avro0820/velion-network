import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, limit, orderBy, where } from 'firebase/firestore';
import { Globe, FileText, Users, MessageSquare, TrendingUp, ArrowRight, Shield } from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { RoleBadge, StatusBadge } from '../components/ui/Badge';

interface Stats { platforms: number; templates: number; users: number; }

export default function DashboardPage() {
  const { userProfile, isAdmin, isModerator } = useAuth();
  const [stats, setStats] = useState<Stats>({ platforms: 0, templates: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [p, t, u] = await Promise.all([
          getDocs(query(collection(db, 'platforms'), limit(100))),
          getDocs(query(collection(db, 'templates'), limit(100))),
          isModerator ? getDocs(query(collection(db, 'users'), limit(100))) : Promise.resolve({ size: 0 }),
        ]);
        setStats({ platforms: p.size, templates: t.size, users: (u as any).size });
      } catch { /* ignore permissions */ }
      setLoading(false);
    })();
  }, [isModerator]);

  const statCards = [
    { icon: <Globe size={22} />, label: 'Platforms', value: stats.platforms, to: '/platforms', color: '#00d4ff' },
    { icon: <FileText size={22} />, label: 'Templates', value: stats.templates, to: '/templates', color: '#7c3aed' },
    { icon: <Users size={22} />, label: 'Network Users', value: stats.users, to: '/admin', color: '#10b981', restricted: !isModerator },
    { icon: <MessageSquare size={22} />, label: 'Messages', value: '—', to: '/chat', color: '#f59e0b' },
  ];

  const quickLinks = [
    { to: '/network',   icon: <TrendingUp size={18} />,  label: 'Network Feed',     desc: 'See what the community is sharing' },
    { to: '/platforms', icon: <Globe size={18} />,        label: 'Browse Platforms', desc: 'Explore security reporting targets' },
    { to: '/templates', icon: <FileText size={18} />,     label: 'View Templates',   desc: 'Access your approved report templates' },
    { to: '/chat',      icon: <MessageSquare size={18} />, label: 'Messages',        desc: 'Direct messages and support chat' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1200 }}>
      {/* Welcome */}
      <div className="glass" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img
              src={userProfile?.photo_url || `https://api.dicebear.com/8.x/identicon/svg?seed=${userProfile?.uid}`}
              alt="avatar"
              className="avatar avatar-ring"
              style={{ width: 52, height: 52 }}
            />
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 4 }}>
                Welcome back, {userProfile?.display_name?.split(' ')[0] || 'Agent'} 👋
              </h2>
              <div style={{ display: 'flex', gap: 6 }}>
                <RoleBadge role={userProfile?.role ?? 'user'} />
                <StatusBadge status={userProfile?.status ?? 'pending'} />
              </div>
            </div>
          </div>
          {isAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '8px 14px' }}>
              <Shield size={16} color="#ef4444" />
              <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 600 }}>Admin Access</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {statCards.map((card) => (
          <Link key={card.label} to={card.to}
            style={{ textDecoration: 'none', opacity: card.restricted ? 0.4 : 1, pointerEvents: card.restricted ? 'none' : 'auto' }}
          >
            <div className="glass glow-cyan-hover" style={{ padding: 22, cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: `${card.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                  {card.icon}
                </div>
                <ArrowRight size={15} style={{ color: '#475569', marginTop: 4 }} />
              </div>
              <div style={{ fontSize: loading ? 0 : 28, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: card.color, marginBottom: 4 }}>
                {loading ? <div className="skeleton" style={{ width: 50, height: 28 }} /> : card.value}
              </div>
              <p style={{ fontSize: 13, color: '#94a3b8' }}>{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <h3 style={{ fontWeight: 700, color: '#94a3b8', marginBottom: 14, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: 12 }}>
          Quick Access
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          {quickLinks.map((ql) => (
            <Link key={ql.to} to={ql.to} style={{ textDecoration: 'none' }}>
              <div className="glass-sm glow-cyan-hover" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: 'rgba(0,212,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00d4ff', flexShrink: 0 }}>
                  {ql.icon}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', marginBottom: 2 }}>{ql.label}</p>
                  <p style={{ fontSize: 12, color: '#475569' }}>{ql.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
