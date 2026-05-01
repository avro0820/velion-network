import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { RoleBadge } from '../ui/Badge';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/network':   'Network Feed',
  '/platforms': 'Platforms',
  '/templates': 'Templates',
  '/chat':      'Messages',
  '/profile':   'My Profile',
  '/admin':     'Admin Panel',
  '/moderator': 'Moderator Panel',
};

export default function TopBar() {
  const { userProfile } = useAuth();
  const location = useLocation();

  const title = Object.entries(routeTitles).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] ?? 'Velion Network';

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header
      style={{
        height: 64,
        background: 'rgba(10,22,40,0.9)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: 16,
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div style={{ flex: 1 }}>
        <h1
          style={{
            fontSize: 18,
            fontWeight: 700,
            fontFamily: "'Space Grotesk', sans-serif",
            color: '#e2e8f0',
            letterSpacing: '-0.3px',
          }}
        >
          {title}
        </h1>
      </div>

      {/* Search hint */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8,
          padding: '6px 12px',
          color: '#475569',
          fontSize: 13,
          cursor: 'pointer',
          minWidth: 180,
        }}
      >
        <Search size={14} />
        <span>Quick search…</span>
      </div>

      {/* Live Clock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#00d4ff', fontSize: 13, fontWeight: 600, padding: '4px 10px', background: 'rgba(0,212,255,0.05)', borderRadius: 8, border: '1px solid rgba(0,212,255,0.1)' }}>
        <Clock size={14} />
        <span>{time.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      {/* Notifications */}
      <button
        className="btn btn-ghost"
        style={{ padding: 8, borderRadius: 8, position: 'relative' }}
      >
        <Bell size={18} />
        <span
          style={{
            position: 'absolute',
            top: 6, right: 6,
            width: 7, height: 7,
            borderRadius: '50%',
            background: '#00d4ff',
            boxShadow: '0 0 6px #00d4ff',
          }}
        />
      </button>

      {/* User avatar */}
      {userProfile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src={userProfile.photo_url || `https://api.dicebear.com/8.x/identicon/svg?seed=${userProfile.uid}`}
            alt="avatar"
            className="avatar avatar-ring"
            style={{ width: 36, height: 36 }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.2 }}>
              {userProfile.display_name || 'User'}
            </span>
            <RoleBadge role={userProfile.role} />
          </div>
        </div>
      )}
    </header>
  );
}
