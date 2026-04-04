/* eslint-disable no-useless-catch */
import axios from 'axios';

// In development: VITE_API_BASE_URL defaults to '/api' which Vite proxies to the hosted backend.
// In production build: VITE_API_BASE_URL is set to 'https://techaipath.com/api'.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add this interceptor for session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errMsg =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      '';
    if (
      typeof errMsg === 'string' &&
      errMsg.includes('io.jsonwebtoken.ExpiredJwtException')
    ) {
      alert('Session expired. Please log in again.');
      // Optionally, clear token and redirect to login:
      localStorage.removeItem('token');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

const setAuthorizationHeader = () => {
  const token = localStorage.getItem('token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};
/**
 * const {
  data,
  error,
  isLoading,
  isFetching,
  isError,
  refetch,
} = useQuery({
  queryKey: ['team', teamId],
  queryFn: () => apiService.get(endpoints.getTeamById(teamId)).then(res => res.data),
});
})
 */
export const endpoints = {
  login: '/v1/auth/login',
  googleLogin: '/v1/auth/google',
  logout: '/v1/auth/logout',
  register: '/v1/auth/register',
  getProfile: '/v1/auth/profile',
  updateProfile: '/v1/auth/profile',

  createProfile: '/user-profile',
  getAllUsers: '/users/all',
  getAllRoles: '/roles/all',
  activateAccount: (userId: string) => `/v1/auth/activate?userId=${userId}`,
  approveStudentApplication: (userId: string) =>
    `/v1/auth/approve-student?userId=${userId}`,
  approveUser: (userId: string) => `/v1/auth/approve-user?userId=${userId}`,
  lockUser: (userId: string) => `/users/${userId}/lock`,
  unlockUser: (userId: string) => `/users/${userId}/unlock`,
  suspendUser: (userId: string) => `/users/${userId}/suspend`,
  activateUser: (userId: string) => `/users/${userId}/activate`,
  changeUserRole: (userId: string) => `/users/${userId}/role`,

  // Courses
  getAllCourses: '/courses',
  createCourse: '/courses',
  updateCourse: `/courses`,
  deleteCourse: (courseId: string) => `/courses/${courseId}`,
  getCourseById: (courseId: string) => `/courses/${courseId}`,
  forgotPassword: (userId: string) =>
    `/v1/auth/forgot-password?userId=${userId}`,
  forgotPasswordEmail: (email: string) =>
    `/v1/auth/forgot-password?email=${email}`,
  changePassword: (id: string) => `/v1/auth/change-password/${id}`,

  getIntegrationDetails: '/events/getGoogleIntergrationDetails',
  googleCalendarCallback: (code: string) => `/events/callback?code=${code}`,
  addMembersToCourse: (courseId: string) => `/courses/add-members/${courseId}`,
  removeMemberFromCourse: (courseId: string) =>
    `/courses/remove-members/${courseId}`,
  addTutorsToCourse: (courseId: string) =>
    `/courses/add-members/${courseId}?isStudents=false`,
  createEvent: '/events/create',
  createPersonalEvent: '/events/create-personal',
  getUserEvents: '/events',
  checkEventConflicts: (startTime: string, endTime: string) =>
    `/events/check-conflicts?startTime=${startTime}&endTime=${endTime}`,
  getEventRsvps: (eventId: string) => `/events/${eventId}/rsvps`,
  respondToRsvp: (eventId: string) => `/events/${eventId}/rsvp`,
  getMyRsvp: (eventId: string) => `/events/${eventId}/rsvp/mine`,
  getRsvpCounts: (eventId: string) => `/events/${eventId}/rsvp/counts`,

  // Calendar Notes
  getCalendarNotes: '/calendar-notes',
  getCalendarNotesByDate: (date: string) => `/calendar-notes/date/${date}`,
  getCalendarNotesRange: (start: string, end: string) =>
    `/calendar-notes/range?start=${start}&end=${end}`,
  createCalendarNote: '/calendar-notes',
  updateCalendarNote: (noteId: string) => `/calendar-notes/${noteId}`,
  toggleCalendarNote: (noteId: string) => `/calendar-notes/${noteId}/toggle`,
  deleteCalendarNote: (noteId: string) => `/calendar-notes/${noteId}`,
  getAll: '/course-modules',
  getById: (id: string) => `/course-modules/${id}`,
  create: '/course-modules',
  update: (id: string) => `/course-modules/${id}`,
  delete: (id: string) => `/course-modules/${id}`,
  getCourseModules: (courseId: string) => `/course-modules/course/${courseId}`,

  uploadFileTeam: (name: string, description: string, teamId: string) =>
    `/documents/upload?name=${name}&description=${description}&teamId=${teamId}`,

  uploadFile: (name: string, description: string) =>
    `/documents/upload?name=${name}&description=${description}`,
  getDocumentPreview: (id: string) => `/documents/preview/${id}`,

  // Team endpoints
  createTeam: '/teams',
  updateTeam: '/teams',
  getUserTeams: '/teams',
  getTeamById: (teamId: string) => `/teams/${teamId}`,

  // Audit Log endpoints
  getAuditLogs: '/audit-logs',
  getAuditLogsFiltered: '/audit-logs/filter',
  getAuditLogsByUser: (userId: string) => `/audit-logs/user/${userId}`,
  getAuditLogStats: '/audit-logs/stats',

  // Requirements endpoints
  getTeamRequirements: (teamId: string) => `/requirements/team/${teamId}`,
  createRequirement: '/requirements',
  updateRequirement: '/requirements',
  deleteRequirement: (id: string) => `/requirements/${id}`,
  generateBoardFromRequirements: '/requirements/generate-board',
  /**api/teams/invite?
    teamId={{$random.uuid}}&
    email={{$random.alphanumeric(8)}}&
    roleId={{$random.uuid}} */
  inviteMemberToTeam: (teamId: string, email: string, roleId: string) =>
    `/teams/invite?teamId=${teamId}&email=${email}&roleId=${roleId}`,
  /**project-controller


GET
/api/projects/{id}


PUT
/api/projects/{id}


GET
/api/projects


POST
/api/projects */
  getProjectById: (id: string) => `/projects/${id}`,
  updateProject: (id: string) => `/projects/${id}`,
  getUserProjects: '/projects',
  createProject: '/projects',

  submitProjectForApproval: (projectId: string) =>
    `/v1/workflow/projects/${projectId}/submit`,
  rejectProject: (projectId: string) =>
    `/v1/workflow/projects/${projectId}/reject`,
  approveProject: (projectId: string) =>
    `/v1/workflow/projects/${projectId}/approve`,
  getAllApprovals: '/v1/workflow/approvals',

  // LMS - Quizzes
  getAllQuizzes: '/lms/quizzes',
  getQuizById: (id: string) => `/lms/quizzes/${id}`,
  createQuiz: '/lms/quizzes',
  updateQuiz: (id: string) => `/lms/quizzes/${id}`,
  deleteQuiz: (id: string) => `/lms/quizzes/${id}`,

  // LMS - Assignments
  getAllAssignments: '/lms/assignments',
  getAssignmentById: (id: string) => `/lms/assignments/${id}`,
  createAssignment: '/lms/assignments',
  updateAssignment: (id: string) => `/lms/assignments/${id}`,
  deleteAssignment: (id: string) => `/lms/assignments/${id}`,

  // LMS - Submissions
  getAllSubmissions: '/lms/submissions',
  createSubmission: '/lms/submissions',
  uploadSubmission: '/lms/submissions/upload',
  getSubmissionById: (id: string) => `/lms/submissions/${id}`,
  gradeSubmission: (id: string) => `/lms/submissions/${id}/grade`,

  // LMS - Quiz Attempts
  getAllQuizAttempts: '/lms/quiz-attempts',
  createQuizAttempt: '/lms/quiz-attempts',

  // Users
  getCurrentUser: '/users/me',

  // LMS - Grades Export
  exportGrades: '/lms/grades/export',

  // LMS - Analytics
  getStudentPerformance: '/lms/analytics/student-performance',
  getCourseAnalytics: '/lms/analytics/course',
  // uploadSubmission: '/lms/submissions/upload',

  // Student Dashboard
  getStudentDashboard: '/student/dashboard',

  // Mentorship
  getAllMenteeRequests: '/mentee-requests',
  createMenteeRequest: '/mentee-requests',
  updateMenteeRequestStatus: (id: string) => `/mentee-requests/${id}/status`,
  assignMentorToRequest: (id: string, mentorId: string) =>
    `/mentee-requests/${id}/assign-mentor?mentorId=${mentorId}`,
  getMenteeRequestById: (id: string) => `/mentee-requests/${id}`,
  deleteMenteeRequest: (id: string) => `/mentee-requests/${id}`,
  /**GET
/api/mentee-requests/by-mentor


GET
/api/mentee-requests/by-mentee */

  getMenteeRequestsByMentor: '/mentee-requests/by-mentor',
  getMenteeRequestsByMentee: '/mentee-requests/by-mentee',

  // Mentorship Sessions
  getAllMentorshipSessions: '/mentorship-sessions',
  createMentorshipSession: '/mentorship-sessions',
  getMentorshipSessionById: (id: string) => `/mentorship-sessions/${id}`,
  updateMentorshipSession: (id: string) => `/mentorship-sessions/${id}`,
  deleteMentorshipSession: (id: string) => `/mentorship-sessions/${id}`,
  getMentorshipSessionsByMentor: '/mentorship-sessions/by-mentor',
  getUpcomingMentorshipSessions: '/mentorship-sessions/upcoming',
  getUpcomingMentorshipSessionsByMentor: '/mentorship-sessions/upcoming/by-mentor',
  getMentorshipSessionsByGroup: (groupId: string) => `/mentorship-sessions/by-group/${groupId}`,
  updateMentorshipSessionStatus: (id: string) => `/mentorship-sessions/${id}/status`,
  addMentorshipSessionFeedback: (id: string) => `/mentorship-sessions/${id}/feedback`,

  // Mentor Groups
  getAllMentorGroups: '/mentor-groups',
  createMentorGroup: '/mentor-groups',
  getMentorGroupById: (id: string) => `/mentor-groups/${id}`,
  updateMentorGroup: (id: string) => `/mentor-groups/${id}`,
  deleteMentorGroup: (id: string) => `/mentor-groups/${id}`,
  getMentorGroupsByMentor: '/mentor-groups/by-mentor',
  getActiveMentorGroups: '/mentor-groups/active',
  addMentorGroupMember: (groupId: string, userId: string) => `/mentor-groups/${groupId}/members/${userId}`,
  removeMentorGroupMember: (groupId: string, userId: string) => `/mentor-groups/${groupId}/members/${userId}`,
  updateMentorGroupStatus: (id: string) => `/mentor-groups/${id}/status`,

  // Mentorship Stats & Mentors
  getMentorshipStats: '/mentorship/stats',
  getMentors: '/mentorship/mentors',
  /**GET
/api/menus


POST
/api/menus


POST
/api/menus/{menuId}/toggle-role/{roleId}


POST
/api/menus/populate


GET
/api/menus/{id}


DELETE
/api/menus/{id}


GET
/api/menus/by-role/{roleId} */
  //MENUS
  // getAllRoles: "/roles/all",
  getAllMenus: '/menus',
  createMenu: '/menus',
  toggleMenuRole: (menuId: string, roleId: string) =>
    `/menus/${menuId}/toggle-role/${roleId}`,
  populateMenus: '/menus/populate',
  getMenuById: (id: string) => `/menus/${id}`,
  deleteMenu: (id: string) => `/menus/${id}`,
  getMenusByRole: (roleId: string) => `/menus/by-role/${roleId}`,

  // Settings
  getUserSettings: '/settings/user',
  updateUserSettings: '/settings/user',
  getSystemSettings: '/settings/system',
  getSystemSettingsByCategory: (category: string) => `/settings/system/category/${category}`,
  upsertSystemSetting: '/settings/system',
  deleteSystemSetting: (key: string) => `/settings/system/${key}`,
  initializeSystemSettings: '/settings/system/initialize',

  // Notifications
  getNotifications: '/notifications',
  getUnreadNotifications: '/notifications/unread',
  getUnreadCount: '/notifications/unread/count',
  markNotificationRead: (id: string) => `/notifications/${id}/read`,
  markAllNotificationsRead: '/notifications/read-all',
  deleteReadNotifications: '/notifications/read',

  // Meeting Templates
  getMeetingTemplates: '/meeting-templates',
  getMyMeetingTemplates: '/meeting-templates/mine',
  getMeetingTemplateById: (id: string) => `/meeting-templates/${id}`,
  createMeetingTemplate: '/meeting-templates',
  updateMeetingTemplate: (id: string) => `/meeting-templates/${id}`,
  deleteMeetingTemplate: (id: string) => `/meeting-templates/${id}`,

  // Gamification
  getGamificationProfile: '/gamification/profile',
  getGamificationProfileById: (userId: string) => `/gamification/profile/${userId}`,
  getLeaderboard: '/gamification/leaderboard',
  getStreakLeaderboard: '/gamification/leaderboard/streaks',
  getPointHistory: '/gamification/points/history',
  getAllBadges: '/gamification/badges',
  getMyBadges: '/gamification/badges/mine',
  getUserBadges: (userId: string) => `/gamification/badges/${userId}`,
  awardPoints: '/gamification/points/award',
  createBadge: '/gamification/badges',
  seedBadges: '/gamification/badges/seed',

  // Discussion Forum
  getForumCategories: '/forum/categories',
  getForumCategoriesByCourse: (courseId: string) => `/forum/categories/course/${courseId}`,
  createForumCategory: '/forum/categories',
  updateForumCategory: (categoryId: string) => `/forum/categories/${categoryId}`,
  getForumThreadsByCategory: (categoryId: string) => `/forum/threads/category/${categoryId}`,
  getForumThread: (threadId: string) => `/forum/threads/${threadId}`,
  searchForumThreads: '/forum/threads/search',
  getMyForumThreads: '/forum/threads/mine',
  createForumThread: '/forum/threads',
  updateForumThread: (threadId: string) => `/forum/threads/${threadId}`,
  togglePinThread: (threadId: string) => `/forum/threads/${threadId}/pin`,
  toggleLockThread: (threadId: string) => `/forum/threads/${threadId}/lock`,
  deleteForumThread: (threadId: string) => `/forum/threads/${threadId}`,
  getForumPosts: (threadId: string) => `/forum/posts/thread/${threadId}`,
  createForumPost: '/forum/posts',
  updateForumPost: (postId: string) => `/forum/posts/${postId}`,
  markForumPostAsAnswer: (postId: string) => `/forum/posts/${postId}/answer`,
  deleteForumPost: (postId: string) => `/forum/posts/${postId}`,
  toggleForumReaction: (postId: string) => `/forum/posts/${postId}/react`,
  seedForumCategories: '/forum/seed',

  // Certificates
  getCertificateTemplates: '/certificates/templates',
  createCertificateTemplate: '/certificates/templates',
  updateCertificateTemplate: (templateId: string) => `/certificates/templates/${templateId}`,
  getMyCertificates: '/certificates/mine',
  getUserCertificates: (userId: string) => `/certificates/user/${userId}`,
  getAllCertificates: '/certificates',
  verifyCertificate: (code: string) => `/certificates/verify/${code}`,
  issueCertificate: '/certificates/issue',
  revokeCertificate: (certificateId: string) => `/certificates/${certificateId}/revoke`,
  seedCertificateTemplates: '/certificates/templates/seed',

  // Attendance
  recordAttendance: '/attendance',
  bulkRecordAttendance: '/attendance/bulk',
  selfCheckIn: (eventId: string) => `/attendance/check-in/${eventId}`,
  checkOut: (eventId: string) => `/attendance/check-out/${eventId}`,
  getEventAttendance: (eventId: string) => `/attendance/event/${eventId}`,
  getMyAttendance: '/attendance/mine',
  getUserAttendance: (userId: string) => `/attendance/user/${userId}`,
  getCourseAttendance: (courseId: string) => `/attendance/course/${courseId}`,
  getUserAttendanceRange: (userId: string) => `/attendance/user/${userId}/range`,
  getMyAttendanceStats: '/attendance/stats/mine',
  getUserAttendanceStats: (userId: string) => `/attendance/stats/user/${userId}`,
  getEventAttendanceStats: (eventId: string) => `/attendance/stats/event/${eventId}`,
  getCourseAttendanceStats: (courseId: string) => `/attendance/stats/course/${courseId}`,

  // Announcements
  getAnnouncements: '/announcements',
  getAllAnnouncementsAdmin: '/announcements/all',
  getCourseAnnouncements: (courseId: string) => `/announcements/course/${courseId}`,
  searchAnnouncements: '/announcements/search',
  createAnnouncement: '/announcements',
  updateAnnouncement: (announcementId: string) => `/announcements/${announcementId}`,
  deleteAnnouncement: (announcementId: string) => `/announcements/${announcementId}`,
  markAnnouncementRead: (announcementId: string) => `/announcements/${announcementId}/read`,
  getAnnouncementReadStatus: (announcementId: string) => `/announcements/${announcementId}/read-status`,

  // Role Upgrade
  submitRoleUpgradeRequest: '/role-upgrade/request',
  getMyRoleUpgradeRequests: '/role-upgrade/mine',
  getPendingRoleUpgradeRequests: '/role-upgrade/pending',
  getPendingRoleUpgradeCount: '/role-upgrade/pending/count',
  getAllRoleUpgradeRequests: '/role-upgrade',
  approveRoleUpgrade: (requestId: string) => `/role-upgrade/${requestId}/approve`,
  rejectRoleUpgrade: (requestId: string) => `/role-upgrade/${requestId}/reject`,

  // Code Execution
  executeCode: '/code/execute',
  executeCodePiston: '/code/execute/piston',        // Piston engine (playground batch)
  getPistonRuntimes: '/code/runtimes/piston',       // Piston language list
  getTerminalInfo:   '/code/terminal/info',          // Interactive terminal info
  submitCodeForGrading: (assignmentId: string) => `/code/submit/${assignmentId}`,
  getCodeSubmission: (id: string) => `/code/submissions/${id}`,
  getMyCodeSubmissions: '/code/submissions/mine',
  getAssignmentSubmissions: (assignmentId: string) => `/code/submissions/assignment/${assignmentId}`,
  getCodeQueueStatus: '/code/status',
  getCodeRuntimes: '/code/runtimes',
  getCodingAssignments: (courseId: string) => `/code/assignments?courseId=${courseId}`,
  getCodingAssignment: (id: string) => `/code/assignments/${id}`,
  createCodingAssignment: '/code/assignments',
  updateCodingAssignment: (id: string) => `/code/assignments/${id}`,
  deleteCodingAssignment: (id: string) => `/code/assignments/${id}`,
  getCodingTestCases: (assignmentId: string) => `/code/assignments/${assignmentId}/test-cases`,
  addCodingTestCase: (assignmentId: string) => `/code/assignments/${assignmentId}/test-cases`,
  updateCodingTestCase: (testCaseId: string) => `/code/test-cases/${testCaseId}`,
  deleteCodingTestCase: (testCaseId: string) => `/code/test-cases/${testCaseId}`,

  // Code Collaboration
  createCollabSession: '/collab/sessions',
  joinCollabSession: (sessionId: string) => `/collab/sessions/${sessionId}/join`,
  getCollabSession: (sessionId: string) => `/collab/sessions/${sessionId}`,
  leaveCollabSession: (sessionId: string) => `/collab/sessions/${sessionId}`,

  // Support & Helpdesk
  createSupportTicket: '/support/tickets',
  getMySupportTickets: '/support/tickets/mine',
  getSupportTicket: (id: string) => `/support/tickets/${id}`,
  getSupportTicketByNumber: (num: string) => `/support/tickets/number/${num}`,
  getAllSupportTickets: '/support/tickets',
  getSupportTicketsByStatus: (status: string) => `/support/tickets/status/${status}`,
  getAssignedSupportTickets: '/support/tickets/assigned',
  updateSupportTicketStatus: (id: string) => `/support/tickets/${id}/status`,
  assignSupportTicket: (id: string) => `/support/tickets/${id}/assign`,
  escalateSupportTicket: (id: string) => `/support/tickets/${id}/escalate`,
  addSupportTicketComment: (ticketId: string) => `/support/tickets/${ticketId}/comments`,
  getSupportTicketComments: (ticketId: string) => `/support/tickets/${ticketId}/comments`,
  getSupportTicketStats: '/support/stats',

  // Knowledge Base
  getKBCategories: '/support/kb/categories',
  createKBCategory: '/support/kb/categories',
  updateKBCategory: (id: string) => `/support/kb/categories/${id}`,
  getKBArticlesByCategory: (categoryId: string) => `/support/kb/categories/${categoryId}/articles`,
  getKBArticle: (id: string) => `/support/kb/articles/${id}`,
  getKBArticleBySlug: (slug: string) => `/support/kb/articles/slug/${slug}`,
  searchKB: '/support/kb/search',
  getKBFAQs: '/support/kb/faq',
  getKBVideoGuides: '/support/kb/video-guides',
  createKBArticle: '/support/kb/articles',
  updateKBArticle: (id: string) => `/support/kb/articles/${id}`,
  markKBArticleHelpful: (id: string) => `/support/kb/articles/${id}/helpful`,
  deleteKBArticle: (id: string) => `/support/kb/articles/${id}`,
  seedKB: '/support/kb/seed',

  // Learning Paths
  createLearningPath: '/learning-paths',
  getPublishedLearningPaths: '/learning-paths',
  getAllLearningPaths: '/learning-paths/all',
  getLearningPath: (id: string) => `/learning-paths/${id}`,
  updateLearningPath: (id: string) => `/learning-paths/${id}`,
  publishLearningPath: (id: string) => `/learning-paths/${id}/publish`,
  deleteLearningPath: (id: string) => `/learning-paths/${id}`,
  addLearningPathStep: (pathId: string) => `/learning-paths/${pathId}/steps`,
  updateLearningPathStep: (stepId: string) => `/learning-paths/steps/${stepId}`,
  reorderLearningPathSteps: (pathId: string) => `/learning-paths/${pathId}/steps/reorder`,
  removeLearningPathStep: (stepId: string) => `/learning-paths/steps/${stepId}`,
  enrollInLearningPath: (pathId: string) => `/learning-paths/${pathId}/enroll`,
  getLearningPathProgress: (pathId: string) => `/learning-paths/${pathId}/progress`,
  completeLearningPathStep: (progressId: string) => `/learning-paths/progress/${progressId}/complete`,
  getMyEnrolledPaths: '/learning-paths/my-paths',

  // Prerequisites
  addCoursePrerequisite: '/learning-paths/prerequisites',
  getCoursePrerequisites: (courseId: string) => `/learning-paths/prerequisites/course/${courseId}`,
  checkCoursePrerequisites: (courseId: string) => `/learning-paths/prerequisites/check/${courseId}`,
  removeCoursePrerequisite: (id: string) => `/learning-paths/prerequisites/${id}`,

  // Skill Mastery
  getMySkills: '/learning-paths/skills/mine',
  getSkillsByCategory: (category: string) => `/learning-paths/skills/category/${category}`,
  updateSkillMastery: '/learning-paths/skills/update',

  // Waitlist
  joinWaitlist: (courseId: string) => `/waitlist/${courseId}`,
  leaveWaitlist: (courseId: string) => `/waitlist/${courseId}`,
  getWaitlistPosition: (courseId: string) => `/waitlist/${courseId}/position`,
  getWaitlist: (courseId: string) => `/waitlist/${courseId}`,
  promoteFromWaitlist: (courseId: string) => `/waitlist/${courseId}/promote`,
  getWaitlistCount: (courseId: string) => `/waitlist/${courseId}/count`,

  // Content Versioning
  createContentVersion: '/content-versions',
  getContentVersionHistory: (moduleId: string) => `/content-versions/module/${moduleId}`,
  getContentVersion: (id: string) => `/content-versions/${id}`,
  getCurrentContentVersion: (moduleId: string) => `/content-versions/module/${moduleId}/current`,
  publishContentVersion: (id: string) => `/content-versions/${id}/publish`,
  revertContentVersion: (id: string) => `/content-versions/${id}/revert`,
  archiveContentVersion: (id: string) => `/content-versions/${id}/archive`,
  compareContentVersions: '/content-versions/compare',

  // AI Chat
  aiChat: '/ai/chat',

  // Google Form Enrollments
  googleFormPendingEnrollments: '/google-form/pending',
  googleFormEnrollmentsByCourse: (courseId: string) => `/google-form/course/${courseId}`,
  googleFormCancelEnrollment: (enrollmentId: string) => `/google-form/pending/${enrollmentId}`,
  googleFormStats: '/google-form/stats',
};

export const apiService = {
  getWithParams: async (endpoint, params) => {
    try {
      setAuthorizationHeader(); // Set Authorizcation header beore making the request
      const response = await api.get(endpoint, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },
  get: async (endpoint) => {
    try {
      setAuthorizationHeader(); // Set Authorization header before making the request
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  },

  post: async (endpoint, data?) => {
    try {
      setAuthorizationHeader();
      const response = await api.post(endpoint, data);
      return response;
    } catch (error) {
      throw error;
    }
  },
  patch: async (endpoint, data?) => {
    try {
      setAuthorizationHeader();
      const response = await api.patch(endpoint, data);
      return response;
    } catch (error) {
      throw error;
    }
  },
  login: async (endpoint, data?) => {
    try {
      // setAuthorizationHeader();
      const response = await api.post(endpoint, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  put: async (endpoint, data) => {
    try {
      setAuthorizationHeader();
      const response = await api.put(endpoint, data);
      return response;
    } catch (error) {
      throw error;
    }
  },
  delete: async (endpoint) => {
    try {
      setAuthorizationHeader();
      const response = await api.delete(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  },
};
