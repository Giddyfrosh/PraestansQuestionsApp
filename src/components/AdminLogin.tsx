import React, { useState } from 'react';
import { ArrowLeft, Lock } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
  onCancel: () => void;
}

export default function AdminLogin({ onLogin, onCancel }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const envUser = (import.meta as any).env?.VITE_ADMIN_USERNAME || 'Giddyfrosh';
    const envPass = (import.meta as any).env?.VITE_ADMIN_PASSWORD || 'G1ddyfr05h';

    if (username === envUser && password === envPass) {
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-slate-900 absolute inset-0 z-50">
      <div className="max-w-md w-full bg-slate-800 rounded-3xl p-8 shadow-2xl border-t-8 border-violet-600">
        <button 
          onClick={onCancel}
          className="text-slate-400 hover:text-white flex items-center gap-2 mb-8 transition-colors text-sm font-bold uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel
        </button>

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-violet-900 border border-violet-700 flex items-center justify-center shadow-inner">
            <Lock className="w-8 h-8 text-violet-400" />
          </div>
        </div>

        <h2 className="text-2xl font-black text-white text-center mb-8 uppercase tracking-widest">System Access</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2 block">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(false); }}
              className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-3 text-white focus:border-violet-500 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(false); }}
              className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-3 text-white focus:border-violet-500 outline-none transition-colors"
            />
          </div>

          {error && <p className="text-red-400 text-sm font-bold text-center mt-2">Invalid credentials</p>}

          <button 
            type="submit"
            className="w-full mt-4 bg-violet-600 hover:bg-violet-500 text-white font-black py-4 rounded-xl uppercase tracking-widest transition-colors shadow-lg shadow-violet-900/50"
          >
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
}
