import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, Mail, Lock, User, Chrome } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('All fields required'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await signUp(form.email, form.password, form.name);
      toast.success('Account created! Awaiting approval.');
      navigate('/pending');
    } catch (err: any) {
      const msg = err?.code === 'auth/email-already-in-use' ? 'Email already registered' : err?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.message || 'Google sign-in failed');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: '#050a14',
        backgroundImage: `
          radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.1) 0%, transparent 60%),
          linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px)
        `,
        backgroundSize: 'auto, 40px 40px, 40px 40px',
      }}
    >
      <div className="glass animate-fade-up" style={{ width: '100%', maxWidth: 460, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px',
              background: 'linear-gradient(135deg, #7c3aed, #00d4ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(124,58,237,0.3)',
            }}
          >
            <Zap size={24} color="#050a14" fill="#050a14" />
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 24 }} className="gradient-text">
            Request Access
          </h1>
          <p style={{ color: '#475569', fontSize: 13, marginTop: 6 }}>
            Your account will be reviewed before activation
          </p>
        </div>

        <button onClick={handleGoogle} className="btn btn-secondary" style={{ width: '100%', marginBottom: 20 }}>
          <Chrome size={18} /> Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <hr className="divider" style={{ flex: 1 }} />
          <span style={{ color: '#475569', fontSize: 12 }}>or email</span>
          <hr className="divider" style={{ flex: 1 }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { key: 'name', label: 'Full Name', type: 'text', icon: <User size={15} />, placeholder: 'John Doe' },
            { key: 'email', label: 'Email', type: 'email', icon: <Mail size={15} />, placeholder: 'you@example.com' },
          ].map(({ key, label, type, icon, placeholder }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 5 }}>{label}</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#475569' }}>{icon}</span>
                <input type={type} className="input" style={{ paddingLeft: 38 }} placeholder={placeholder} value={(form as any)[key]} onChange={set(key)} />
              </div>
            </div>
          ))}

          {['password', 'confirm'].map((key) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 5 }}>
                {key === 'password' ? 'Password' : 'Confirm Password'}
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input"
                  style={{ paddingLeft: 38, paddingRight: 40 }}
                  placeholder="••••••••"
                  value={(form as any)[key]}
                  onChange={set(key)}
                />
                {key === 'confirm' && (
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                )}
              </div>
            </div>
          ))}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '13px', marginTop: 4 }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#475569' }}>
          Already have access?{' '}
          <Link to="/login" style={{ color: '#00d4ff', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
