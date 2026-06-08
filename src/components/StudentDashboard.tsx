import React, { useState } from 'react';
import { Student, QuizAttempt, Subject, AIReport } from '../types';
import { LogOut, BookOpen, Activity, User, Trophy, BarChart, Sparkles, TrendingUp, TrendingDown, Download, Search, SearchIcon, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface StudentDashboardProps {
  student: Student;
  allStudents: Student[];
  attempts: QuizAttempt[];
  subjects: Subject[];
  onTakeExam: () => void;
  onLogout: () => void;
  onUpdateStudent: (student: Student) => void;
}

export default function StudentDashboard({ student, allStudents, attempts, subjects, onTakeExam, onLogout, onUpdateStudent }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'leaderboard' | 'deficits' | 'settings'>('overview');
  
  // Settings Form State
  const [fullName, setFullName] = useState(student.fullName);
  const [matricNumber, setMatricNumber] = useState(student.matricNumber);
  const [phone, setPhone] = useState(student.phone || '');
  const [isAnonymous, setIsAnonymous] = useState(student.isAnonymous || false);
  const [saveMessage, setSaveMessage] = useState('');

  // AI Diagnostic State
  const [report, setReport] = useState<AIReport | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [aiError, setAiError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [attemptSearch, setAttemptSearch] = useState('');

  const studentAttempts = attempts.filter(a => a.studentId === student.id);
  
  const filteredAttempts = studentAttempts.filter(a => {
    if (!attemptSearch) return true;
    const subj = subjects.find(s => s.id === a.subjectId);
    if (!subj) return false;
    const subjName = subj.name.toLowerCase();
    const scoreStr = Math.round((a.score / a.totalQuestions) * 100).toString();
    const searchLower = attemptSearch.toLowerCase();
    return subjName.includes(searchLower) || scoreStr.includes(searchLower);
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  let averageScore = 0;
  if (studentAttempts.length > 0) {
    const totalPercentage = studentAttempts.reduce((acc, attempt) => {
      return acc + (attempt.score / attempt.totalQuestions) * 100;
    }, 0);
    averageScore = Math.round(totalPercentage / studentAttempts.length);
  }

  const subjectProgress = subjects.map(subject => {
    const subjAttempts = studentAttempts.filter(a => a.subjectId === subject.id);
    if (subjAttempts.length === 0) return null;
    const bestScore = Math.max(...subjAttempts.map(a => Math.round((a.score / a.totalQuestions) * 100)));
    return { subject, bestScore, attemptsCount: subjAttempts.length };
  }).filter(Boolean) as { subject: Subject, bestScore: number, attemptsCount: number }[];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStudent({
      ...student,
      fullName,
      matricNumber,
      phone,
      isAnonymous
    });
    setSaveMessage('Profile saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleGenerateDiagnostics = async () => {
    setIsEvaluating(true);
    setAiError('');
    const history = studentAttempts.map(a => {
      const subj = subjects.find(s => s.id === a.subjectId);
      const missedQuestions = subj ? subj.questions.filter(q => a.answers[q.id] !== undefined && a.answers[q.id] !== q.correctAnswerIndex).map(q => q.questionText) : [];
      return {
        subject: subj?.name || a.subjectId,
        scorePercentage: Math.round((a.score / a.totalQuestions) * 100),
        timeTakenSeconds: a.timeTakenSeconds,
        missedConcepts: missedQuestions
      };
    });

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName: student.fullName, examHistory: history })
      });
      const data = await res.json();
      if (data.report) setReport({ ...data.report, generatedAt: new Date().toISOString() });
      else setAiError(data.error || 'Failed to generate report');
    } catch (err) {
      setAiError('Network error: ' + String(err));
    }
    setIsEvaluating(false);
  };

  const leaderboard = allStudents.map(s => {
    const sAttempts = attempts.filter(a => a.studentId === s.id);
    const avgScore = sAttempts.length > 0 ? sAttempts.reduce((acc, a) => acc + (a.score / a.totalQuestions) * 100, 0) / sAttempts.length : 0;
    return { student: s, avgScore: Math.round(avgScore), attemptsCount: sAttempts.length };
  }).filter(l => l.attemptsCount > 0).sort((a, b) => b.avgScore - a.avgScore);

  const filteredLeaderboard = leaderboard.filter(entry => {
    if (!searchQuery) return true;
    const name = entry.student.isAnonymous && entry.student.id !== student.id ? 'Anonymous Student' : entry.student.fullName;
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           entry.student.matricNumber.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const podium = leaderboard.slice(0, 3);
  const others = filteredLeaderboard.filter(l => !podium.includes(l));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-slate-50 relative print:bg-white print:overflow-visible">
      <div className="w-full md:w-64 bg-white border-r border-slate-100 flex-shrink-0 flex flex-col hidden md:flex print:hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
           <img src="https://res.cloudinary.com/di8wjyfin/image/upload/v1780876647/praestans_zkibtq.png" alt="Praestans Logo" className="w-8 h-8 object-contain" />
           <h3 className="font-black text-slate-800 text-xl tracking-tight">Portal</h3>
        </div>
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'overview' ? 'bg-violet-50 text-violet-700' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Activity className="w-4 h-4" /> Overview
          </button>
          <button onClick={() => setActiveTab('leaderboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'leaderboard' ? 'bg-violet-50 text-violet-700' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Trophy className="w-4 h-4" /> Leaderboard
          </button>
          <button onClick={() => setActiveTab('deficits')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'deficits' ? 'bg-violet-50 text-violet-700' : 'text-slate-500 hover:bg-slate-50'}`}>
            <BarChart className="w-4 h-4" /> Deficit Space
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'settings' ? 'bg-violet-50 text-violet-700' : 'text-slate-500 hover:bg-slate-50'}`}>
            <User className="w-4 h-4" /> Settings
          </button>
        </div>
        <div className="p-4 border-t border-slate-100">
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-red-500 font-bold transition-colors text-sm uppercase tracking-widest bg-slate-50 hover:bg-red-50 px-4 py-3 rounded-xl">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      <div className="md:hidden flex bg-white border-b border-slate-100 overflow-x-auto p-2">
        <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${activeTab === 'overview' ? 'bg-violet-50 text-violet-700' : 'text-slate-500'}`}><Activity className="w-4 h-4" /> Overview</button>
        <button onClick={() => setActiveTab('leaderboard')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${activeTab === 'leaderboard' ? 'bg-violet-50 text-violet-700' : 'text-slate-500'}`}><Trophy className="w-4 h-4" /> Leaderboard</button>
        <button onClick={() => setActiveTab('deficits')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${activeTab === 'deficits' ? 'bg-violet-50 text-violet-700' : 'text-slate-500'}`}><BarChart className="w-4 h-4" /> Deficits</button>
        <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${activeTab === 'settings' ? 'bg-violet-50 text-violet-700' : 'text-slate-500'}`}><User className="w-4 h-4" /> Settings</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 print:p-0 print:overflow-visible">
        <div className="max-w-5xl mx-auto pb-20 md:pb-0">
          
          <div className="hidden print:block mb-8">
            <h1 className="text-3xl font-black text-slate-800">Student Performance Report</h1>
            <p className="text-slate-500">{student.fullName} • {student.matricNumber}</p>
          </div>

          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-between items-center mb-6 print:hidden">
                <h2 className="text-2xl font-black text-slate-800">Overview</h2>
                <button 
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-slate-800 text-white font-bold px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm uppercase tracking-widest"
                >
                  <Download className="w-4 h-4" />
                  Download Report
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="md:col-span-1 bg-violet-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-violet-200">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-violet-800 rounded-full opacity-50 blur-2xl"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-6 border border-white/20">
                      <span className="text-2xl font-black">{student.fullName.charAt(0)}</span>
                    </div>
                    <p className="text-xs font-bold text-violet-300 uppercase tracking-widest mb-1">Profile</p>
                    <h3 className="text-2xl font-black mb-2">{student.fullName}</h3>
                    <p className="text-violet-200 font-mono text-sm mb-1">{student.matricNumber}</p>
                    <p className="text-violet-300 text-sm mb-6">{student.email}</p>
                    
                    <button onClick={onTakeExam} className="w-full bg-amber-400 text-violet-950 font-black py-3 rounded-xl uppercase tracking-widest hover:bg-amber-300 transition-colors shadow-lg shadow-amber-400/20">
                      Available Exams
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                        <Activity className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-700">Overall Average</h3>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-5xl font-black text-slate-800">{averageScore}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full mt-6 overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${averageScore}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-700">Exams Taken</h3>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-5xl font-black text-slate-800">{studentAttempts.length}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-400 mt-6 tracking-widest uppercase">Total Attempts</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
                <h3 className="text-xl font-black text-slate-800 mb-6">Subject Mastery</h3>
                {subjectProgress.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold">No exams taken yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {subjectProgress.map((prog, idx) => (
                      <div key={idx} className="border-2 border-slate-100 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded mb-2 inline-block text-white" style={{ backgroundColor: prog.subject.primaryColor || '#8b5cf6' }}>
                              {prog.subject.id}
                            </span>
                            <h4 className="font-bold text-slate-800 line-clamp-1">{prog.subject.name}</h4>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-black" style={{ color: prog.subject.primaryColor || '#8b5cf6' }}>{prog.bestScore}%</span>
                          </div>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${prog.bestScore}%`, backgroundColor: prog.subject.primaryColor || '#8b5cf6' }}></div>
                        </div>
                        <p className="text-xs font-bold text-slate-400 mt-3">{prog.attemptsCount} attempt{prog.attemptsCount > 1 ? 's' : ''}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 mt-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                  <h3 className="text-xl font-black text-slate-800">Past Exam Logs</h3>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search by subject or score..." 
                      value={attemptSearch}
                      onChange={(e) => setAttemptSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:border-violet-400 transition-colors text-sm font-medium text-slate-700"
                    />
                  </div>
                </div>
                
                {filteredAttempts.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                     <p className="text-slate-500 font-bold">No past attempts found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAttempts.map((a, i) => {
                      const subj = subjects.find(s => s.id === a.subjectId);
                      return (
                        <div key={i} className="flex items-center justify-between p-4 border border-slate-100 bg-slate-50 rounded-2xl flex-wrap gap-4">
                          <div>
                            <p className="font-bold text-slate-800">{subj?.name || a.subjectId}</p>
                            <p className="text-xs text-slate-500 mt-1">{new Date(a.date).toLocaleString()} • {Math.floor(a.timeTakenSeconds / 60)}m {(a.timeTakenSeconds % 60).toString().padStart(2, '0')}s</p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-lg text-slate-800">{Math.round((a.score/a.totalQuestions)*100)}%</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Score</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[32px] shadow-xl border-t-[12px] border-amber-400 p-8 md:p-12 print:shadow-none print:border-t-0">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-slate-800 mb-2">Global Leaderboard</h2>
                <p className="text-slate-500">Department rankings based on average quiz performance</p>
              </div>

              {podium.length > 0 && (
                <div className="flex justify-center items-end gap-2 md:gap-6 mb-16 mt-8">
                  {/* Rank 2 */}
                  {podium[1] && (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center font-black text-2xl text-slate-600 shadow-inner z-10 -mb-4 border-4 border-white">2</div>
                      <div className="bg-slate-100 rounded-t-xl w-24 md:w-32 h-24 flex justify-center items-end pb-4 font-bold text-slate-800 text-center px-2">
                        {podium[1].student.isAnonymous && podium[1].student.id !== student.id ? 'Anon' : podium[1].student.fullName.split(' ')[0]}
                      </div>
                      <p className="font-black mt-2 text-slate-600">{podium[1].avgScore}%</p>
                    </div>
                  )}

                  {/* Rank 1 */}
                  {podium[0] && (
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-amber-400 rounded-full flex items-center justify-center font-black text-3xl text-amber-900 shadow-xl shadow-amber-400/50 z-10 -mb-6 border-4 border-white"><Star className="w-8 h-8 text-white fill-current" /></div>
                      <div className="bg-gradient-to-t from-amber-200 to-amber-100 rounded-t-xl w-28 md:w-36 h-36 flex justify-center items-end pb-4 font-black text-amber-900 text-center px-2">
                        {podium[0].student.isAnonymous && podium[0].student.id !== student.id ? 'Anonymous' : podium[0].student.fullName.split(' ')[0]}
                      </div>
                      <p className="font-black mt-2 text-amber-600">{podium[0].avgScore}%</p>
                    </div>
                  )}

                  {/* Rank 3 */}
                  {podium[2] && (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center font-black text-2xl text-orange-800 shadow-inner z-10 -mb-4 border-4 border-white">3</div>
                      <div className="bg-orange-50 rounded-t-xl w-24 md:w-32 h-20 flex justify-center items-end pb-4 font-bold text-orange-900 text-center px-2">
                        {podium[2].student.isAnonymous && podium[2].student.id !== student.id ? 'Anon' : podium[2].student.fullName.split(' ')[0]}
                      </div>
                      <p className="font-black mt-2 text-orange-600">{podium[2].avgScore}%</p>
                    </div>
                  )}
                </div>
              )}

              <div className="relative mb-8 max-w-sm mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search student or matric..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-amber-400 transition-colors font-medium text-slate-700"
                />
              </div>

              <div className="space-y-4">
                {others.map((entry) => {
                  const idx = leaderboard.findIndex(l => l.student.id === entry.student.id);
                  const isMe = entry.student.id === student.id;
                  const displayName = entry.student.isAnonymous && !isMe ? 'Anonymous Student' : entry.student.fullName;
                  return (
                    <div key={entry.student.id} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${isMe ? 'border-amber-400 bg-amber-50 shadow-inner p-6' : 'border-slate-100 bg-slate-50'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black bg-white text-slate-400 shadow-sm border border-slate-100`}>
                          #{idx + 1}
                        </div>
                        <div>
                          <h4 className={`font-bold ${isMe ? 'text-amber-900' : 'text-slate-800'} flex items-center gap-2`}>
                            {displayName} {isMe && <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest">You</span>}
                          </h4>
                          {!entry.student.isAnonymous || isMe ? (
                            <p className="text-xs font-mono text-slate-500 mt-1">{entry.student.matricNumber}</p>
                          ) : null}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-black ${isMe ? 'text-amber-600' : 'text-slate-800'}`}>{entry.avgScore}%</p>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Avg Score</p>
                      </div>
                    </div>
                  );
                })}
                {filteredLeaderboard.length === 0 && (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                     <p className="text-slate-500 font-bold">No results found.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'deficits' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-slate-900 rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600 rounded-full opacity-20 blur-3xl"></div>
                
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                        <Sparkles className="w-6 h-6 text-amber-400" />
                      </div>
                      <h2 className="text-3xl font-black">Deficit Space</h2>
                    </div>
                    <p className="text-slate-400 mb-8 max-w-sm">
                      Our AI engine analyzes your exact wrong answers, timing patterns, and identifies which concepts you must review before your final exams.
                    </p>

                    {studentAttempts.length < 1 ? (
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                        <p className="text-slate-300 font-bold">Not enough data. Take at least one exam first.</p>
                      </div>
                    ) : !report ? (
                      <button 
                        onClick={handleGenerateDiagnostics}
                        disabled={isEvaluating}
                        className="bg-amber-400 hover:bg-amber-300 text-violet-950 font-black px-8 py-4 rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-amber-400/20 disabled:opacity-50 disabled:cursor-wait"
                      >
                        {isEvaluating ? 'Analyzing History...' : 'Generate AI Blueprint'}
                      </button>
                    ) : (
                      <button onClick={handleGenerateDiagnostics} className="text-sm font-bold text-violet-300 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2 border border-white/10 bg-white/5 px-4 py-2 rounded-lg">
                        <Activity className="w-4 h-4" /> Re-analyze Data
                      </button>
                    )}

                    {aiError && (
                      <p className="text-red-400 mt-4 text-sm font-bold bg-red-400/10 p-3 rounded-xl border border-red-400/20">{aiError}</p>
                    )}
                  </div>

                  {report && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                         <div className="absolute top-0 bottom-0 left-0 w-1 bg-red-500"></div>
                         <h4 className="text-xs font-bold text-red-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                           <TrendingDown className="w-4 h-4" /> Critical Weaknesses
                         </h4>
                         <p className="text-white leading-relaxed">{report.weaknesses}</p>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                         <div className="absolute top-0 bottom-0 left-0 w-1 bg-green-400"></div>
                         <h4 className="text-xs font-bold text-green-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                           <TrendingUp className="w-4 h-4" /> Validated Strengths
                         </h4>
                         <p className="text-white leading-relaxed">{report.strengths}</p>
                      </div>

                      <div className="bg-violet-900/50 border border-violet-500/30 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
                         <div className="absolute top-0 bottom-0 left-0 w-1 bg-amber-400"></div>
                         <h4 className="text-xs font-bold text-amber-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                           <BookOpen className="w-4 h-4" /> Action Plan
                         </h4>
                         <p className="text-white font-medium leading-relaxed">{report.recommendations}</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 md:p-12 max-w-2xl mx-auto">
              <h2 className="text-2xl font-black text-slate-800 mb-8">Account Settings</h2>
              
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Full Name</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-slate-800 focus:border-violet-500 outline-none transition-colors font-bold" required />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Matric Number</label>
                    <input type="text" value={matricNumber} onChange={e => setMatricNumber(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-slate-800 focus:border-violet-500 outline-none transition-colors font-mono" required />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Phone Number</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-slate-800 focus:border-violet-500 outline-none transition-colors" placeholder="+234..." />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Email Address</label>
                  <input type="email" value={student.email} disabled className="w-full bg-slate-100 border-2 border-slate-100 rounded-xl px-4 py-3 text-slate-400 outline-none cursor-not-allowed" />
                  <p className="text-xs text-slate-400 mt-2 font-medium">Email address cannot be changed.</p>
                </div>

                <div className="p-6 bg-violet-50 rounded-2xl flex items-start gap-4 border border-violet-100">
                  <input type="checkbox" id="anon" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} className="mt-1 w-5 h-5 accent-violet-600 rounded" />
                  <div>
                    <label htmlFor="anon" className="font-bold text-violet-900 cursor-pointer block mb-1">Anonymous Leaderboard</label>
                    <p className="text-sm text-violet-700/80">If activated, your real name will be hidden from the public leaderboard. You will appear as "Anonymous Student".</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    {saveMessage && <span className="text-green-600 font-bold text-sm bg-green-50 px-3 py-1 rounded-lg border border-green-200">{saveMessage}</span>}
                  </div>
                  <button type="submit" className="bg-violet-900 text-white font-black px-8 py-3 rounded-xl uppercase tracking-widest shadow-lg shadow-violet-200 hover:opacity-90 transition-opacity">
                    Save Profile
                  </button>
                </div>
              </form>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
