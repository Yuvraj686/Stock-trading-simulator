import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ShieldCheck } from 'lucide-react';

export function Signup() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: `${firstName} ${lastName}`.trim(),
          email: email,
          password: password,
          balance: 0, // Initial balance, can be updated later
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Signup successful, redirect to login page
        navigate('/login');
      } else {
        setError(data.detail || 'Failed to create account. Email might already be registered.');
      }
    } catch (err) {
      console.error('Signup error:', err);
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
          <h1 className="text-3xl font-black font-headline tracking-tighter">Join the Atelier</h1>
          <p className="text-on-surface-variant font-medium">Start your journey to financial precision today.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6 bg-white p-8 rounded-2xl editorial-shadow">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-medium text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">First Name</label>
              <input 
                type="text" 
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-black transition-all"
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Last Name</label>
              <input 
                type="text" 
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-black transition-all"
                placeholder="Doe"
              />
            </div>
          </div>
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-on-surface-variant font-medium">
            <ShieldCheck size={14} />
            <span>Your data is protected by bank-grade security</span>
          </div>
        </form>

        <p className="text-center text-sm font-medium text-on-surface-variant">
          Already have an account? <button onClick={() => navigate('/login')} className="text-black font-bold hover:underline">Sign in</button>
        </p>
      </div>
    </div>
  );
}
