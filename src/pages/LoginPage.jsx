import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ds/components/buttons/Button';
import { IconButton } from '../ds/components/buttons/IconButton';
import { Input } from '../ds/components/forms/Input';

export default function LoginPage() {
  const { loginWithGoogle, signup, login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  async function handleGoogleLogin() {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/', { state: { loginSuccess: true } });
    } catch (err) {
      console.error('Google Login error:', err);
      setError('Something went wrong signing in with Google.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email || !password) {
      return setError('Please fill in all fields.');
    }
    if (!isLogin && !name) {
      return setError('Please enter your name.');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    try {
      setError('');
      setLoading(true);
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
      navigate('/', { state: { loginSuccess: true } });
    } catch (err) {
      console.error('Auth error:', err);
      let msg = 'Something went wrong.';
      if (err.code === 'auth/email-already-in-use') msg = 'This email is already in use.';
      if (err.code === 'auth/invalid-email') msg = 'Invalid email address.';
      if (err.code === 'auth/weak-password') msg = 'Password is too weak.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Wrong email or password.';
      }
      setError(`${msg}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px 20px',
        background: 'var(--surface-page)',
      }}
    >
      <div className="sd-slide-in" style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <img src="/logo-blue.svg" width="60" height="60" style={{ borderRadius: 18, boxShadow: 'var(--shadow-md)' }} alt="Strength Data" />
          <h1 style={{ margin: '16px 0 6px', fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-.02em', color: 'var(--text-primary)' }}>
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h1>
          <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {isLogin ? 'Pick up your training right where you left off' : 'Start tracking your progress today'}
          </p>
        </div>

        {error && (
          <div
            className="sd-slide-in"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 14px', marginBottom: 14,
              background: 'var(--red-tint)', color: 'var(--red-600)',
              border: '1px solid var(--red-500)', borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-xs)', fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!isLogin && (
            <Input icon={<User size={18} />} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          )}
          <Input icon={<Mail size={18} />} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            type={showPassword ? 'text' : 'password'}
            icon={<Lock size={18} />}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            trailing={
              <IconButton ariaLabel="Toggle password" variant="ghost" size="sm" onClick={() => setShowPassword((s) => !s)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </IconButton>
            }
          />
          <Button type="submit" variant="primary" fullWidth size="lg" disabled={loading} trailingIcon={!loading ? <ArrowRight size={16} /> : null} style={{ marginTop: 4 }}>
            {loading ? '…' : isLogin ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
        </div>

        <Button
          variant="secondary"
          fullWidth
          size="lg"
          disabled={loading}
          onClick={handleGoogleLogin}
          icon={<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" height="18" alt="" />}
        >
          Continue with Google
        </Button>

        <p style={{ textAlign: 'center', marginTop: 22, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => { setIsLogin((v) => !v); setError(''); }}
            style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: 'var(--text-link)', fontWeight: 700, fontFamily: 'var(--font-sans)', fontSize: 'inherit' }}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
