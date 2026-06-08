/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Subject, ViewState, QuizAttempt, Student } from './types';
import { loadSubjects, saveSubjects, loadStudents, saveStudents, loadAttempts, saveAttempts } from './data';
import SubjectSelection from './components/SubjectSelection';
import QuizSession from './components/QuizSession';
import QuizResults from './components/QuizResults';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import StudentAuth from './components/StudentAuth';
import StudentDashboard from './components/StudentDashboard';

export default function App() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  
  const [view, setView] = useState<ViewState>('login');
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [lastAttempt, setLastAttempt] = useState<QuizAttempt | null>(null);
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSubjects(loadSubjects());
    setStudents(loadStudents());
    setAttempts(loadAttempts());
    
    const isAuth = sessionStorage.getItem('adminAuth') === 'true';
    setIsAdminAuthenticated(isAuth);
    
    const loggedInStudentId = sessionStorage.getItem('activeStudentId');
    if (loggedInStudentId) {
      const studs = loadStudents();
      const found = studs.find(s => s.id === loggedInStudentId);
      if (found) {
        setActiveStudent(found);
        setView('student_dashboard');
      }
    }
  }, []);

  const handleStudentLogin = (student: Student) => {
    setActiveStudent(student);
    sessionStorage.setItem('activeStudentId', student.id);
    setView('student_dashboard');
  };

  const handleStudentSignup = (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...studentData,
      id: `stu_${Date.now()}_${Math.floor(Math.random()*1000)}`
    };
    const updated = [...students, newStudent];
    setStudents(updated);
    saveStudents(updated);
    handleStudentLogin(newStudent);
  };

  const handleStudentLogout = () => {
    setActiveStudent(null);
    sessionStorage.removeItem('activeStudentId');
    setView('login');
  };

  const handleSelectSubject = (subjectId: string, password: string): boolean => {
    const subject = subjects.find(s => s.id === subjectId);
    if (subject && subject.password === password) {
      setActiveSubject(subject);
      setView('quiz');
      return true;
    }
    return false;
  };

  const handleQuizComplete = (attempt: QuizAttempt) => {
    if (activeStudent) {
      attempt.studentId = activeStudent.id;
      const newAttempts = [...attempts, attempt];
      setAttempts(newAttempts);
      saveAttempts(newAttempts);
    }
    setLastAttempt(attempt);
    setView('results');
  };

  const handleSaveSubjects = (updatedSubjects: Subject[]) => {
    setSubjects(updatedSubjects);
    saveSubjects(updatedSubjects);
  };

  const startLongPress = () => {
    longPressTimer.current = setTimeout(() => {
      if (isAdminAuthenticated) {
        setView('admin');
      } else {
        setShowAdminLogin(true);
      }
    }, 2500); // 2.5s long press
  };

  const endLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleAdminLogin = () => {
    sessionStorage.setItem('adminAuth', 'true');
    setIsAdminAuthenticated(true);
    setShowAdminLogin(false);
    setView('admin');
  };

  return (
    <div className="h-screen bg-purple-50 text-slate-900 font-sans flex flex-col overflow-hidden relative">
      <header className="bg-violet-950 text-white px-4 sm:px-8 py-3 sm:py-4 landscape:py-2 flex justify-between items-center shadow-lg shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 relative">
          <div 
            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer select-none"
            onPointerDown={startLongPress}
            onPointerUp={endLongPress}
            onPointerLeave={endLongPress}
            style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}
          >
            <img src="https://res.cloudinary.com/di8wjyfin/image/upload/v1780876647/praestans_zkibtq.png" alt="Praestans Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain pointer-events-none" />
          </div>
          <div>
            <h1 className="text-sm sm:text-lg font-bold leading-tight uppercase tracking-wider hidden sm:block">Praestans Questions App</h1>
            <h1 className="text-sm font-bold leading-tight uppercase tracking-wider block sm:hidden">Praestans App</h1>
            <p className="text-[10px] sm:text-xs text-violet-200 opacity-80 hidden md:block">Faculty of Dentistry • Advanced Level</p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="bg-white/10 rounded-full px-3 sm:px-4 py-1.5 flex items-center gap-2 border border-white/20">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-mono uppercase tracking-widest hidden sm:inline">Portal Active</span>
          </div>
          {activeStudent && (
            <div className="text-right hidden sm:block cursor-pointer" onClick={() => setView('student_dashboard')}>
              <p className="text-xs text-violet-300 uppercase">Student Access ID</p>
              <p className="font-mono font-bold text-amber-400">{activeStudent.matricNumber}</p>
            </div>
          )}
        </div>
      </header>

      {showAdminLogin && (
        <AdminLogin 
          onLogin={handleAdminLogin}
          onCancel={() => setShowAdminLogin(false)}
        />
      )}

      <main className="flex-1 overflow-y-auto w-full">
        {view === 'login' && (
          <StudentAuth 
            students={students}
            onLogin={handleStudentLogin}
            onSignup={handleStudentSignup}
          />
        )}

        {view === 'student_dashboard' && activeStudent && (
          <StudentDashboard 
            student={activeStudent}
            allStudents={students}
            attempts={attempts}
            subjects={subjects}
            onUpdateStudent={(updatedStudent) => {
              const updated = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
              setStudents(updated);
              saveStudents(updated);
              setActiveStudent(updatedStudent);
            }}
            onTakeExam={() => setView('subject_selection')}
            onLogout={handleStudentLogout}
          />
        )}

        {view === 'subject_selection' && (
          <SubjectSelection 
            subjects={subjects} 
            onSelectSubject={handleSelectSubject}
            onAdminClick={() => {}}
          />
        )}
        
        {view === 'admin' && isAdminAuthenticated && (
          <AdminDashboard 
            subjects={subjects}
            students={students}
            attempts={attempts}
            onSaveSubjects={handleSaveSubjects}
            onDeleteAttempt={(attempt) => {
              if(window.confirm('Are you sure you want to delete this quiz attempt?')) {
                const updated = attempts.filter(a => !(a.studentId === attempt.studentId && a.date === attempt.date && a.subjectId === attempt.subjectId));
                setAttempts(updated);
                saveAttempts(updated);
              }
            }}
            onHomeClick={() => setView(activeStudent ? 'student_dashboard' : 'login')}
          />
        )}

        {view === 'quiz' && activeSubject && (
          <QuizSession 
            subject={activeSubject}
            onComplete={handleQuizComplete}
          />
        )}

        {view === 'results' && activeSubject && lastAttempt && (
          <QuizResults 
            subject={activeSubject}
            attempt={lastAttempt}
            onHomeClick={() => {
              setActiveSubject(null);
              setLastAttempt(null);
              setView('student_dashboard');
            }}
          />
        )}
      </main>
    </div>
  );
}

