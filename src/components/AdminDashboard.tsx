import React, { useState } from 'react';
import { Subject, Student, QuizAttempt } from '../types';
import AdminExamEditor from './AdminExamEditor';
import AdminAnalytics from './AdminAnalytics';
import { Settings, BarChart2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminDashboardProps {
  subjects: Subject[];
  students: Student[];
  attempts: QuizAttempt[];
  onSaveSubjects: (subjects: Subject[]) => void;
  onDeleteAttempt: (attempt: QuizAttempt) => void;
  onHomeClick: () => void;
}

export default function AdminDashboard({ subjects, students, attempts, onSaveSubjects, onDeleteAttempt, onHomeClick }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'exams' | 'analytics'>('exams');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveSubjects = (newSubjects: Subject[]) => {
    onSaveSubjects(newSubjects);
    showToast('Configuration Saved Successfully');
  };

  const handleDeleteAttempt = (attempt: QuizAttempt) => {
    onDeleteAttempt(attempt);
    showToast('Quiz Attempt Deleted');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-20 left-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="font-bold text-sm tracking-wide">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white border-b border-violet-100 p-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="pl-4 hidden sm:flex items-center">
            <img src="https://res.cloudinary.com/di8wjyfin/image/upload/v1780876647/praestans_zkibtq.png" alt="Praestans Logo" className="w-8 h-8 object-contain" />
          </div>
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
            <button 
              onClick={() => setActiveTab('exams')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold lowercase transition-all ${activeTab === 'exams' ? 'bg-white text-violet-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Settings className="w-4 h-4" /> Exam Configuration
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold lowercase transition-all ${activeTab === 'analytics' ? 'bg-white text-violet-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <BarChart2 className="w-4 h-4" /> Leaderboard & Analytics
            </button>
          </div>
        </div>
        
        <button 
          onClick={onHomeClick}
          className="mr-4 text-sm font-bold text-slate-500 hover:text-red-500 uppercase tracking-widest transition-colors"
        >
          Exit Admin
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'exams' ? (
          <AdminExamEditor 
            subjects={subjects} 
            onSaveSubjects={handleSaveSubjects} 
          />
        ) : (
          <AdminAnalytics 
            students={students}
            attempts={attempts}
            subjects={subjects}
            onDeleteAttempt={handleDeleteAttempt}
          />
        )}
      </div>
    </div>
  );
}
