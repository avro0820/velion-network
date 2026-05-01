import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Chrome } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

export default function LoginPage({ defaultMode = 'login' }: { defaultMode?: 'login' | 'register' }) {
  const [isRightPanelActive, setIsRightPanelActive] = useState(defaultMode === 'register');
  const [loading, setLoading] = useState(false);
  
  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsRightPanelActive(defaultMode === 'register');
  }, [defaultMode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.code === 'auth/invalid-credential' ? 'Invalid email or password' : err?.message || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) { toast.error('All fields required'); return; }
    if (regPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await signUp(regEmail, regPassword, regName);
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
    <div className="login-page-wrapper">
      <div className={`login-container ${isRightPanelActive ? 'right-panel-active' : ''}`} id="login-container">
        
        {/* Register Container */}
        <div className="login-form-container sign-up-container">
          <form className="login-form" onSubmit={handleRegister}>
            <h1>Create Account</h1>
            <div className="login-social-container">
              <button type="button" onClick={handleGoogle}><Chrome size={18} /></button>
            </div>
            <span>or use your email for registration</span>
            
            <div className="login-input-group">
              <User />
              <input type="text" placeholder="Full Name" required className="login-input" value={regName} onChange={e => setRegName(e.target.value)} />
            </div>
            <div className="login-input-group">
              <Mail />
              <input type="email" placeholder="Email" required className="login-input" value={regEmail} onChange={e => setRegEmail(e.target.value)} />
            </div>
            <div className="login-input-group">
              <Lock />
              <input type="password" placeholder="Password" required className="login-input" value={regPassword} onChange={e => setRegPassword(e.target.value)} />
            </div>
            
            <button type="submit" disabled={loading} className="login-btn">
              {loading ? 'Processing...' : 'Register'}
            </button>
          </form>
        </div>

        {/* Login Container */}
        <div className="login-form-container sign-in-container">
          <form className="login-form" onSubmit={handleLogin}>
            <h1>Sign in</h1>
            <div className="login-social-container">
              <button type="button" onClick={handleGoogle}><Chrome size={18} /></button>
            </div>
            <span>or use your account</span>
            
            <div className="login-input-group">
              <Mail />
              <input type="email" placeholder="Email" required className="login-input" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
            </div>
            <div className="login-input-group">
              <Lock />
              <input type="password" placeholder="Password" required className="login-input" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
            </div>
            
            <a href="#" className="forgot" onClick={(e) => { e.preventDefault(); toast.info('Please contact an Admin to reset your password.'); }}>
              Forgot your password?
            </a>
            
            <button type="submit" disabled={loading} className="login-btn">
              {loading ? 'Processing...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Overlay Container */}
        <div className="login-overlay-container">
          <div className="login-overlay">
            <div className="login-overlay-panel login-overlay-left">
              <h1>Welcome Back!</h1>
              <p>To keep connected with the VELION network please login with your personal info</p>
              <button type="button" className="login-btn ghost" onClick={() => setIsRightPanelActive(false)}>
                Sign In
              </button>
            </div>
            <div className="login-overlay-panel login-overlay-right">
              <h1>Hello, Agent!</h1>
              <p>Enter your personal details to request access to the intelligence platform</p>
              <button type="button" className="login-btn ghost" onClick={() => setIsRightPanelActive(true)}>
                Sign Up
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
