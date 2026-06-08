import React, { useState } from 'react';
import { Subject } from '../types';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SubjectSelectionProps {
  subjects: Subject[];
  onSelectSubject: (subjectId: string, password: string) => boolean;
  onAdminClick: () => void;
}

export default function SubjectSelection({ subjects, onSelectSubject, onAdminClick }: SubjectSelectionProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubjectClick = (id: string) => {
    setSelectedSubjectId(id);
    setPassword('');
    setError(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) return;
    
    const success = onSelectSubject(selectedSubjectId, password);
    if (!success) {
      setError(true);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2">Access Portal</p>
          <h2 className="text-3xl font-black text-violet-900 leading-tight">Select Subject</h2>
        </div>

        <div className="bg-white rounded-[32px] shadow-xl border-t-[8px] border-violet-800 overflow-hidden relative">
          <div className="absolute top-0 right-6 bg-violet-800 text-white px-3 py-1.5 rounded-b-lg font-mono text-[10px] tracking-widest uppercase">
            Portal
          </div>
          
          <div className="p-6 md:p-8 flex flex-col gap-3 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-violet-600" />
                Available Exams
              </h3>
            </div>

            {subjects.length === 0 ? (
              <p className="p-8 text-center text-slate-400 text-sm">No subjects available.</p>
            ) : null}
            
            {subjects.map((subject) => {
              const isSelected = selectedSubjectId === subject.id;
              const themeColor = subject.primaryColor || '#8b5cf6';
              
              return (
                <div key={subject.id}>
                  <button
                    onClick={() => handleSubjectClick(subject.id)}
                    className={`w-full text-left p-4 md:p-5 rounded-2xl transition-all duration-200 border-2`}
                    style={{
                      borderColor: isSelected ? themeColor : 'var(--tw-colors-slate-100, #f1f5f9)',
                      backgroundColor: isSelected ? `${themeColor}10` : 'transparent',
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-slate-800">{subject.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 font-mono">{subject.id} • {subject.timerMinutes} MINS</p>
                      </div>
                      {!isSelected && (
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                          <Lock className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <form onSubmit={handleSubmit} className="pt-3 pb-2 px-1">
                          <label 
                            className="text-[10px] font-bold uppercase tracking-wider mb-2 block"
                            style={{ color: themeColor }}
                          >
                            Exam Password
                          </label>
                          <div className="relative">
                            <input
                              type="password"
                              placeholder="Enter password..."
                              className={`w-full bg-white border-2 ${error ? 'border-red-300 focus:border-red-500' : 'border-slate-200'} rounded-xl py-3 pl-4 pr-16 text-sm outline-none transition-all placeholder:text-slate-300 font-medium`}
                              style={!error ? { borderBottomColor: themeColor } : {}}
                              value={password}
                              onChange={(e) => {
                                setPassword(e.target.value);
                                setError(false);
                              }}
                              autoFocus
                            />
                            <button
                              type="submit"
                              className="absolute right-2 top-2 bottom-2 aspect-square text-white rounded-lg flex items-center justify-center transition-colors hover:opacity-90"
                              style={{ backgroundColor: themeColor }}
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                          {error && (
                            <p className="text-red-500 text-xs mt-2 font-medium">Incorrect password. Please try again.</p>
                          )}
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
