import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { loginWithGoogle, signup, login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
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
      console.error("Google Login error:", err);
      setError('Google ile giriş yapılırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!email || !password) {
      return setError('Lütfen tüm alanları doldurun.');
    }

    if (!isLogin && !name) {
      return setError('Lütfen isminizi girin.');
    }

    if (password.length < 6) {
      return setError('Şifre en az 6 karakter olmalıdır.');
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
      console.error("Auth error:", err);
      let msg = 'Bir hata oluştu.';
      if (err.code === 'auth/email-already-in-use') msg = 'Bu e-posta adresi zaten kullanımda.';
      if (err.code === 'auth/invalid-email') msg = 'Geçersiz e-posta adresi.';
      if (err.code === 'auth/weak-password') msg = 'Şifre çok zayıf.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'E-posta veya şifre hatalı.';
      }
      setError(`${msg} (${err.code})`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background-dark p-4 text-white bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(13,242,147,0.15),rgba(16,34,27,0))]">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-white/10 bg-[#1C1C1E]/80 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <img
            src="/logo-mark.svg"
            alt="Strength Data"
            className="mx-auto h-16 w-16 rounded-2xl shadow-lg mb-4"
          />
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {isLogin ? 'Tekrar Hoş Geldiniz' : 'Hesap Oluşturun'}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {isLogin ? 'Antrenmanlarınıza kaldığınız yerden devam edin' : 'Gelişiminizi takip etmeye hemen başlayın'}
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <span className="material-symbols-outlined text-lg">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {!isLogin && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-3 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition"
                placeholder="Adınız Soyadınız"
              />
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-3 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition"
              placeholder="E-posta adresi"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-10 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition"
              placeholder="Şifre"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-background-dark transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 mt-2"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-background-dark border-t-transparent" />
            ) : (
              <>
                {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-[#1C1C1E] px-2 text-gray-500">veya</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-white py-3.5 text-sm font-bold text-black transition hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
          Google ile Devam Et
        </button>
        
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            {isLogin ? (
              <>Hesabınız yok mu? <span className="text-primary font-bold">Kayıt Olun</span></>
            ) : (
              <>Zaten hesabınız var mı? <span className="text-primary font-bold">Giriş Yapın</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
