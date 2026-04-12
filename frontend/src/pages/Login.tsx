import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ShieldCheck } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new URLSearchParams();
      formData.append('username', email); // OAuth2 expects 'username'
      formData.append('password', password);

      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access_token);
        navigate('/dashboard');
      } else {
        setError(data.detail || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('A network error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl editorial-shadow mb-4">
            <TrendingUp size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black font-headline tracking-tighter">Welcome Back</h1>
          <p className="text-on-surface-variant font-medium">Enter your credentials to access your atelier.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 bg-white p-8 rounded-2xl editorial-shadow">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-medium text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-black transition-all"
              placeholder="john@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-black transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white font-bold py-4 rounded-xl editorial-shadow active:scale-[0.98] transition-all disabled:opacity-70"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-on-surface-variant font-medium">
            <ShieldCheck size={14} />
            <span>Secure, encrypted connection</span>
          </div>
        </form>

        <p className="text-center text-sm font-medium text-on-surface-variant">
          Don't have an account? <button onClick={() => navigate('/signup')} className="text-black font-bold hover:underline">Create one</button>
        </p>
      </div>
    </div>
  );
}
