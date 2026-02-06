// Mentorship Module API Layer

import {
  Mentor,
  Mentee,
  MenteeRequest,
  MentorshipMatch,
  MentorGroup,
  MentorshipSession,
  MenteeGoal,
  MentorshipStats,
} from '@/types/mentorship';
import { apiService, endpoints } from './api';

// Dummy data for development
const dummyMentors: Mentor[] = [
  {
    id: 'mentor-1',
    userId: 'user-101',
    user: {
      id: 'user-101',
      username: 'dr.sarah',
      firstName: 'Dr. Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@university.edu',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      roleName: 'Mentor',
    },
    status: 'active',
    bio: 'Senior software engineer with 15 years of experience in full-stack development. Passionate about helping students transition into tech careers.',
    expertise: ['React', 'Node.js', 'System Design', 'Career Development'],
    availability: 'Weekdays 6-9 PM',
    maxMentees: 5,
    currentMenteeCount: 3,
    yearsOfExperience: 15,
    linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
    calendlyUrl: 'https://calendly.com/sarahjohnson',
    rating: 4.9,
    totalSessions: 124,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2025-01-03T14:30:00Z',
  },
  {
    id: 'mentor-2',
    userId: 'user-102',
    user: {
      id: 'user-102',
      username: 'mike.chen',
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'mike.chen@techcorp.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      roleName: 'Tutor',
    },
    status: 'active',
    bio: 'Data scientist and ML engineer. Love teaching machine learning concepts and helping with data science projects.',
    expertise: ['Machine Learning', 'Python', 'Data Science', 'Statistics'],
    availability: 'Weekends',
    maxMentees: 4,
    currentMenteeCount: 4,
    yearsOfExperience: 8,
    linkedinUrl: 'https://linkedin.com/in/mikechen',
    rating: 4.8,
    totalSessions: 89,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2025-01-02T09:15:00Z',
  },
  {
    id: 'mentor-3',
    userId: 'user-103',
    user: {
      id: 'user-103',
      username: 'emily.davis',
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@startup.io',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      roleName: 'Mentor',
    },
    status: 'active',
    bio: 'UX designer and product manager. Helping students break into product and design roles.',
    expertise: ['UX Design', 'Product Management', 'User Research', 'Figma'],
    availability: 'Flexible',
    maxMentees: 6,
    currentMenteeCount: 2,
    yearsOfExperience: 10,
    rating: 4.7,
    totalSessions: 67,
    createdAt: '2024-06-10T10:00:00Z',
    updatedAt: '2025-01-01T16:45:00Z',
  },
  {
    id: 'mentor-4',
    userId: 'user-104',
    user: {
      id: 'user-104',
      username: 'james.wilson',
      firstName: 'James',
      lastName: 'Wilson',
      email: 'james@consulting.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
      roleName: 'Mentor',
    },
    status: 'pending_approval',
    bio: 'Business consultant specializing in entrepreneurship and startup strategy.',
    expertise: [
      'Entrepreneurship',
      'Business Strategy',
      'Fundraising',
      'Leadership',
    ],
    availability: 'Weekday mornings',
    maxMentees: 3,
    currentMenteeCount: 0,
    yearsOfExperience: 12,
    totalSessions: 0,
    createdAt: '2024-12-28T10:00:00Z',
    updatedAt: '2024-12-28T10:00:00Z',
  },
];

const dummyMentees: Mentee[] = [
  {
    id: 'mentee-1',
    userId: 'user-201',
    user: {
      id: 'user-201',
      username: 'alex.student',
      firstName: 'Alex',
      lastName: 'Thompson',
      email: 'alex.thompson@student.edu',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      roleName: 'Student',
    },
    status: 'matched',
    goals: 'Transition from academia to software engineering role',
    interests: ['Web Development', 'React', 'Career Guidance'],
    preferredMeetingFrequency: 'Weekly',
    currentMentorId: 'mentor-1',
    createdAt: '2024-09-01T10:00:00Z',
    updatedAt: '2025-01-02T11:00:00Z',
  },
  {
    id: 'mentee-2',
    userId: 'user-202',
    user: {
      id: 'user-202',
      username: 'jordan.lee',
      firstName: 'Jordan',
      lastName: 'Lee',
      email: 'jordan.lee@student.edu',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
      roleName: 'Student',
    },
    status: 'seeking_mentor',
    goals: 'Learn data science and machine learning fundamentals',
    interests: ['Machine Learning', 'Python', 'Data Analysis'],
    preferredMeetingFrequency: 'Bi-weekly',
    createdAt: '2024-11-15T10:00:00Z',
    updatedAt: '2024-12-20T14:30:00Z',
  },
  {
    id: 'mentee-3',
    userId: 'user-203',
    user: {
      id: 'user-203',
      username: 'sam.parker',
      firstName: 'Sam',
      lastName: 'Parker',
      email: 'sam.parker@student.edu',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
      roleName: 'Student',
    },
    status: 'seeking_mentor',
    goals: 'Build a portfolio and get UX internship',
    interests: ['UX Design', 'Figma', 'Portfolio Building'],
    preferredMeetingFrequency: 'Weekly',
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2024-12-28T09:00:00Z',
  },
];

const dummyRequests: MenteeRequest[] = [
  {
    id: 'request-1',
    menteeId: 'mentee-2',
    mentee: dummyMentees[1],
    requestedExpertise: ['Machine Learning', 'Python'],
    goals: 'Learn data science and build ML projects for portfolio',
    preferredMeetingFrequency: 'Bi-weekly',
    additionalNotes:
      'I have basic Python knowledge and completed some online courses',
    status: 'pending',
    createdAt: '2024-12-20T10:00:00Z',
    updatedAt: '2024-12-20T10:00:00Z',
  },
  {
    id: 'request-2',
    menteeId: 'mentee-3',
    mentee: dummyMentees[2],
    requestedExpertise: ['UX Design', 'Portfolio Building'],
    goals: 'Create a strong UX portfolio and land an internship',
    preferredMeetingFrequency: 'Weekly',
    additionalNotes:
      'Currently completing UX bootcamp, need guidance on portfolio projects',
    status: 'pending',
    createdAt: '2024-12-28T10:00:00Z',
    updatedAt: '2024-12-28T10:00:00Z',
  },
  {
    id: 'request-3',
    menteeId: 'mentee-1',
    mentee: dummyMentees[0],
    requestedExpertise: ['React', 'Career Development'],
    goals: 'Transition to software engineering',
    preferredMeetingFrequency: 'Weekly',
    status: 'matched',
    assignedMentorId: 'mentor-1',
    assignedMentor: dummyMentors[0],
    reviewedBy: 'admin-1',
    reviewedAt: '2024-09-05T14:00:00Z',
    reviewNotes: 'Great match based on expertise alignment',
    createdAt: '2024-09-01T10:00:00Z',
    updatedAt: '2024-09-05T14:00:00Z',
  },
];

const dummyMatches: MentorshipMatch[] = [
  {
    id: 'match-1',
    mentorId: 'mentor-1',
    mentor: dummyMentors[0],
    menteeId: 'mentee-1',
    mentee: dummyMentees[0],
    status: 'active',
    matchedBy: 'admin-1',
    matchedAt: '2024-09-05T14:00:00Z',
    goals:
      'Help Alex transition to software engineering with focus on React and job search',
    meetingFrequency: 'Weekly',
    nextSessionDate: '2025-01-08T18:00:00Z',
    totalSessions: 16,
    completedSessions: 14,
    createdAt: '2024-09-05T14:00:00Z',
    updatedAt: '2025-01-02T11:00:00Z',
  },
];

const dummyGroups: MentorGroup[] = [
  {
    id: 'group-1',
    name: 'Career Development Circle',
    description:
      'Group mentoring focused on tech career development, resume building, and interview prep',
    mentorId: 'mentor-1',
    mentor: dummyMentors[0],
    maxMembers: 8,
    currentMemberCount: 5,
    members: [dummyMentees[0]],
    focus: 'Career Development',
    meetingSchedule: 'Every Thursday 7 PM',
    status: 'active',
    createdAt: '2024-08-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
  },
  {
    id: 'group-2',
    name: 'ML Study Group',
    description:
      'Weekly study sessions covering machine learning concepts and hands-on projects',
    mentorId: 'mentor-2',
    mentor: dummyMentors[1],
    maxMembers: 10,
    currentMemberCount: 8,
    members: [],
    focus: 'Machine Learning',
    meetingSchedule: 'Saturdays 10 AM',
    status: 'active',
    createdAt: '2024-10-01T10:00:00Z',
    updatedAt: '2024-12-28T10:00:00Z',
  },
];

const dummySessions: MentorshipSession[] = [
  {
    id: 'session-1',
    matchId: 'match-1',
    match: dummyMatches[0],
    mentorId: 'mentor-1',
    mentor: dummyMentors[0],
    menteeIds: ['mentee-1'],
    mentees: [dummyMentees[0]],
    title: 'React Portfolio Review',
    description: "Review Alex's portfolio projects and discuss improvements",
    scheduledAt: '2025-01-08T18:00:00Z',
    duration: 60,
    meetingLink: 'https://zoom.us/j/123456789',
    status: 'scheduled',
    agenda:
      '1. Review portfolio\n2. Discuss React best practices\n3. Plan next steps',
    createdAt: '2025-01-02T10:00:00Z',
    updatedAt: '2025-01-02T10:00:00Z',
  },
  {
    id: 'session-2',
    matchId: 'match-1',
    mentorId: 'mentor-1',
    mentor: dummyMentors[0],
    menteeIds: ['mentee-1'],
    mentees: [dummyMentees[0]],
    title: 'Interview Prep Session',
    description: 'Mock technical interview practice',
    scheduledAt: '2025-01-01T18:00:00Z',
    duration: 60,
    meetingLink: 'https://zoom.us/j/123456789',
    status: 'completed',
    notes: 'Covered system design basics. Alex did well on coding problems.',
    mentorFeedback: 'Great progress! Ready for real interviews.',
    rating: 5,
    createdAt: '2024-12-28T10:00:00Z',
    updatedAt: '2025-01-01T19:00:00Z',
  },
  {
    id: 'session-3',
    groupId: 'group-1',
    group: dummyGroups[0],
    mentorId: 'mentor-1',
    mentor: dummyMentors[0],
    menteeIds: ['mentee-1'],
    mentees: [dummyMentees[0]],
    title: 'Group Career Workshop',
    description: 'Resume review and LinkedIn optimization',
    scheduledAt: '2025-01-09T19:00:00Z',
    duration: 90,
    meetingLink: 'https://zoom.us/j/987654321',
    status: 'scheduled',
    agenda: '1. Resume review\n2. LinkedIn tips\n3. Q&A',
    createdAt: '2025-01-03T10:00:00Z',
    updatedAt: '2025-01-03T10:00:00Z',
  },
];

const dummyGoals: MenteeGoal[] = [
  {
    id: 'goal-1',
    menteeId: 'mentee-1',
    matchId: 'match-1',
    title: 'Complete React Portfolio',
    description: 'Build 3 React projects showcasing different skills',
    targetDate: '2025-02-01',
    status: 'in_progress',
    progress: 66,
    mentorNotes:
      'Great progress on 2 projects. Focus on testing for the third.',
    createdAt: '2024-09-10T10:00:00Z',
    updatedAt: '2025-01-02T10:00:00Z',
  },
  {
    id: 'goal-2',
    menteeId: 'mentee-1',
    matchId: 'match-1',
    title: 'Apply to 10 Companies',
    description: 'Submit applications to 10 target companies',
    targetDate: '2025-01-31',
    status: 'in_progress',
    progress: 40,
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2025-01-02T10:00:00Z',
  },
  {
    id: 'goal-3',
    menteeId: 'mentee-1',
    matchId: 'match-1',
    title: 'Pass Technical Interviews',
    description: 'Complete 5 mock interviews and practice LeetCode',
    targetDate: '2025-02-15',
    status: 'not_started',
    progress: 0,
    createdAt: '2025-01-02T10:00:00Z',
    updatedAt: '2025-01-02T10:00:00Z',
  },
];

// Helper function to simulate API latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// API Endpoints (dummy implementations - replace with real API calls)
export const mentorshipApi = {
  // Stats
  getStats: async (): Promise<MentorshipStats> => {
    await delay(300);
    return {
      totalMentors: dummyMentors.length,
      activeMentors: dummyMentors.filter((m) => m.status === 'active').length,
      totalMentees: dummyMentees.length,
      pendingRequests: dummyRequests.filter((r) => r.status === 'pending')
        .length,
      activeMatches: dummyMatches.filter((m) => m.status === 'active').length,
      upcomingSessions: dummySessions.filter((s) => s.status === 'scheduled')
        .length,
      totalGroups: dummyGroups.length,
      completedSessions: dummySessions.filter((s) => s.status === 'completed')
        .length,
    };
  },

  // Mentors - Fetches from users API where isMentor is true or role is Mentor
  getMentors: async (filters?: {
    status?: string;
    expertise?: string;
  }): Promise<Mentor[]> => {
    try {
      const response = await apiService.getWithParams(endpoints.getAllUsers, {
        pageSize: 100, // Get all users to filter mentors
      });

      // Filter users who are mentors (isMentor === true or role === 'Mentor')
      const mentorUsers = (response.data?.data || []).filter(
        (user: Record<string, unknown>) =>
          user.isMentor === true || user.role === 'Mentor'
      );

      console.log('mentorUsers:', mentorUsers);

      // Map user data to Mentor type
      let result: Mentor[] = mentorUsers.map(
        (user: Record<string, unknown>) => ({
          id: user.id as string,
          userId: user.id as string,
          user: {
            id: user.id as string,
            username: user.username as string,
            firstName: user.firstName as string,
            lastName: user.lastName as string,
            email: user.email as string,
            avatar: user.profilePicture as string,
            profilePicture: user.profilePicture as string,
            roleName: user.role as string,
          },
          status:
            (user.status as string)?.toLowerCase() === 'active'
              ? 'active'
              : (user.status as string)?.toLowerCase() ===
                'registered_not_confirmed'
              ? 'pending_approval'
              : 'inactive',
          bio: (user.mentorBio as string) || '',
          expertise: (user.expertise as string[]) || [],
          availability: (user.preferredMeetingFrequency as string) || '',
          maxMentees: (user.maxMentees as number) || 5,
          currentMenteeCount: (user.currentMenteeCount as number) || 0,
          yearsOfExperience: (user.yearsOfExperience as number) || 0,
          totalSessions: 0,
          createdAt: user.createdAt as string,
          updatedAt: user.updatedAt as string,
        })
      );
      console.log('Mapped Mentors:', result);

      // // Apply filters
      // if (filters?.status) {
      //   result = result.filter((m) => m.status === filters.status);
      // }
      // if (filters?.expertise) {
      //   result = result.filter((m) =>
      //     m.expertise.some((e) =>
      //       e.toLowerCase().includes(filters.expertise!.toLowerCase())
      //     )
      //   );
      // }

      return result;
    } catch (error) {
      console.error('Error fetching mentors:', error);
      throw error;
    }
  },

  getMentor: async (id: string): Promise<Mentor | null> => {
    await delay(200);
    return dummyMentors.find((m) => m.id === id) || null;
  },

  createMentor: async (data: Partial<Mentor>): Promise<Mentor> => {
    await delay(300);
    const newMentor: Mentor = {
      id: `mentor-${Date.now()}`,
      userId: data.userId || '',
      user: data.user!,
      status: 'pending_approval',
      bio: data.bio || '',
      expertise: data.expertise || [],
      availability: data.availability || '',
      maxMentees: data.maxMentees || 3,
      currentMenteeCount: 0,
      yearsOfExperience: data.yearsOfExperience || 0,
      totalSessions: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dummyMentors.push(newMentor);
    return newMentor;
  },

  updateMentor: async (
    id: string,
    data: Partial<Mentor>
  ): Promise<Mentor | null> => {
    await delay(300);
    const index = dummyMentors.findIndex((m) => m.id === id);
    if (index === -1) return null;
    dummyMentors[index] = {
      ...dummyMentors[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return dummyMentors[index];
  },

  approveMentor: async (id: string): Promise<Mentor | null> => {
    await delay(300);
    return mentorshipApi.updateMentor(id, { status: 'active' });
  },

  // Mentees
  getMentees: async (filters?: { status?: string }): Promise<Mentee[]> => {
    await delay(400);
    let result = [...dummyMentees];
    if (filters?.status) {
      result = result.filter((m) => m.status === filters.status);
    }
    return result;
  },

  getMentee: async (id: string): Promise<Mentee | null> => {
    await delay(200);
    return dummyMentees.find((m) => m.id === id) || null;
  },

  // Requests - Using real API endpoints
  getRequests: async (filters?: {
    status?: string;
  }): Promise<MenteeRequest[]> => {
    try {
      const response = await apiService.getWithParams(
        endpoints.getAllMenteeRequests,
        filters
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching mentee requests:', error);
      throw error;
    }
  },

  getRequest: async (id: string): Promise<MenteeRequest | null> => {
    try {
      const response = await apiService.get(endpoints.getMenteeRequestById(id));
      return response.data;
    } catch (error) {
      console.error('Error fetching mentee request:', error);
      throw error;
    }
  },

  createRequest: async (
    data: Partial<MenteeRequest>
  ): Promise<MenteeRequest> => {
    try {
      const response = await apiService.post(endpoints.createMenteeRequest, {
        requestedExpertise: data.requestedExpertise || [],
        goals: data.goals || '',
        preferredMeetingFrequency: data.preferredMeetingFrequency || 'Weekly',
        additionalNotes: data.additionalNotes,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating mentee request:', error);
      throw error;
    }
  },

  updateRequest: async (
    id: string,
    data: Partial<MenteeRequest>
  ): Promise<MenteeRequest | null> => {
    try {
      const response = await apiService.put(
        endpoints.getMenteeRequestById(id),
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error updating mentee request:', error);
      throw error;
    }
  },

  updateRequestStatus: async (
    id: string,
    status: string
  ): Promise<MenteeRequest | null> => {
    try {
      const response = await apiService.put(
        endpoints.updateMenteeRequestStatus(id),
        { status }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating request status:', error);
      throw error;
    }
  },

  assignMentorToRequest: async (
    id: string,
    mentorId: string
  ): Promise<MenteeRequest | null> => {
    try {
      const response = await apiService.put(
        endpoints.assignMentorToRequest(id),
        { mentorId }
      );
      return response.data;
    } catch (error) {
      console.error('Error assigning mentor to request:', error);
      throw error;
    }
  },

  deleteRequest: async (id: string): Promise<void> => {
    try {
      await apiService.delete(endpoints.deleteMenteeRequest(id));
    } catch (error) {
      console.error('Error deleting mentee request:', error);
      throw error;
    }
  },

  // Matches
  getMatches: async (filters?: {
    status?: string;
    mentorId?: string;
    menteeId?: string;
  }): Promise<MentorshipMatch[]> => {
    await delay(400);
    let result = [...dummyMatches];
    if (filters?.status) {
      result = result.filter((m) => m.status === filters.status);
    }
    if (filters?.mentorId) {
      result = result.filter((m) => m.mentorId === filters.mentorId);
    }
    if (filters?.menteeId) {
      result = result.filter((m) => m.menteeId === filters.menteeId);
    }
    return result;
  },

  getMatch: async (id: string): Promise<MentorshipMatch | null> => {
    await delay(200);
    return dummyMatches.find((m) => m.id === id) || null;
  },

  createMatch: async (data: {
    mentorId: string;
    menteeId: string;
    requestId?: string;
    groupId?: string;
    goals: string;
    meetingFrequency: string;
  }): Promise<MentorshipMatch> => {
    try {
      // The API endpoint assigns a mentor to a mentee request
      // POST /mentee-requests/{requestId}/assign-mentor?mentorId={mentorId}
      if (!data.requestId) {
        throw new Error('Request ID is required to create a match');
      }

      const response = await apiService.patch(
        endpoints.assignMentorToRequest(data.requestId, data.mentorId)
      );

      return response.data;
    } catch (error) {
      console.error('Error creating match:', error);
      throw error;
    }
  },

  updateMatch: async (
    id: string,
    data: Partial<MentorshipMatch>
  ): Promise<MentorshipMatch | null> => {
    await delay(300);
    const index = dummyMatches.findIndex((m) => m.id === id);
    if (index === -1) return null;
    dummyMatches[index] = {
      ...dummyMatches[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return dummyMatches[index];
  },

  // Groups
  getGroups: async (filters?: {
    mentorId?: string;
    status?: string;
  }): Promise<MentorGroup[]> => {
    await delay(400);
    let result = [...dummyGroups];
    if (filters?.mentorId) {
      result = result.filter((g) => g.mentorId === filters.mentorId);
    }
    if (filters?.status) {
      result = result.filter((g) => g.status === filters.status);
    }
    return result;
  },

  getGroup: async (id: string): Promise<MentorGroup | null> => {
    await delay(200);
    return dummyGroups.find((g) => g.id === id) || null;
  },

  createGroup: async (data: Partial<MentorGroup>): Promise<MentorGroup> => {
    await delay(300);
    const mentor = dummyMentors.find((m) => m.id === data.mentorId);
    const newGroup: MentorGroup = {
      id: `group-${Date.now()}`,
      name: data.name || '',
      description: data.description || '',
      mentorId: data.mentorId || '',
      mentor: mentor!,
      maxMembers: data.maxMembers || 10,
      currentMemberCount: 0,
      members: [],
      focus: data.focus || '',
      meetingSchedule: data.meetingSchedule || '',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dummyGroups.push(newGroup);
    return newGroup;
  },

  updateGroup: async (
    id: string,
    data: Partial<MentorGroup>
  ): Promise<MentorGroup | null> => {
    await delay(300);
    const index = dummyGroups.findIndex((g) => g.id === id);
    if (index === -1) return null;
    dummyGroups[index] = {
      ...dummyGroups[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return dummyGroups[index];
  },

  // Sessions
  getSessions: async (filters?: {
    mentorId?: string;
    menteeId?: string;
    groupId?: string;
    status?: string;
  }): Promise<MentorshipSession[]> => {
    await delay(400);
    let result = [...dummySessions];
    if (filters?.mentorId) {
      result = result.filter((s) => s.mentorId === filters.mentorId);
    }
    if (filters?.menteeId) {
      result = result.filter((s) => s.menteeIds.includes(filters.menteeId!));
    }
    if (filters?.groupId) {
      result = result.filter((s) => s.groupId === filters.groupId);
    }
    if (filters?.status) {
      result = result.filter((s) => s.status === filters.status);
    }
    return result;
  },

  getSession: async (id: string): Promise<MentorshipSession | null> => {
    await delay(200);
    return dummySessions.find((s) => s.id === id) || null;
  },

  createSession: async (
    data: Partial<MentorshipSession>
  ): Promise<MentorshipSession> => {
    await delay(300);
    const mentor = dummyMentors.find((m) => m.id === data.mentorId);
    const mentees = dummyMentees.filter((m) => data.menteeIds?.includes(m.id));

    const newSession: MentorshipSession = {
      id: `session-${Date.now()}`,
      matchId: data.matchId,
      groupId: data.groupId,
      mentorId: data.mentorId || '',
      mentor: mentor!,
      menteeIds: data.menteeIds || [],
      mentees,
      title: data.title || '',
      description: data.description,
      scheduledAt: data.scheduledAt || new Date().toISOString(),
      duration: data.duration || 60,
      meetingLink: data.meetingLink,
      status: 'scheduled',
      agenda: data.agenda,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dummySessions.push(newSession);
    return newSession;
  },

  updateSession: async (
    id: string,
    data: Partial<MentorshipSession>
  ): Promise<MentorshipSession | null> => {
    await delay(300);
    const index = dummySessions.findIndex((s) => s.id === id);
    if (index === -1) return null;
    dummySessions[index] = {
      ...dummySessions[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return dummySessions[index];
  },

  // Goals
  getGoals: async (filters?: {
    menteeId?: string;
    matchId?: string;
  }): Promise<MenteeGoal[]> => {
    await delay(400);
    let result = [...dummyGoals];
    if (filters?.menteeId) {
      result = result.filter((g) => g.menteeId === filters.menteeId);
    }
    if (filters?.matchId) {
      result = result.filter((g) => g.matchId === filters.matchId);
    }
    return result;
  },

  createGoal: async (data: Partial<MenteeGoal>): Promise<MenteeGoal> => {
    await delay(300);
    const newGoal: MenteeGoal = {
      id: `goal-${Date.now()}`,
      menteeId: data.menteeId || '',
      matchId: data.matchId,
      title: data.title || '',
      description: data.description || '',
      targetDate: data.targetDate,
      status: 'not_started',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dummyGoals.push(newGoal);
    return newGoal;
  },

  updateGoal: async (
    id: string,
    data: Partial<MenteeGoal>
  ): Promise<MenteeGoal | null> => {
    await delay(300);
    const index = dummyGoals.findIndex((g) => g.id === id);
    if (index === -1) return null;
    dummyGoals[index] = {
      ...dummyGoals[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return dummyGoals[index];
  },
};

// Add endpoints to the main endpoints object (for future real API integration)
export const mentorshipEndpoints = {
  // Mentors
  getMentors: '/mentorship/mentors',
  getMentor: (id: string) => `/mentorship/mentors/${id}`,
  createMentor: '/mentorship/mentors',
  updateMentor: (id: string) => `/mentorship/mentors/${id}`,
  approveMentor: (id: string) => `/mentorship/mentors/${id}/approve`,

  // Mentees
  getMentees: '/mentorship/mentees',
  getMentee: (id: string) => `/mentorship/mentees/${id}`,

  // Requests
  getRequests: '/mentorship/requests',
  getRequest: (id: string) => `/mentorship/requests/${id}`,
  createRequest: '/mentorship/requests',
  updateRequest: (id: string) => `/mentorship/requests/${id}`,

  // Matches
  getMatches: '/mentorship/matches',
  getMatch: (id: string) => `/mentorship/matches/${id}`,
  createMatch: '/mentorship/matches',
  updateMatch: (id: string) => `/mentorship/matches/${id}`,

  // Groups
  getGroups: '/mentorship/groups',
  getGroup: (id: string) => `/mentorship/groups/${id}`,
  createGroup: '/mentorship/groups',
  updateGroup: (id: string) => `/mentorship/groups/${id}`,

  // Sessions
  getSessions: '/mentorship/sessions',
  getSession: (id: string) => `/mentorship/sessions/${id}`,
  createSession: '/mentorship/sessions',
  updateSession: (id: string) => `/mentorship/sessions/${id}`,

  // Goals
  getGoals: '/mentorship/goals',
  createGoal: '/mentorship/goals',
  updateGoal: (id: string) => `/mentorship/goals/${id}`,

  // Stats
  getStats: '/mentorship/stats',
};
