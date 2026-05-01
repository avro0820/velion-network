import React from 'react';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 18, md: 28, lg: 48 };

export default function LoadingSpinner({ size = 'md', className = '' }: Props) {
  const s = sizes[size];
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin-slow ${className}`}
      style={{ display: 'block' }}
    >
      <circle cx="12" cy="12" r="10" stroke="rgba(0,212,255,0.2)" strokeWidth="2.5" />
      <path
        d="M12 2 A10 10 0 0 1 22 12"
        stroke="#00d4ff"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PageLoader() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#050a14',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        zIndex: 999,
      }}
    >
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          fontFamily: "'Space Grotesk', sans-serif",
          letterSpacing: '-0.5px',
          marginBottom: 8,
        }}
        className="gradient-text"
      >
        VELION
      </div>
      <LoadingSpinner size="lg" />
      <p style={{ color: '#475569', fontSize: 13, marginTop: 8 }}>Initializing secure session…</p>
    </div>
  );
}
