import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: number;
  noPadding?: boolean;
}

export default function Modal({ open, onClose, title, children, maxWidth = 560, noPadding }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="glass animate-fade-up"
        style={{ width: '100%', maxWidth, maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className="btn btn-ghost"
              style={{ padding: '6px', borderRadius: 8 }}
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div style={noPadding ? {} : { padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}
