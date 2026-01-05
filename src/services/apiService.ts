import {
  Assignment,
  AssignmentSubmission,
  Quiz,
  QuizAttempt,
  Course,
  StudentPerformance,
  CourseAnalytics,
  User,
} from '@/types/lms';
import { apiService as api, endpoints, API_BASE_URL } from '@/lib/api';

// Centralized API service for LMS endpoints
export const apiService = {
  // Courses
  getCourses: async (): Promise<Course[]> => {
    const response = await api.get(endpoints.getAllCourses);
    return response.data;
  },

  getCourse: async (id: string): Promise<Course | undefined> => {
    const response = await api.get(endpoints.getCourseById(id));
    return response.data;
  },

  // Assignments
  getAssignments: async (filters?: {
    courseId?: string;
    status?: string;
  }): Promise<Assignment[]> => {
    const response = await api.getWithParams(
      endpoints.getAllAssignments,
      filters
    );
    return response.data;
  },

  getAssignment: async (id: string): Promise<Assignment | undefined> => {
    const response = await api.get(endpoints.getAssignmentById(id));
    return response.data;
  },

  createAssignment: async (data: Partial<Assignment>): Promise<Assignment> => {
    const response = await api.post(endpoints.createAssignment, data);
    return response.data;
  },

  updateAssignment: async (
    id: string,
    data: Partial<Assignment>
  ): Promise<Assignment | undefined> => {
    const response = await api.put(endpoints.updateAssignment(id), data);
    return response.data;
  },

  deleteAssignment: async (id: string): Promise<boolean> => {
    await api.delete(endpoints.deleteAssignment(id));
    return true;
  },

  // Submissions
  getSubmissions: async (filters?: {
    assignmentId?: string;
    studentId?: string;
    status?: string;
  }): Promise<AssignmentSubmission[]> => {
    const response = await api.getWithParams(
      endpoints.getAllSubmissions,
      filters
    );
    return response.data;
  },

  getSubmission: async (
    id: string
  ): Promise<AssignmentSubmission | undefined> => {
    const response = await api.get(endpoints.getSubmissionById(id));
    return response.data;
  },

  submitAssignment: async (
    data: Partial<AssignmentSubmission>
  ): Promise<AssignmentSubmission> => {
    const response = await api.post(endpoints.createSubmission, data);
    return response.data;
  },

  uploadSubmissionFiles: async (
    assignmentId: string,
    files: { file: File; name: string; description: string }[],
    repoUrl?: string,
    demoUrl?: string,
    onProgress?: (progress: number) => void
  ): Promise<AssignmentSubmission> => {
    const formData = new FormData();
    formData.append('assignmentId', assignmentId);

    if (repoUrl) formData.append('repoUrl', repoUrl);
    if (demoUrl) formData.append('demoUrl', demoUrl);

    // Append each file with its metadata matching the backend structure
    // Backend expects: uploadRequests[index].file, uploadRequests[index].name, uploadRequests[index].description
    files.forEach((fileData, index) => {
      formData.append(`uploadRequests[${index}].file`, fileData.file);
      formData.append(`uploadRequests[${index}].name`, fileData.name);
      formData.append(
        `uploadRequests[${index}].description`,
        fileData.description
      );
    });

    const token = localStorage.getItem('token');
    const response = await fetch(
      `${API_BASE_URL}${endpoints.uploadSubmission}`,
      {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  },

  gradeSubmission: async (
    id: string,
    data: {
      grade: number;
      feedback?: string;
      rubricGrades?: Record<string, unknown>[];
    }
  ): Promise<AssignmentSubmission | undefined> => {
    const response = await api.post(endpoints.gradeSubmission(id), data);
    return response.data;
  },

  // Quizzes
  getQuizzes: async (filters?: { courseId?: string }): Promise<Quiz[]> => {
    const response = await api.getWithParams(endpoints.getAllQuizzes, filters);
    return response.data;
  },

  getQuiz: async (id: string): Promise<Quiz | undefined> => {
    const response = await api.get(endpoints.getQuizById(id));
    return response.data;
  },

  createQuiz: async (data: Partial<Quiz>): Promise<Quiz> => {
    const response = await api.post(endpoints.createQuiz, data);
    return response.data;
  },

  updateQuiz: async (
    id: string,
    data: Partial<Quiz>
  ): Promise<Quiz | undefined> => {
    const response = await api.put(endpoints.updateQuiz(id), data);
    return response.data;
  },

  deleteQuiz: async (id: string): Promise<boolean> => {
    await api.delete(endpoints.deleteQuiz(id));
    return true;
  },

  // Quiz Attempts
  getQuizAttempts: async (filters?: {
    quizId?: string;
    studentId?: string;
  }): Promise<QuizAttempt[]> => {
    const response = await api.getWithParams(
      endpoints.getAllQuizAttempts,
      filters
    );
    return response.data;
  },

  submitQuizAttempt: async (
    data: Partial<QuizAttempt>
  ): Promise<QuizAttempt> => {
    const response = await api.post(endpoints.createQuizAttempt, data);
    return response.data;
  },

  // Analytics
  getStudentPerformance: async (
    studentId?: string
  ): Promise<StudentPerformance[]> => {
    const response = await api.getWithParams(
      endpoints.getStudentPerformance,
      studentId ? { studentId } : undefined
    );
    return response.data;
  },

  getCourseAnalytics: async (courseId?: string): Promise<CourseAnalytics[]> => {
    const response = await api.getWithParams(
      endpoints.getCourseAnalytics,
      courseId ? { courseId } : undefined
    );
    return response.data;
  },

  // User
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get(endpoints.getCurrentUser);
    return response.data;
  },

  // Export
  exportGrades: async (filters?: {
    courseId?: string;
    assignmentId?: string;
  }): Promise<string> => {
    const response = await api.getWithParams(endpoints.exportGrades, filters);
    return response.data;
  },
};
