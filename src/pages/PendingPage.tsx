import React from 'react';
import { Clock, Mail, LogOut, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export default function PendingPage() {
  const { userProfile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleRefresh = async () => {
    await refreshProfile();
    if (userProfile?.status === 'approved') {
      toast.success('Account approved! Redirecting…');
      navigate('/dashboard');
    } else {
      toast.info('Still pending approval. Check back soon.');
    }
  };

  const isSuspended = userProfile?.status === 'suspended';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: '#050a14',
        backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(245,158,11,0.08) 0%, transparent 60%)',
      }}
    >
      <div className="glass animate-fade-up" style={{ width: '100%', maxWidth: 480, padding: 48, textAlign: 'center' }}>
        <div
          style={{
            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 24px',
            background: isSuspended ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
            border: `2px solid ${isSuspended ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {isSuspended
            ? <LogOut size={32} color="#ef4444" />
            : <Clock size={32} color="#f59e0b" style={{ animation: 'pulse-glow 2s infinite' }} />
          }
        </div>

        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 26, marginBottom: 12, color: isSuspended ? '#ef4444' : '#f59e0b' }}>
          {isSuspended ? 'Account Suspended' : 'Awaiting Approval'}
        </h1>

        <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 8, fontSize: 15 }}>
          {isSuspended
            ? 'Your account has been suspended. Contact an administrator for more information.'
            : 'Your access request is under review. An administrator will approve your account shortly.'
          }
        </p>

        {userProfile?.system_message && (
          <div
            style={{
              margin: '20px 0',
              padding: '14px 18px',
              background: 'rgba(0,212,255,0.05)',
              border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 10,
              textAlign: 'left',
            }}
          >
            <p style={{ fontSize: 12, color: '#00d4ff', fontWeight: 600, marginBottom: 4 }}>📨 System Message</p>
            <p style={{ fontSize: 14, color: '#e2e8f0' }}>{userProfile.system_message}</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 28, justifyContent: 'center' }}>
          {!isSuspended && (
            <button onClick={handleRefresh} className="btn btn-primary" style={{ gap: 8 }}>
              <RefreshCw size={15} />
              Check Status
            </button>
          )}
          <button onClick={handleSignOut} className="btn btn-secondary" style={{ gap: 8 }}>
            <LogOut size={15} />
            Sign Out
          </button>
        </div>

        <p style={{ color: '#475569', fontSize: 13, marginTop: 24 }}>
          Logged in as <span style={{ color: '#94a3b8' }}>{userProfile?.email}</span>
        </p>
      </div>
    </div>
  );
}
