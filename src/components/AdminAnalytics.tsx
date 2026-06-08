import React, { useState } from 'react';
import { Subject, Student, QuizAttempt, AIReport } from '../types';
import { Trophy, TrendingUp, AlertTriangle, Sparkles, Eye, ArrowLeft, Download, ChevronDown, ChevronUp, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminAnalyticsProps {
  students: Student[];
  attempts: QuizAttempt[];
  subjects: Subject[];
  onDeleteAttempt: (attempt: QuizAttempt) => void;
}

export default function AdminAnalytics({ students, attempts, subjects, onDeleteAttempt }: AdminAnalyticsProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [report, setReport] = useState<AIReport | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState('');
  const [expandedAttemptKey, setExpandedAttemptKey] = useState<string | null>(null);

  // Compute leaderboard
  const leaderboard = students.map(student => {
    const studentAttempts = attempts.filter(a => a.studentId === student.id);
    const avgScore = studentAttempts.length > 0
      ? studentAttempts.reduce((acc, a) => acc + (a.score / a.totalQuestions) * 100, 0) / studentAttempts.length
      : 0;
    
    // Tab violations sum
    const totalViolations = studentAttempts.reduce((acc, a) => acc + (a.tabViolations || 0), 0);

    return {
      student,
      avgScore: Math.round(avgScore),
      attemptsCount: studentAttempts.length,
      totalViolations
    };
  }).sort((a, b) => b.avgScore - a.avgScore);

  const lowPerformers = leaderboard.filter(l => l.avgScore < 50 && l.attemptsCount > 0);
  const topPerformers = leaderboard.filter(l => l.avgScore >= 80 && l.attemptsCount > 0);

  const handleGenerateReport = async () => {
    if (!selectedStudent) return;
    setIsEvaluating(true);
    setError('');
    
    // Aggregate data for AI
    const studentAttempts = attempts.filter(a => a.studentId === selectedStudent.id);
    const history = studentAttempts.map(a => {
      const subj = subjects.find(s => s.id === a.subjectId);
      
      // Figure out missed concepts (correct answer vs selected answer)
      const missedQuestions = subj ? subj.questions.filter((q, qIdx) => a.answers[q.id] !== undefined && a.answers[q.id] !== q.correctAnswerIndex).map(q => q.questionText) : [];

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
        body: JSON.stringify({ 
          studentName: selectedStudent.fullName,
          examHistory: history 
        })
      });
      const data = await res.json();
      if (data.report) {
        setReport({ ...data.report, generatedAt: new Date().toISOString() });
      } else {
        setError(data.error || 'Failed to generate report');
      }
    } catch (err) {
      setError('Network error: ' + String(err));
    }
    setIsEvaluating(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (selectedStudent) {
    const studentAttempts = attempts.filter(a => a.studentId === selectedStudent.id);
    const avgScore = studentAttempts.length > 0 ? studentAttempts.reduce((acc, a) => acc + (a.score / a.totalQuestions) * 100, 0) / studentAttempts.length : 0;
    const avgTime = studentAttempts.length > 0 ? studentAttempts.reduce((acc, a) => acc + a.timeTakenSeconds, 0) / studentAttempts.length : 0;
    const totalViolations = studentAttempts.reduce((acc, a) => acc + (a.tabViolations || 0), 0);
    const rank = leaderboard.findIndex(l => l.student.id === selectedStudent.id) + 1;

    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 relative print:bg-white print:p-0">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <button 
            onClick={() => { setSelectedStudent(null); setReport(null); setExpandedAttemptKey(null); }}
            className="flex items-center gap-2 text-violet-900 font-bold hover:text-violet-700 transition-colors uppercase text-sm tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Analytics
          </button>
          
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-800 text-white font-bold px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm uppercase tracking-widest"
          >
            <Download className="w-4 h-4" />
            Download PDF Report
          </button>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-violet-100 flex items-center justify-between print:shadow-none print:border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Student Profile</p>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-slate-800">{selectedStudent.fullName}</h2>
                {totalViolations > 2 && (
                   <span className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-widest" title={`${totalViolations} Tab Violations Logged`}>
                     <AlertTriangle className="w-3 h-3" /> Flagged
                   </span>
                )}
              </div>
              <p className="text-violet-600 font-mono mt-1 font-bold">{selectedStudent.matricNumber} • {selectedStudent.email}</p>
            </div>
            <div className="text-right">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Rank</p>
               <p className="text-4xl font-black text-slate-800">#{rank}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-[24px] border border-slate-100 flex flex-col items-center justify-center text-center">
              <p className="text-3xl font-black text-slate-800">{Math.round(avgScore)}%</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Average Score</p>
            </div>
            <div className="bg-white p-6 rounded-[24px] border border-slate-100 flex flex-col items-center justify-center text-center">
              <p className="text-3xl font-black text-slate-800">{studentAttempts.length}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Quizzes Taken</p>
            </div>
            <div className="bg-white p-6 rounded-[24px] border border-slate-100 flex flex-col items-center justify-center text-center">
              <p className="text-3xl font-black text-slate-800">{Math.floor(avgTime / 60)}m {(Math.round(avgTime) % 60).toString().padStart(2, '0')}s</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Avg Completion Time</p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[32px] p-8 shadow-xl relative overflow-hidden print:bg-slate-50 print:text-slate-800 print:shadow-none print:border print:border-slate-200">
            <h3 className="text-xl font-bold text-white print:text-slate-800 mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400 print:text-amber-500" />
              AI Academic Diagnostic
            </h3>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 print:hidden">
                {error}
              </div>
            )}

            {!report ? (
              <div className="text-center py-12 print:hidden">
                 <button 
                  onClick={handleGenerateReport}
                  disabled={isEvaluating}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-black px-8 py-4 rounded-xl uppercase tracking-widest transition-colors shadow-lg shadow-amber-400/20 disabled:opacity-50"
                 >
                   {isEvaluating ? 'Evaluating Metrics...' : 'Generate AI Evaluation'}
                 </button>
                 <p className="text-slate-400 mt-4 text-sm max-w-sm mx-auto">
                   Analyzes past quiz performances, missed concepts, and timing to generate a personalized study plan.
                 </p>
              </div>
            ) : (
              <div className="space-y-6">
                 <div className="bg-white/5 print:bg-white border border-white/10 print:border-slate-200 rounded-2xl p-6">
                   <p className="text-xs font-bold text-green-400 print:text-green-600 uppercase tracking-widest mb-2">Capabilities & Strengths</p>
                   <p className="text-slate-200 print:text-slate-700 leading-relaxed">{report.strengths}</p>
                 </div>
                 <div className="bg-white/5 print:bg-white border border-white/10 print:border-slate-200 rounded-2xl p-6">
                   <p className="text-xs font-bold text-amber-400 print:text-amber-600 uppercase tracking-widest mb-2">Areas for Improvement</p>
                   <p className="text-slate-200 print:text-slate-700 leading-relaxed">{report.weaknesses}</p>
                 </div>
                 <div className="bg-white/5 print:bg-white border border-white/10 print:border-slate-200 rounded-2xl p-6 border-l-4 border-l-violet-500">
                   <p className="text-xs font-bold text-violet-300 print:text-violet-600 uppercase tracking-widest mb-2">Action Plan</p>
                   <p className="text-white print:text-slate-800 font-medium leading-relaxed">{report.recommendations}</p>
                 </div>
              </div>
            )}
          </div>

          <div className="bg-white p-4 md:p-8 rounded-[32px] shadow-sm border border-violet-100 print:shadow-none print:border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Granular Exam Logs</h3>
            <div className="space-y-4">
              {studentAttempts.map((a, i) => {
                const subj = subjects.find(s => s.id === a.subjectId);
                const isExpanded = expandedAttemptKey === `${i}`;
                const violations = a.tabViolations || 0;
                
                return (
                  <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden bg-white mb-4">
                    <button 
                      onClick={() => setExpandedAttemptKey(isExpanded ? null : `${i}`)}
                      className="w-full flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left gap-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 w-full">
                        <div className="flex-1">
                          <p className="font-bold text-slate-800 break-words">{subj?.name || a.subjectId}</p>
                          <p className="text-xs text-slate-500 mt-1">{new Date(a.date).toLocaleString()}</p>
                        </div>
                        <div className="flex justify-between items-center w-full sm:w-auto border-t border-slate-200 sm:border-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
                          <div className="flex items-center gap-4">
                            <span className="font-black text-lg text-slate-800">{Math.round((a.score/a.totalQuestions)*100)}%</span>
                            {violations > 0 && (
                              <span className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0">
                                <AlertTriangle className="w-3 h-3" /> {violations} switch{violations > 1 ? 'es' : ''}
                              </span>
                            )}
                          </div>
                          
                          <div className="text-slate-400 flex items-center gap-2 shrink-0 sm:hidden">
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteAttempt(a);
                              }}
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors print:hidden flex items-center justify-center"
                              title="Delete Attempt"
                            >
                              <Trash2 className="w-4 h-4" />
                            </div>
                            <div className="p-2 flex items-center justify-center">
                              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-slate-400 hidden sm:flex items-center gap-2 shrink-0">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteAttempt(a);
                          }}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors print:hidden flex items-center justify-center"
                          title="Delete Attempt"
                        >
                          <Trash2 className="w-4 h-4" />
                        </div>
                        <div className="p-2 flex items-center justify-center">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {isExpanded && subj && (
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 border-t border-slate-200 space-y-4 print:block">
                            <div className="flex gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                              <span>Time: {Math.floor(a.timeTakenSeconds / 60)}m {(a.timeTakenSeconds % 60).toString().padStart(2, '0')}s</span>
                              <span>•</span>
                              <span>Score: {a.score} / {a.totalQuestions}</span>
                            </div>
                            
                            {subj.questions.map((q, qIdx) => {
                              const chosenIdx = a.answers[q.id];
                              const isCorrect = chosenIdx === q.correctAnswerIndex;
                              const didNotAnswer = chosenIdx === undefined;
                              
                              return (
                                <div key={q.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                  <div className="flex items-start gap-3 mb-3">
                                    <div className="mt-1">
                                      {isCorrect ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-700 text-sm">{qIdx + 1}. {q.questionText}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="ml-8 space-y-2 text-sm">
                                    {didNotAnswer ? (
                                      <p className="text-slate-500 italic">No answer selected</p>
                                    ) : (
                                      <>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 w-20">Selected:</span>
                                          <span className={isCorrect ? 'text-green-700 font-medium' : 'text-red-600 font-medium line-through'}>
                                            {q.options[chosenIdx]}
                                          </span>
                                        </div>
                                        {!isCorrect && (
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold uppercase tracking-widest text-green-600 w-20">Correct:</span>
                                            <span className="text-green-700 font-medium">{q.options[q.correctAnswerIndex]}</span>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
              {studentAttempts.length === 0 && <p className="text-slate-500 text-center py-6">No attempts recorded.</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 print:bg-white print:p-0">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-slate-800">Department Analytics</h2>
          <button 
            onClick={handlePrint}
            className="hidden print:hidden md:flex items-center gap-2 bg-slate-800 text-white font-bold px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm uppercase tracking-widest"
          >
            <Download className="w-4 h-4" />
            Download Global Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col items-center justify-center text-center shadow-sm"
          >
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-3xl font-black text-slate-800">{leaderboard.length}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Enrolled Students</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col items-center justify-center text-center shadow-sm"
          >
            <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6" />
            </div>
            <p className="text-3xl font-black text-slate-800">{topPerformers.length}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Top Performers</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col items-center justify-center text-center shadow-sm"
          >
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <p className="text-3xl font-black text-slate-800">{lowPerformers.length}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">At Risk (&lt;50%)</p>
          </motion.div>
        </div>

        <div className="bg-white rounded-[32px] shadow-sm border border-violet-100 overflow-hidden">
          <div className="p-6 border-b border-violet-100 bg-violet-50/50">
            <h3 className="font-bold text-violet-900">Global Leaderboard</h3>
          </div>
          
          <div className="divide-y divide-slate-100">
            {leaderboard.map((entry, idx) => (
              <motion.div 
                key={entry.student.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + (idx * 0.05) }}
                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400 shrink-0">
                    #{idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-800">{entry.student.fullName}</h4>
                      {entry.totalViolations > 2 && (
                         <span className="flex items-center gap-1 bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest print:hidden shrink-0" title={`${entry.totalViolations} Tab Violations Logged`}>
                           <AlertTriangle className="w-3 h-3" /> Flagged
                         </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-1">{entry.student.matricNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t border-slate-100 md:border-t-0 pt-4 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className={`font-black text-xl ${entry.avgScore >= 80 ? 'text-green-600' : entry.avgScore < 50 ? 'text-red-500' : 'text-slate-700'}`}>
                      {entry.avgScore}%
                    </p>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Average</p>
                  </div>
                  <button 
                    onClick={() => setSelectedStudent(entry.student)}
                    className="p-3 bg-violet-100 text-violet-600 hover:bg-violet-200 rounded-xl transition-colors print:hidden shrink-0"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
            
            {leaderboard.length === 0 && (
              <div className="p-12 text-center text-slate-400 font-medium">
                No students registered or have taken exams yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
