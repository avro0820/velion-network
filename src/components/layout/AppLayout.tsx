import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface Props {
  children: React.ReactNode;
}

export default function AppLayout({ children }: Props) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#050a14' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar />
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 24,
            background: 'radial-gradient(ellipse 80% 60% at 50% -5%, rgba(0,212,255,0.06) 0%, transparent 55%)',
          }}
          className="bg-grid"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
