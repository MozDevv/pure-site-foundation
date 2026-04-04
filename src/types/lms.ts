// Assignment Types
export type AssignmentType = 'individual' | 'group';
export type SubmissionType = 'file' | 'repo' | 'url';
export type GradingMethod = 'score' | 'rubric';
export type SubmissionStatus = 'pending' | 'submitted' | 'late' | 'graded';

export interface RubricCriteria {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
  weight: number;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  courseId: string;
  courseName: string;
  type: AssignmentType;
  submissionTypes: SubmissionType[];
  gradingMethod: GradingMethod;
  maxScore: number;
  rubric?: RubricCriteria[];
  dueDate: string;
  lateSubmissionAllowed: boolean;
  latePenalty?: number;
  allowResubmission: boolean;
  maxResubmissions?: number;
  createdAt: string;
  createdBy: string;
  totalSubmissions: number;
  gradedSubmissions: number;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  status: SubmissionStatus;
  submittedAt?: string;
  files?: SubmittedFile[];
  repoUrl?: string;
  demoUrl?: string;
  grade?: number;
  rubricGrades?: { criteriaId: string; score: number; feedback: string }[];
  feedback?: string;
  annotations?: Annotation[];
  gradedBy?: string;
  gradedAt?: string;
  version: number;
  plagiarismScore?: number;
  assignment?: Assignment;
}

export interface SubmittedFile {
  id: string;
  name: string;
  type?: string;
  size: number;
  url?: string;
  // Backend fields
  objectName?: string;
  bucketName?: string;
  contentType?: string;
  filePath?: string;
  description?: string;
  uploadedDate?: string;
  ownerId?: string;
}

export interface Annotation {
  id: string;
  fileId?: string;
  content: string;
  position?: { x: number; y: number };
  createdAt: string;
  createdBy: string;
}

// Quiz Types
export type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'short_answer'
  | 'code';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
  explanation?: string;
  codeTemplate?: string;
  testCases?: { input: string; expectedOutput: string }[];
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  questions?: QuizQuestion[];
  questionsJson?: string; // JSON string from backend
  timeLimit?: number; // in minutes
  dueDate: string;
  shuffleQuestions: boolean;
  showResults: boolean;
  maxAttempts: number;
  createdAt: string;
  createdBy?: string;
  totalAttempts: number;
  averageScore: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  answers: {
    questionId: string;
    answer: string | string[];
    isCorrect?: boolean;
    score?: number;
  }[];
  startedAt: string;
  completedAt?: string;
  score?: number;
  maxScore: number;
  status: 'in_progress' | 'completed' | 'graded';
  feedback?: string;
}

// Course Type
export interface Course {
  id: string;
  name: string;
  code: string;
  instructor: string;
  studentCount: number;
}

// Analytics Types
export interface StudentPerformance {
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  averageScore: number;
  completionRate: number;
  submittedCount: number;
  totalAssignments: number;
  trend: 'up' | 'down' | 'stable';
  scores: { date: string; score: number }[];
}

export interface CourseAnalytics {
  courseId: string;
  courseName: string;
  averageScore: number;
  submissionRate: number;
  totalStudents?: number;
  totalAssignments?: number;
  completionRate?: number;
  gradeDistribution: { grade: string; count: number }[];
  assignmentDifficulty: {
    assignmentId: string;
    title: string;
    avgScore: number;
  }[];
}

// User Types
export type UserRole = 'admin' | 'tutor' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}
