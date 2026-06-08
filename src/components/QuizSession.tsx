import React, { useState, useEffect } from 'react';
import { Subject, QuizAttempt } from '../types';
import { Timer, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface QuizSessionProps {
  subject: Subject;
  onComplete: (attempt: QuizAttempt) => void;
}

export default function QuizSession({ subject, onComplete }: QuizSessionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(subject.timerMinutes * 60);
  const [tabViolations, setTabViolations] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  
  const question = subject.questions[currentQuestionIndex];
  const hasAnsweredCurrent = answers[question.id] !== undefined;
  const themeColor = subject.primaryColor || '#8b5cf6';

  useEffect(() => {
    let timeoutId: number;
    const handleViolation = () => {
      setTabViolations(prev => prev + 1);
      setShowWarning(true);
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => setShowWarning(false), 5000);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleViolation();
      }
    };
    
    const handleBlur = () => {
      handleViolation();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (showWarning) return; // Automatic timer pause when warning is active
    if (timeLeft <= 0) {
      finishQuiz();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, showWarning]);

  const finishQuiz = () => {
    let score = 0;
    subject.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswerIndex) {
        score++;
      }
    });

    onComplete({
      subjectId: subject.id,
      studentId: '', // Filled in by parent
      score,
      totalQuestions: subject.questions.length,
      answers,
      timeTakenSeconds: (subject.timerMinutes * 60) - timeLeft,
      date: new Date().toISOString(),
      tabViolations
    });
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (hasAnsweredCurrent) return; // Lock-in logic

    const newAnswers = { ...answers, [question.id]: optionIndex };
    setAnswers(newAnswers);
    
    // Automatically advance after a short delay if it's not the last question, 
    // or let the user click "Next" explicitly. 
    // The prompt says "Once a student selects... app highlights correct/wrong".
    // I'll let them click next so they can read the feedback.
  };

  const handleNext = () => {
    if (currentQuestionIndex < subject.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!question) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-4 md:p-8 max-w-[1400px] w-full mx-auto relative">
      {/* Warning Overlay */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] max-w-md w-full p-8 text-center shadow-2xl border-4 border-red-500 transform scale-100 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">Warning!</h2>
            <p className="text-slate-600 font-medium mb-6">
              Please stay on the quiz screen. Tab switching or leaving the window is recorded as a violation and may affect your score evaluation.
            </p>
            <p className="text-sm font-bold text-red-500 uppercase tracking-widest">
              Timer Paused
            </p>
          </div>
        </div>
      )}
      {/* Left Column: Quiz Info & Stats */}
      <aside className="col-span-1 md:col-span-12 lg:col-span-3 flex flex-col gap-4">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-100 flex-1">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: themeColor }}>Current Subject</p>
            <h2 className="text-2xl font-black leading-tight" style={{ color: themeColor }}>{subject.name}</h2>
          </div>

          <div className="space-y-6">
            <div className="relative">
               <p className="text-xs font-bold text-slate-400 uppercase mb-2">Timer Remaining</p>
               <div className="text-4xl font-mono font-black flex items-baseline gap-1" style={{ color: themeColor }}>
                 {Math.floor(timeLeft / 60)}<span className="text-xl">m</span> {(timeLeft % 60).toString().padStart(2, '0')}<span className="text-xl">s</span>
               </div>
               <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                 <div className={`h-full ${timeLeft < 60 ? 'bg-red-500' : 'bg-amber-400'}`} style={{ width: `${(timeLeft / (subject.timerMinutes * 60)) * 100}%` }}></div>
               </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Progress</p>
              <div className="flex gap-2">
                {subject.questions.map((_, idx) => (
                  <div key={idx} className={`h-2 flex-1 rounded-full ${idx < currentQuestionIndex ? 'bg-violet-600' : idx === currentQuestionIndex ? 'bg-amber-400' : 'bg-violet-200'}`}></div>
                ))}
              </div>
              <p className="text-right text-[10px] mt-2 text-slate-500 font-bold uppercase">Question {currentQuestionIndex + 1} of {subject.questions.length}</p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 italic">System Log</p>
              <div className="space-y-2">
                 <div className="text-[11px] text-slate-600 flex items-start gap-2">
                   <span className="text-violet-500 font-bold">•</span>
                   <span>Subject unlocked successfully</span>
                 </div>
                 <div className="text-[11px] text-slate-600 flex items-start gap-2">
                   <span className="text-violet-500 font-bold">•</span>
                   <span>Lock-in active: Answers final</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-4 text-white flex items-center justify-between" style={{ backgroundColor: themeColor }}>
          <div>
            <p className="text-[10px] uppercase opacity-60 tracking-tighter font-bold">Answered</p>
            <p className="text-xl font-black">{Object.keys(answers).length} / {subject.questions.length}</p>
          </div>
          <div className="h-10 w-px bg-white/20"></div>
          <div className="text-right">
            <p className="text-[10px] uppercase opacity-60 tracking-tighter font-bold">Pending</p>
            <p className="text-xl font-black text-amber-400">{subject.questions.length - Object.keys(answers).length}</p>
          </div>
        </div>
      </aside>

      {/* Right Column: The Quiz Interface */}
      <section className="col-span-1 md:col-span-12 lg:col-span-9 flex flex-col gap-6">
        <div 
          className="bg-white rounded-[40px] shadow-xl border-t-[12px] p-8 md:p-12 flex flex-col relative w-full"
          style={{ borderColor: themeColor }}
        >
          <div 
            className="absolute top-0 right-8 md:right-12 text-white px-4 py-2 rounded-b-xl font-mono text-xs md:text-sm tracking-widest"
            style={{ backgroundColor: themeColor }}
          >
            ID: #{question.id.toUpperCase()}
          </div>

          <div className="mb-10 mt-6 md:mt-0">
            <span 
              className="inline-block text-xs font-black px-3 py-1 rounded-full mb-4 uppercase tracking-widest"
              style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
            >
              Question {currentQuestionIndex + 1}
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800 leading-snug">
              {question.questionText}
            </h3>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-4">
            {question.options.map((option, index) => {
              const isSelected = answers[question.id] === index;
              const isCorrect = question.correctAnswerIndex === index;
              const showFeedback = hasAnsweredCurrent;
              
              let styleClass = 'border-slate-100 bg-slate-50/50 opacity-100 hover:border-violet-300 transition-colors';
              let optionIcon = <div className="w-8 h-8 rounded-full border-2 border-slate-200 shrink-0"></div>;
              let label = null;
              let textColorClass = 'text-slate-600';

              if (showFeedback) {
                if (isCorrect) {
                  styleClass = 'border-green-500 bg-green-50';
                  optionIcon = <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-black shrink-0">✓</div>;
                  label = <div className="px-3 py-1.5 bg-green-500 text-white text-[10px] sm:text-xs font-black rounded uppercase tracking-tighter shrink-0">Correct Answer</div>;
                  textColorClass = 'text-green-800';
                } else if (isSelected && !isCorrect) {
                  styleClass = 'border-red-500 bg-red-50 cursor-not-allowed opacity-90';
                  optionIcon = <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full border-2 border-red-400 flex items-center justify-center text-red-600 font-black shrink-0">✕</div>;
                  label = <div className="px-3 py-1.5 bg-red-500 text-white text-[10px] sm:text-xs font-black rounded uppercase tracking-tighter shrink-0">Your Selection</div>;
                  textColorClass = 'text-red-800';
                } else {
                  styleClass = 'border-slate-100 bg-slate-50/50 opacity-40';
                  textColorClass = 'text-slate-400';
                }
              } else if (isSelected) {
                styleClass = 'border-violet-500 bg-violet-50';
                textColorClass = 'text-violet-900';
                optionIcon = <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full border-2 border-violet-500 bg-violet-500 shrink-0"></div>;
              } else {
                optionIcon = <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full border-2 border-slate-200 shrink-0"></div>;
              }

              return (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  disabled={hasAnsweredCurrent}
                  className={`w-full text-left rounded-[24px] p-5 sm:p-6 md:p-8 flex flex-col sm:flex-row sm:items-center items-start gap-4 sm:gap-6 border-2 transition-all min-h-[5rem] sm:min-h-[6rem] ${styleClass}`}
                >
                  <div className="flex items-center gap-4 sm:gap-6 flex-1 w-full">
                    {optionIcon}
                    <span className={`text-base sm:text-lg md:text-xl font-semibold leading-relaxed ${textColorClass} break-words flex-1`}>{option}</span>
                  </div>
                  {label && (
                    <div className="w-full sm:w-auto flex justify-start pl-12 sm:pl-0 sm:justify-end sm:ml-auto mt-2 sm:mt-0">
                      {label}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Instant Correction Feedback */}
          {hasAnsweredCurrent && question.correctionText && (
            <div className="mt-10 p-6 bg-amber-50 rounded-2xl border-l-4 border-amber-400 flex items-start gap-4">
              <div className="text-2xl">💡</div>
              <div>
                <p className="font-bold text-amber-900 text-sm uppercase mb-1 tracking-tight">Correction Insight</p>
                <p className="text-amber-800 text-sm leading-relaxed">
                  {question.correctionText}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="flex justify-between items-center px-2">
          <p className="text-sm text-slate-400 font-medium hidden sm:block">
            Locked-In: Choice cannot be modified once selected.
          </p>
          <button
            onClick={handleNext}
            disabled={!hasAnsweredCurrent}
            className="ml-auto text-white px-8 md:px-10 py-3 md:py-4 rounded-2xl font-black text-base md:text-lg shadow-lg hover:opacity-90 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ backgroundColor: themeColor }}
          >
            {currentQuestionIndex === subject.questions.length - 1 ? 'Submit Exam' : 'Next Question'}
          </button>
        </div>
      </section>
    </div>
  );
}
