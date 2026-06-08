import React, { useState } from 'react';
import { Student } from '../types';

interface StudentAuthProps {
  students: Student[];
  onLogin: (student: Student) => void;
  onSignup: (student: Omit<Student, 'id'>) => void;
}

export default function StudentAuth({ students, onLogin, onSignup }: StudentAuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const found = students.find(s => (s.email === email || s.matricNumber === email) && s.password === password);
      if (found) {
        onLogin(found);
      } else {
        setError('Invalid credentials');
      }
    } else {
      if (!email || !password || !fullName || !matricNumber) {
        setError('All fields are required');
        return;
      }
      if (students.some(s => s.email === email)) {
        setError('Email already exists');
        return;
      }
      if (students.some(s => s.matricNumber === matricNumber)) {
        setError('Matric Number already exists');
        return;
      }
      onSignup({ email, password, fullName, matricNumber });
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-slate-50 min-h-full">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-violet-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-400 rounded-2xl flex items-center justify-center shadow-inner mx-auto mb-4">
            <span className="text-violet-950 font-black text-3xl">Q</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800">{isLogin ? 'Student Login' : 'Create Account'}</h2>
          <p className="text-slate-500 mt-2 text-sm">
            {isLogin ? 'Welcome back to the portal' : 'Register for access to exams'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-slate-800 focus:border-violet-500 focus:bg-white outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Matric Number</label>
                <input
                  type="text"
                  value={matricNumber}
                  onChange={e => setMatricNumber(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-slate-800 focus:border-violet-500 focus:bg-white outline-none transition-colors"
                  placeholder="CSC/21/..."
                />
              </div>
            </>
          )}

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-slate-800 focus:border-violet-500 focus:bg-white outline-none transition-colors"
              placeholder="student@university.edu"
            />
          </div>
          
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-slate-800 focus:border-violet-500 focus:bg-white outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="w-full mt-4 bg-violet-900 hover:bg-violet-800 text-white font-black py-4 rounded-xl uppercase tracking-widest transition-colors shadow-lg shadow-violet-200"
          >
            {isLogin ? 'Sign In' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-sm font-bold text-violet-600 hover:text-violet-800"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}
