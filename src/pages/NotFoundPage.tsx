import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#050a14', flexDirection: 'column', gap: 24, padding: 24,
      backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(239,68,68,0.08) 0%, transparent 60%)',
    }}>
      <AlertTriangle size={60} color="#ef4444" style={{ opacity: 0.6 }} />
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 80, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif", color: '#ef4444', lineHeight: 1, marginBottom: 8 }}>
          404
        </h1>
        <p style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>Page Not Found</p>
        <p style={{ color: '#475569', fontSize: 15 }}>The resource you're looking for doesn't exist or has been moved.</p>
      </div>
      <Link to="/dashboard" className="btn btn-primary" style={{ gap: 8, marginTop: 8 }}>
        <Home size={16} /> Back to Dashboard
      </Link>
    </div>
  );
}
