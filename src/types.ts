export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  correctionText?: string;
}

export interface PerformanceThresholds {
  legendary: string;
  excellence: string;
  keepGoing: string;
  encouragement: string;
}

export interface Subject {
  id: string;
  name: string;
  password: string;
  timerMinutes: number;
  showCorrections: boolean;
  primaryColor: string;
  thresholds: PerformanceThresholds;
  questions: Question[];
}

export interface Student {
  id: string;
  fullName: string;
  matricNumber: string;
  email: string;
  password?: string;
  phone?: string;
  isAnonymous?: boolean;
}

export interface AIReport {
  strengths: string;
  weaknesses: string;
  recommendations: string;
  generatedAt?: string;
}

export interface QuizAttempt {
  subjectId: string;
  studentId: string;
  score: number;
  totalQuestions: number;
  answers: Record<string, number>; // questionId -> selectedOptionIndex
  timeTakenSeconds: number;
  date: string;
  tabViolations?: number;
}

export type ViewState = 'login' | 'signup' | 'student_dashboard' | 'subject_selection' | 'admin' | 'quiz' | 'results';
