import React, { useState } from 'react';
import { Shield, Mail, Lock, Key, ChevronRight, AlertCircle } from 'lucide-react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_URL || "https://folio-g049.onrender.com/api";

export function AuthScreen() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'creator' | 'invited'>('creator');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (mode === 'creator') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      } else {
        if (!secretCode) {
          setError('You must provide the Secret Code to prove thyself.');
          setLoading(false);
          return;
        }

        const res = await fetch(`${BASE_URL}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, secret_code: secretCode })
        });

        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.detail || 'Failed to authenticate');
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-[#222] rounded-full flex items-center justify-center mb-4 border border-[#333]">
            <Shield className="w-10 h-10 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">
            PROVE THYSELF! ⚔️
          </h1>
          <p className="text-gray-400 text-center text-sm">
            Welcome back, Architect. Enter your credentials to access the Sanctuary.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex p-1 bg-[#1A1A1A] rounded-xl mb-6 border border-[#333]">
          <button
            type="button"
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === 'creator' 
                ? 'bg-[#333] text-white shadow-md' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
            onClick={() => { setMode('creator'); setError(''); }}
          >
            I am the Creator
          </button>
          <button
            type="button"
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === 'invited' 
                ? 'bg-[#333] text-white shadow-md' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
            onClick={() => { setMode('invited'); setError(''); }}
          >
            I was Invited
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-4 bg-[#1A1A1A] p-6 rounded-2xl border border-[#333]">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  className="block w-full pl-10 pr-3 py-3 border border-[#333] rounded-xl bg-[#0A0A0A] text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="architect@valhalla.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoCapitalize="none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  className="block w-full pl-10 pr-3 py-3 border border-[#333] rounded-xl bg-[#0A0A0A] text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {mode === 'invited' && (
              <div className="space-y-1 pt-2 border-t border-[#333] mt-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Secret Invite Code</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-[#333] rounded-xl bg-[#0A0A0A] text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter the sacred code..."
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value)}
                    autoCapitalize="none"
                  />
                </div>
              </div>
            )}
          </div>
          
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-white text-black py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-200 active:bg-gray-300 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span className="opacity-70">Authenticating...</span>
            ) : (
              <>
                <span>{mode === 'creator' ? 'Enter Sanctuary' : 'Submit Code'}</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
