import React, { useEffect } from 'react';
import { Subject, QuizAttempt } from '../types';
import { ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizResultsProps {
  subject: Subject;
  attempt: QuizAttempt;
  onHomeClick: () => void;
}

export default function QuizResults({ subject, attempt, onHomeClick }: QuizResultsProps) {
  const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
  const themeColor = subject.primaryColor || '#8b5cf6';

  useEffect(() => {
    if (percentage >= 90) {
      // Full screen confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#8b5cf6', '#a855f7', '#d946ef', '#fcd34d']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#8b5cf6', '#a855f7', '#d946ef', '#fcd34d']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } else if (percentage >= 70) {
      // Small burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#a855f7', '#fcd34d']
      });
    }
  }, [percentage]);

  let message = subject.thresholds?.encouragement || "Don't settle! Go back to the slides and come back stronger.";
  let messageColor = "text-red-600";
  let bgClass = "bg-red-50";
  
  if (percentage >= 90) {
    message = subject.thresholds?.legendary || "God Pikin! You are the Question Bank yourself!";
    messageColor = "text-green-600";
    bgClass = "bg-green-50 text-green-900 border-green-200 border";
  } else if (percentage >= 70) {
    message = subject.thresholds?.excellence || "Oshey! Academic Scholar, you try!";
    messageColor = "text-green-600";
    bgClass = "bg-green-50 text-green-900 border-green-200 border";
  } else if (percentage >= 50) {
    message = subject.thresholds?.keepGoing || "You're almost there, one more push!";
    messageColor = "text-amber-600";
    bgClass = "bg-amber-50 text-amber-900 border-amber-200 border";
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center relative">
      <div className="w-full max-w-4xl mb-6">
        <button 
          onClick={onHomeClick}
          className="flex items-center gap-2 font-bold hover:opacity-80 transition-opacity uppercase text-sm tracking-wider"
          style={{ color: themeColor }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portal
        </button>
      </div>

      <div 
        className="w-full max-w-4xl bg-white rounded-[40px] shadow-xl border-t-[12px] p-8 md:p-12 mb-8 text-center relative overflow-hidden"
        style={{ borderColor: themeColor }}
      >
        <div className="flex flex-col items-center justify-center mb-6">
          <img src="https://res.cloudinary.com/di8wjyfin/image/upload/v1780876647/praestans_zkibtq.png" alt="Praestans Logo" className="w-16 h-16 object-contain mb-2" />
        </div>
        <div 
          className="absolute top-0 right-8 md:right-12 text-white px-4 py-2 rounded-b-xl font-mono text-xs md:text-sm tracking-widest uppercase"
          style={{ backgroundColor: themeColor }}
        >
          Session ended
        </div>
        
        <p className="text-xs font-bold uppercase tracking-widest mb-1 mt-6 md:mt-0" style={{ color: themeColor }}>Performance Review</p>
        <h1 className="text-4xl font-black text-slate-800 mb-8">{subject.name}</h1>
        
        <div className="inline-block relative">
          <svg className="w-40 h-40 transform -rotate-90 drop-shadow-md">
            <circle
              className="text-slate-100"
              strokeWidth="12"
              stroke="currentColor"
              fill="transparent"
              r="70"
              cx="80"
              cy="80"
            />
            <circle
              className={`${percentage >= 70 ? 'text-green-500' : percentage >= 40 ? 'text-amber-400' : 'text-red-500'} transition-all duration-1000 ease-out`}
              strokeWidth="12"
              strokeDasharray={439.8}
              strokeDashoffset={439.8 - (439.8 * percentage) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="70"
              cx="80"
              cy="80"
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <span className="text-4xl font-black text-slate-800">{attempt.score}</span>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">/ {attempt.totalQuestions}</span>
          </div>
        </div>
        
        <p className={`mt-6 font-bold text-lg ${messageColor}`}>
          {percentage}% Accuracy
        </p>

        <div className={`mt-6 max-w-lg mx-auto py-3 px-6 rounded-2xl font-bold ${bgClass}`}>
          {message}
        </div>
      </div>

      {subject.showCorrections && (
        <div className="w-full max-w-4xl flex flex-col gap-6 font-sans pb-12">
          <h2 className="text-2xl font-black text-slate-800 px-2 lg:px-0">Review & Corrections</h2>
          
          {subject.questions.map((q, idx) => {
            const selectedIdx = attempt.answers[q.id];
            const isCorrect = selectedIdx === q.correctAnswerIndex;
            
            return (
              <div key={q.id} className="bg-white rounded-[32px] shadow-sm border border-violet-100 p-6 md:p-8 flex flex-col gap-6">
                <div className="flex gap-4 items-start">
                  <div className="mt-1 shrink-0">
                    {isCorrect ? (
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-black shrink-0">✓</div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-black shrink-0">✕</div>
                    )}
                  </div>
                  <div>
                    <span 
                      className="inline-block text-[10px] font-black px-2 py-1 rounded-full mb-2 uppercase tracking-widest"
                      style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
                    >
                      Question {idx + 1}
                    </span>
                    <h3 className="text-slate-800 font-bold text-xl leading-snug">{q.questionText}</h3>
                  </div>
                </div>

                <div className="pl-0 md:pl-12 flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((opt, optIdx) => {
                      let style = 'border-slate-100 bg-slate-50/50 text-slate-500 opacity-60';
                      let icon = <div className="w-6 h-6 rounded-full border-2 border-slate-200 shrink-0"></div>;
                      
                      if (optIdx === q.correctAnswerIndex) {
                        style = 'border-green-500 bg-green-50 text-green-900 border-2 shadow-sm opacity-100';
                        icon = <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px] font-black shrink-0">✓</div>;
                      } else if (optIdx === selectedIdx) {
                        style = 'border-red-300 bg-red-50 text-red-900 border-2 opacity-80';
                        icon = <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] font-black shrink-0">✕</div>;
                      }
                      
                      return (
                        <div key={optIdx} className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-semibold transition-all ${style}`}>
                          {icon}
                          {opt}
                        </div>
                      )
                    })}
                  </div>
                  
                  {q.correctionText && (
                    <div className="mt-4 p-5 bg-amber-50 rounded-2xl border-l-4 border-amber-400 flex items-start gap-4">
                      <div className="text-xl">💡</div>
                      <div>
                        <p className="font-bold text-amber-900 text-xs uppercase mb-1 tracking-tight">Explanation</p>
                        <p className="text-amber-800 text-sm leading-relaxed">
                          {q.correctionText}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
