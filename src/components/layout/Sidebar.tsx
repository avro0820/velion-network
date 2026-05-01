import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Globe, FileText, MessageSquare, Users,
  Network, User, ShieldCheck, ChevronLeft, ChevronRight,
  LogOut, Settings, Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/network',   icon: <Network size={18} />,          label: 'Network' },
  { to: '/platforms', icon: <Globe size={18} />,            label: 'Platforms' },
  { to: '/templates', icon: <FileText size={18} />,         label: 'Templates' },
  { to: '/chat',      icon: <MessageSquare size={18} />,    label: 'Messages' },
  { to: '/profile',   icon: <User size={18} />,             label: 'Profile' },
  { to: '/moderator', icon: <Users size={18} />,            label: 'Moderator', roles: ['admin','moderator'] },
  { to: '/admin',     icon: <ShieldCheck size={18} />,      label: 'Admin',     roles: ['admin'] },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { userProfile, signOut, isAdmin, isModerator } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const canSee = (item: NavItem) => {
    if (!item.roles) return true;
    if (item.roles.includes('admin') && !isAdmin) return false;
    if (item.roles.includes('moderator') && !isModerator) return false;
    return true;
  };

  const w = collapsed ? 68 : 260;

  return (
    <aside
      style={{
        width: w,
        minWidth: w,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(10,22,40,0.98)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        transition: 'width 0.25s ease',
        overflow: 'hidden',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? '20px 0' : '20px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          minHeight: 64,
        }}
      >
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Zap size={16} color="#050a14" fill="#050a14" />
            </div>
            <span
              style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px' }}
              className="gradient-text"
            >
              VELION
            </span>
          </div>
        )}
        {collapsed && (
          <div
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Zap size={16} color="#050a14" fill="#050a14" />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="btn btn-ghost"
            style={{ padding: 6, borderRadius: 6, color: '#475569' }}
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
          <button
            onClick={() => setCollapsed(false)}
            className="btn btn-ghost"
            style={{ padding: 6, borderRadius: 6, color: '#475569' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {navItems.filter(canSee).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: collapsed ? '10px 0' : '10px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 10,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
              transition: 'all 0.15s ease',
              color: isActive ? '#00d4ff' : '#94a3b8',
              background: isActive ? 'rgba(0,212,255,0.1)' : 'transparent',
              border: `1px solid ${isActive ? 'rgba(0,212,255,0.2)' : 'transparent'}`,
            })}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Sign Out */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          padding: collapsed ? '12px 0' : '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {!collapsed && userProfile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px' }}>
            <img
              src={userProfile.photo_url || `https://api.dicebear.com/8.x/identicon/svg?seed=${userProfile.uid}`}
              alt="avatar"
              className="avatar"
              style={{ width: 34, height: 34 }}
            />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userProfile.display_name || userProfile.email}
              </p>
              <p style={{ fontSize: 11, color: '#475569', textTransform: 'capitalize' }}>{userProfile.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="btn btn-ghost"
          style={{
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 10,
            padding: collapsed ? '10px 0' : '10px 12px',
            borderRadius: 10,
            color: '#ef4444',
            width: '100%',
          }}
        >
          <LogOut size={16} />
          {!collapsed && <span style={{ fontSize: 14, fontWeight: 500 }}>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
