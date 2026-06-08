import { Subject, Student, QuizAttempt } from './types';

const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'CS101',
    name: 'Introduction to Computer Science',
    password: 'password123',
    timerMinutes: 2,
    showCorrections: true,
    primaryColor: '#8a2be2', // Blueviolet
    thresholds: {
      legendary: 'God Pikin! You are the Question Bank yourself!',
      excellence: 'Oshey! Academic Scholar, you try!',
      keepGoing: 'You\'re almost there, one more push!',
      encouragement: 'Don\'t settle! Go back to the slides and come back stronger.'
    },
    questions: [
      {
        id: 'q1',
        questionText: 'What does HTML stand for?',
        options: [
          'Hyper Text Markup Language',
          'High Tech Modern Language',
          'Hyper Transfer Markup Language',
          'Home Tool Markup Language'
        ],
        correctAnswerIndex: 0,
        correctionText: 'HTML stands for Hyper Text Markup Language, the standard markup language for documents designed to be displayed in a web browser.'
      },
      {
        id: 'q2',
        questionText: 'Which of the following is NOT a JavaScript framework/library?',
        options: ['React', 'Angular', 'Django', 'Vue'],
        correctAnswerIndex: 2,
        correctionText: 'Django is a high-level Python web framework, not a JavaScript framework/library.'
      },
      {
        id: 'q3',
        questionText: 'What is the main purpose of CSS?',
        options: [
          'To structure web pages',
          'To style web pages',
          'To add logic to web pages',
          'To query databases'
        ],
        correctAnswerIndex: 1,
        correctionText: 'CSS (Cascading Style Sheets) is a style sheet language used for describing the presentation of a document written in a markup language like HTML.'
      }
    ]
  },
  {
    id: 'MATH201',
    name: 'Advanced Calculus',
    password: 'math',
    timerMinutes: 5,
    showCorrections: false,
    primaryColor: '#000080', // Navy Blue
    thresholds: {
      legendary: 'God Pikin! You are the Question Bank yourself!',
      excellence: 'Oshey! Academic Scholar, you try!',
      keepGoing: 'You\'re almost there, one more push!',
      encouragement: 'Don\'t settle! Go back to the slides and come back stronger.'
    },
    questions: [
      {
        id: 'mq1',
        questionText: 'What is the derivative of e^x?',
        options: ['x * e^(x-1)', 'e^x', 'ln(x)', '1/x'],
        correctAnswerIndex: 1,
        correctionText: 'The derivative of the exponential function e^x is e^x itself.'
      },
      {
        id: 'mq2',
        questionText: 'What is the integral of 1/x dx?',
        options: ['x^2/2', 'e^x', 'ln|x| + C', '-1/x^2'],
        correctAnswerIndex: 2,
        correctionText: 'The indefinite integral of 1/x is the natural logarithm of the absolute value of x, plus a constant of integration.'
      }
    ]
  }
];

export function loadSubjects(): Subject[] {
  const stored = localStorage.getItem('qb_subjects');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse subjects from local storage', e);
    }
  }
  return DEFAULT_SUBJECTS;
}

export function saveSubjects(subjects: Subject[]) {
  localStorage.setItem('qb_subjects', JSON.stringify(subjects));
}

export function loadStudents(): Student[] {
  const stored = localStorage.getItem('qb_students');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse students from local storage', e);
    }
  }
  return [];
}

export function saveStudents(students: Student[]) {
  localStorage.setItem('qb_students', JSON.stringify(students));
}

export function loadAttempts(): QuizAttempt[] {
  const stored = localStorage.getItem('qb_attempts');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse attempts from local storage', e);
    }
  }
  return [];
}

export function saveAttempts(attempts: QuizAttempt[]) {
  localStorage.setItem('qb_attempts', JSON.stringify(attempts));
}
