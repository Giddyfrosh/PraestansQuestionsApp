import React, { useState } from 'react';
import { Subject, Question } from '../types';
import { ArrowLeft, Save, Plus, Trash2, Edit3, Settings } from 'lucide-react';

interface AdminExamEditorProps {
  subjects: Subject[];
  onSaveSubjects: (subjects: Subject[]) => void;
}

export default function AdminExamEditor({ subjects, onSaveSubjects }: AdminExamEditorProps) {
  const [localSubjects, setLocalSubjects] = useState<Subject[]>(JSON.parse(JSON.stringify(subjects)));
  const [editingSubjectIdx, setEditingSubjectIdx] = useState<number | null>(null);

  const handleSaveAll = () => {
    onSaveSubjects(localSubjects);
    alert('Changes saved successfully!');
  };

  const handleAddSubject = () => {
    const newSubject: Subject = {
      id: `SUBJ-${Math.floor(Math.random() * 10000)}`,
      name: 'New Subject',
      password: 'pass',
      timerMinutes: 10,
      showCorrections: true,
      primaryColor: '#8a2be2',
      thresholds: {
        legendary: 'God Pikin! You are the Question Bank yourself!',
        excellence: 'Oshey! Academic Scholar, you try!',
        keepGoing: "You're almost there, one more push!",
        encouragement: "Don't settle! Go back to the slides and come back stronger."
      },
      questions: []
    };
    setLocalSubjects([...localSubjects, newSubject]);
    setEditingSubjectIdx(localSubjects.length);
  };

  const handleDeleteSubject = (idx: number) => {
    if(confirm(`Are you sure you want to permanently delete ${localSubjects[idx].name}? This will clear all associated scores and questions.`)) {
      const updated = [...localSubjects];
      updated.splice(idx, 1);
      setLocalSubjects(updated);
      if (editingSubjectIdx === idx) setEditingSubjectIdx(null);
    }
  };

  const updateEditingSubject = (updated: Partial<Subject>) => {
    if (editingSubjectIdx === null) return;
    const items = [...localSubjects];
    items[editingSubjectIdx] = { ...items[editingSubjectIdx], ...updated };
    setLocalSubjects(items);
  };

  const handleAddQuestion = () => {
    if (editingSubjectIdx === null) return;
    const newQ: Question = {
      id: `q-${Date.now()}`,
      questionText: 'New Question',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswerIndex: 0,
      correctionText: ''
    };
    const s = localSubjects[editingSubjectIdx];
    updateEditingSubject({ questions: [...s.questions, newQ] });
  };

  const updateQuestion = (qIdx: number, updated: Partial<Question>) => {
    if (editingSubjectIdx === null) return;
    const s = localSubjects[editingSubjectIdx];
    const newQs = [...s.questions];
    newQs[qIdx] = { ...newQs[qIdx], ...updated };
    updateEditingSubject({ questions: newQs });
  };

  const removeQuestion = (qIdx: number) => {
    if (editingSubjectIdx === null) return;
    const s = localSubjects[editingSubjectIdx];
    const newQs = [...s.questions];
    newQs.splice(qIdx, 1);
    updateEditingSubject({ questions: newQs });
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-white border-r border-violet-100 flex flex-col h-auto md:h-full shrink-0">
        <div className="p-6 border-b border-violet-100 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-3 w-full">
            <div className="w-8 h-8 rounded bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
              <Settings className="w-4 h-4" />
            </div>
            <h1 className="font-bold text-slate-800 text-lg">Admin Panel</h1>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {localSubjects.map((s, idx) => (
            <div 
              key={s.id} 
              className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer border-2 transition-colors ${editingSubjectIdx === idx ? 'bg-violet-50 border-violet-400' : 'bg-white border-transparent hover:border-violet-100 hover:bg-slate-50'}`}
              onClick={() => setEditingSubjectIdx(idx)}
            >
              <div className="truncate">
                <span className={`font-semibold text-sm block truncate ${editingSubjectIdx === idx ? 'text-violet-900' : 'text-slate-700'}`}>{s.name}</span>
                <span className="text-xs text-slate-400 font-mono mt-1 block">{s.questions.length} Questions</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDeleteSubject(idx); }}
                className="text-slate-300 hover:text-red-500 p-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          <button 
            onClick={handleAddSubject}
            className="flex items-center justify-center gap-2 w-full p-4 mt-2 rounded-2xl border-2 border-dashed border-violet-200 text-violet-600 hover:bg-violet-50 font-bold text-sm transition-colors uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" /> Add Subject
          </button>
        </div>

        <div className="p-6 border-t border-violet-100 flex flex-col gap-3 shrink-0">
          <button 
            onClick={handleSaveAll}
            className="w-full bg-violet-900 text-white flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold hover:bg-violet-800 transition uppercase tracking-widest"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-purple-50">
        {editingSubjectIdx !== null && localSubjects[editingSubjectIdx] ? (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-violet-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <Edit3 className="w-5 h-5 text-violet-500" />
                Exam Settings
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Subject ID</label>
                  <input 
                    type="text" 
                    value={localSubjects[editingSubjectIdx].id}
                    onChange={(e) => updateEditingSubject({ id: e.target.value })}
                    className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-4 focus:ring-violet-100 focus:border-violet-500 outline-none transition-all font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Subject Name</label>
                  <input 
                    type="text" 
                    value={localSubjects[editingSubjectIdx].name}
                    onChange={(e) => updateEditingSubject({ name: e.target.value })}
                    className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-4 focus:ring-violet-100 focus:border-violet-500 outline-none transition-all font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Access Password</label>
                  <input 
                    type="text" 
                    value={localSubjects[editingSubjectIdx].password}
                    onChange={(e) => updateEditingSubject({ password: e.target.value })}
                    className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-4 focus:ring-violet-100 focus:border-violet-500 outline-none transition-all font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Timer (Minutes)</label>
                  <input 
                    type="number" 
                    value={localSubjects[editingSubjectIdx].timerMinutes}
                    onChange={(e) => updateEditingSubject({ timerMinutes: parseInt(e.target.value) || 1 })}
                    className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-4 focus:ring-violet-100 focus:border-violet-500 outline-none transition-all font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Theme Color (Hex)</label>
                  <input 
                    type="text" 
                    value={localSubjects[editingSubjectIdx].primaryColor || '#8a2be2'}
                    onChange={(e) => updateEditingSubject({ primaryColor: e.target.value })}
                    className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-4 focus:ring-violet-100 focus:border-violet-500 outline-none transition-all font-medium text-sm"
                    placeholder="#RRGGBB"
                  />
                </div>
                <div className="col-span-1 md:col-span-2 mt-4">
                  <h3 className="font-bold text-slate-800 text-sm mb-4">Performance Feedback Messages</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Legendary (90-100%)</label>
                      <input 
                        type="text" 
                        value={localSubjects[editingSubjectIdx].thresholds?.legendary || ''}
                        onChange={(e) => updateEditingSubject({ thresholds: { ...localSubjects[editingSubjectIdx].thresholds, legendary: e.target.value } })}
                        className="w-full border-2 border-slate-200 rounded-xl p-2 text-sm"
                        placeholder="e.g. God Pikin!"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-green-500 uppercase tracking-widest mb-1">Excellence (70-89%)</label>
                      <input 
                        type="text" 
                        value={localSubjects[editingSubjectIdx].thresholds?.excellence || ''}
                        onChange={(e) => updateEditingSubject({ thresholds: { ...localSubjects[editingSubjectIdx].thresholds, excellence: e.target.value } })}
                        className="w-full border-2 border-slate-200 rounded-xl p-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Keep Going (50-69%)</label>
                      <input 
                        type="text" 
                        value={localSubjects[editingSubjectIdx].thresholds?.keepGoing || ''}
                        onChange={(e) => updateEditingSubject({ thresholds: { ...localSubjects[editingSubjectIdx].thresholds, keepGoing: e.target.value } })}
                        className="w-full border-2 border-slate-200 rounded-xl p-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">Encouragement (&lt;50%)</label>
                      <input 
                        type="text" 
                        value={localSubjects[editingSubjectIdx].thresholds?.encouragement || ''}
                        onChange={(e) => updateEditingSubject({ thresholds: { ...localSubjects[editingSubjectIdx].thresholds, encouragement: e.target.value } })}
                        className="w-full border-2 border-slate-200 rounded-xl p-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2 flex items-center gap-3 mt-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <input 
                    type="checkbox" 
                    id="showCorrections"
                    checked={localSubjects[editingSubjectIdx].showCorrections}
                    onChange={(e) => updateEditingSubject({ showCorrections: e.target.checked })}
                    className="w-5 h-5 text-violet-600 rounded border-slate-300 focus:ring-violet-500"
                  />
                  <label htmlFor="showCorrections" className="text-sm font-bold text-slate-700 cursor-pointer">
                    Show Post-Quiz Corrections Insight
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[32px] shadow-sm text-white">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-100">
                <span className="text-2xl">👁️</span> Live Preview
              </h2>
              <div 
                className="p-8 rounded-[40px] shadow-xl border-t-[12px] bg-white text-slate-800" 
                style={{ borderColor: localSubjects[editingSubjectIdx].primaryColor || '#8b5cf6' }}
              >
                <div className="mb-8">
                  <span 
                    className="inline-block text-xs font-black px-3 py-1 rounded-full mb-4 uppercase tracking-widest text-white"
                    style={{ backgroundColor: localSubjects[editingSubjectIdx].primaryColor || '#8b5cf6' }}
                  >
                    Question 1
                  </span>
                  <h3 className="text-2xl font-bold leading-snug">
                    {localSubjects[editingSubjectIdx].questions[0]?.questionText || 'Your question will appear here...'}
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {(localSubjects[editingSubjectIdx].questions[0]?.options || ['Option A', 'Option B']).map((opt, i) => (
                    <div key={i} className="border-slate-100 bg-slate-50 opacity-100 border-2 rounded-2xl p-4 flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full border-2 border-slate-200 shrink-0"></div>
                      <span className="text-sm font-semibold">{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-violet-100">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-slate-800">Questions ({localSubjects[editingSubjectIdx].questions.length})</h2>
                <button 
                  onClick={handleAddQuestion}
                  className="bg-violet-100 text-violet-700 hover:bg-violet-200 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              <div className="space-y-6">
                {localSubjects[editingSubjectIdx].questions.map((q, qIdx) => (
                  <div key={qIdx} className="border-2 border-slate-100 rounded-2xl p-6 bg-slate-50 relative group">
                    <button 
                      onClick={() => removeQuestion(qIdx)}
                      className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5"/>
                    </button>
                    
                    <div className="mb-6 pr-8">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Question {qIdx + 1}</label>
                      <textarea 
                        value={q.questionText}
                        onChange={(e) => updateQuestion(qIdx, { questionText: e.target.value })}
                        className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-4 focus:ring-violet-100 focus:border-violet-500 outline-none min-h-[80px] font-medium text-sm transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex flex-col">
                          <label className="text-[10px] font-bold text-slate-400 mb-2 flex justify-between uppercase tracking-widest">
                            Option {optIdx + 1}
                            <div className="flex items-center gap-1 text-violet-700 cursor-pointer">
                              <input 
                                type="radio" 
                                name={`correct-${q.id}`} 
                                checked={q.correctAnswerIndex === optIdx}
                                onChange={() => updateQuestion(qIdx, { correctAnswerIndex: optIdx })}
                                className="text-violet-600 focus:ring-violet-500 w-3.5 h-3.5"
                              />
                              <span>Correct</span>
                            </div>
                          </label>
                          <input 
                            type="text" 
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...q.options];
                              newOpts[optIdx] = e.target.value;
                              updateQuestion(qIdx, { options: newOpts });
                            }}
                            className={`w-full border-2 rounded-xl p-3 text-sm font-medium outline-none transition-all ${q.correctAnswerIndex === optIdx ? 'border-green-400 bg-green-50 focus:border-green-500' : 'border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100'}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Correction Insight (Optional)</label>
                      <textarea 
                        value={q.correctionText || ''}
                        onChange={(e) => updateQuestion(qIdx, { correctionText: e.target.value })}
                        placeholder="Why is the answer correct?"
                        className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-4 focus:ring-violet-100 focus:border-violet-500 outline-none min-h-[60px] text-sm font-medium transition-all"
                      />
                    </div>
                  </div>
                ))}
                
                {localSubjects[editingSubjectIdx].questions.length === 0 && (
                  <p className="text-center text-slate-400 py-12 font-medium">No questions added yet.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-300 flex-col">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
              <Settings className="w-8 h-8 text-slate-300" />
            </div>
            <p className="font-medium text-slate-400">Select a subject from the sidebar to edit.</p>
          </div>
        )}
      </div>
    </div>
  );
}
