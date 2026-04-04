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

/** Normalise a value that may arrive as a JSON array, a CSV string, or null/undefined. */
function toArray(val: unknown): string[] {
  if (Array.isArray(val)) return val as string[];
  if (typeof val === 'string' && val.trim()) return val.split(',').map((s) => s.trim());
  return [];
}

// Helper: map a backend User object to the Mentor type used by the frontend
function mapUserToMentor(user: Record<string, unknown>): Mentor {
  return {
    id: user.id as string,
    userId: user.id as string,
    user: {
      id: user.id as string,
      username: user.username as string,
      firstName: user.firstName as string,
      lastName: user.lastName as string,
      email: user.email as string,
      avatar: user.profilePicture as string,
      roleName: (user.role as string) || 'Mentor',
    },
    status:
      (user.status as string)?.toLowerCase() === 'active'
        ? 'active'
        : (user.status as string)?.toLowerCase() === 'registered_not_confirmed'
          ? 'pending_approval'
          : 'inactive',
    bio: (user.mentorBio as string) || '',
    expertise: toArray(user.expertise),
    availability: (user.preferredMeetingFrequency as string) || '',
    maxMentees: (user.maxMentees as number) || 5,
    currentMenteeCount: (user.currentMenteeCount as number) || 0,
    yearsOfExperience: (user.yearsOfExperience as number) || 0,
    totalSessions: 0,
    createdAt: user.createdAt as string,
    updatedAt: user.updatedAt as string,
  };
}

// Helper: map a backend User object to the Mentee type
function mapUserToMentee(user: Record<string, unknown>): Mentee {
  return {
    id: user.id as string,
    userId: user.id as string,
    user: {
      id: user.id as string,
      username: user.username as string,
      firstName: user.firstName as string,
      lastName: user.lastName as string,
      email: user.email as string,
      avatar: user.profilePicture as string,
      roleName: (user.role as string) || 'Student',
    },
    status: 'matched',
    goals: '',
    interests: [],
    preferredMeetingFrequency: '',
    createdAt: user.createdAt as string,
    updatedAt: user.updatedAt as string,
  };
}

// Helper: map backend session to frontend MentorshipSession type
function mapSession(s: Record<string, unknown>): MentorshipSession {
  const mentorData = s.mentor as Record<string, unknown> | undefined;
  const menteesData = (s.mentees as Record<string, unknown>[]) || [];
  const groupData = s.group as Record<string, unknown> | undefined;

  return {
    id: s.id as string,
    groupId: groupData?.id as string | undefined,
    group: groupData ? mapGroupResponse(groupData) : undefined,
    mentorId: mentorData?.id as string || '',
    mentor: mentorData ? mapUserToMentor(mentorData) : ({} as Mentor),
    menteeIds: menteesData.map((m) => m.id as string),
    mentees: menteesData.map(mapUserToMentee) as Mentee[],
    title: s.title as string,
    description: s.description as string | undefined,
    scheduledAt: s.scheduledAt as string,
    duration: s.duration as number,
    meetingLink: s.meetingLink as string | undefined,
    status: ((s.status as string) || 'scheduled').toLowerCase() as MentorshipSession['status'],
    agenda: s.agenda as string | undefined,
    notes: s.notes as string | undefined,
    menteeFeedback: s.menteeFeedback as string | undefined,
    mentorFeedback: s.mentorFeedback as string | undefined,
    rating: s.rating as number | undefined,
    createdAt: s.createdAt as string,
    updatedAt: s.updatedAt as string,
  };
}

// Helper: map backend group to frontend MentorGroup type
function mapGroupResponse(g: Record<string, unknown>): MentorGroup {
  const mentorData = g.mentor as Record<string, unknown> | undefined;
  const membersData = (g.members as Record<string, unknown>[]) || [];

  return {
    id: g.id as string,
    name: g.name as string,
    description: g.description as string,
    mentorId: mentorData?.id as string || '',
    mentor: mentorData ? mapUserToMentor(mentorData) : ({} as Mentor),
    maxMembers: (g.maxMembers as number) || 10,
    currentMemberCount: (g.currentMemberCount as number) || membersData.length,
    members: membersData.map(mapUserToMentee) as Mentee[],
    focus: g.focus as string,
    meetingSchedule: (g.meetingSchedule as string) || '',
    status: ((g.status as string) || 'active').toLowerCase() as MentorGroup['status'],
    createdAt: g.createdAt as string,
    updatedAt: g.updatedAt as string,
  };
}

// API Endpoints — all wired to real backend
export const mentorshipApi = {
  // Stats — computed by backend from real data
  getStats: async (): Promise<MentorshipStats> => {
    try {
      const response = await apiService.get(endpoints.getMentorshipStats);
      return response.data;
    } catch (error) {
      console.error('Error fetching mentorship stats:', error);
      // Return zeros if endpoint not yet deployed
      return {
        totalMentors: 0,
        activeMentors: 0,
        totalMentees: 0,
        pendingRequests: 0,
        activeMatches: 0,
        upcomingSessions: 0,
        totalGroups: 0,
        completedSessions: 0,
      };
    }
  },

  // Mentors — fetches from users API where isMentor is true
  getMentors: async (filters?: {
    status?: string;
    expertise?: string;
  }): Promise<Mentor[]> => {
    try {
      // Try the dedicated mentors endpoint first
      const response = await apiService.get(endpoints.getMentors);
      let result: Mentor[] = (response.data || []).map(
        (user: Record<string, unknown>) => mapUserToMentor(user)
      );

      if (filters?.status) {
        result = result.filter((m) => m.status === filters.status);
      }
      if (filters?.expertise) {
        result = result.filter((m) =>
          m.expertise.some((e) =>
            e.toLowerCase().includes(filters.expertise!.toLowerCase())
          )
        );
      }

      return result;
    } catch {
      // Fallback: fetch from users API
      try {
        const response = await apiService.getWithParams(endpoints.getAllUsers, {
          pageSize: 100,
        });

        const mentorUsers = (response.data?.data || []).filter(
          (user: Record<string, unknown>) =>
            user.isMentor === true || user.role === 'Mentor'
        );

        return mentorUsers.map((user: Record<string, unknown>) =>
          mapUserToMentor(user)
        );
      } catch (error) {
        console.error('Error fetching mentors:', error);
        throw error;
      }
    }
  },

  getMentor: async (id: string): Promise<Mentor | null> => {
    try {
      // Get specific user and check if they're a mentor
      const response = await apiService.get(`/users/${id}`);
      const user = response.data;
      if (user?.isMentor || user?.role === 'Mentor') {
        return mapUserToMentor(user);
      }
      return null;
    } catch (error) {
      console.error('Error fetching mentor:', error);
      return null;
    }
  },

  createMentor: async (data: Partial<Mentor>): Promise<Mentor> => {
    // Not a separate entity — mentors are users with isMentor=true
    // This would update a user to be a mentor
    throw new Error('Use user management to set isMentor=true on a user');
  },

  updateMentor: async (
    id: string,
    data: Partial<Mentor>
  ): Promise<Mentor | null> => {
    throw new Error('Use user management to update mentor profile fields');
  },

  approveMentor: async (id: string): Promise<Mentor | null> => {
    throw new Error('Use user management to approve mentor');
  },

  // Mentees — derived from mentee requests
  getMentees: async (filters?: { status?: string }): Promise<Mentee[]> => {
    try {
      // Get mentees from mentee requests — each unique mentee user
      const response = await apiService.get(endpoints.getAllMenteeRequests);
      const requests = response.data as Record<string, unknown>[];
      const menteeMap = new Map<string, Mentee>();

      for (const req of requests) {
        const menteeUser = req.mentee as Record<string, unknown> | undefined;
        if (menteeUser && !menteeMap.has(menteeUser.id as string)) {
          const mentee = mapUserToMentee(menteeUser);
          // Derive status from request status
          const reqStatus = req.status as string;
          if (reqStatus === 'APPROVED' && req.assignedMentor) {
            mentee.status = 'matched';
            mentee.currentMentorId = (req.assignedMentor as Record<string, unknown>).id as string;
          } else {
            mentee.status = 'seeking_mentor';
          }
          mentee.goals = (req.goals as string) || '';
          mentee.interests = (req.requestedExpertise as string[]) || [];
          mentee.preferredMeetingFrequency = (req.preferredMeetingFrequency as string) || '';
          menteeMap.set(menteeUser.id as string, mentee);
        }
      }

      let result = Array.from(menteeMap.values());
      if (filters?.status) {
        result = result.filter((m) => m.status === filters.status);
      }
      return result;
    } catch (error) {
      console.error('Error fetching mentees:', error);
      return [];
    }
  },

  getMentee: async (id: string): Promise<Mentee | null> => {
    try {
      const response = await apiService.get(`/users/${id}`);
      return mapUserToMentee(response.data);
    } catch (error) {
      console.error('Error fetching mentee:', error);
      return null;
    }
  },

  // Requests — already using real API
  getRequests: async (filters?: {
    status?: string;
  }): Promise<MenteeRequest[]> => {
    try {
      const response = await apiService.getWithParams(
        endpoints.getAllMenteeRequests,
        filters
      );
      const raw: Record<string, unknown>[] = response.data || [];
      return raw.map((r) => ({ ...r, requestedExpertise: toArray(r.requestedExpertise) } as MenteeRequest));
    } catch (error) {
      console.error('Error fetching mentee requests:', error);
      throw error;
    }
  },

  getRequest: async (id: string): Promise<MenteeRequest | null> => {
    try {
      const response = await apiService.get(endpoints.getMenteeRequestById(id));
      const r = response.data as Record<string, unknown>;
      return { ...r, requestedExpertise: toArray(r?.requestedExpertise) } as MenteeRequest;
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
      const response = await apiService.patch(
        `${endpoints.updateMenteeRequestStatus(id)}?status=${status}`
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
      const response = await apiService.patch(
        endpoints.assignMentorToRequest(id, mentorId)
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

  // Matches — derived from approved mentee requests with assigned mentors
  getMatches: async (filters?: {
    status?: string;
    mentorId?: string;
    menteeId?: string;
  }): Promise<MentorshipMatch[]> => {
    try {
      const response = await apiService.get(endpoints.getAllMenteeRequests);
      const requests = response.data as Record<string, unknown>[];

      // Active matches = approved requests with an assigned mentor
      let matches: MentorshipMatch[] = requests
        .filter(
          (r) =>
            r.status === 'APPROVED' && r.assignedMentor != null
        )
        .map((r) => {
          const mentorUser = r.assignedMentor as Record<string, unknown>;
          const menteeUser = r.mentee as Record<string, unknown>;
          return {
            id: r.id as string,
            mentorId: mentorUser?.id as string,
            mentor: mapUserToMentor(mentorUser || {}),
            menteeId: menteeUser?.id as string,
            mentee: mapUserToMentee(menteeUser || {}) as Mentee,
            status: 'active' as const,
            matchedBy: (r.reviewedBy as Record<string, unknown>)?.id as string || '',
            matchedAt: (r.reviewedAt as string) || (r.createdAt as string),
            goals: (r.goals as string) || '',
            meetingFrequency: (r.preferredMeetingFrequency as string) || '',
            totalSessions: 0,
            completedSessions: 0,
            createdAt: r.createdAt as string,
            updatedAt: r.createdAt as string,
          };
        });

      if (filters?.status) {
        matches = matches.filter((m) => m.status === filters.status);
      }
      if (filters?.mentorId) {
        matches = matches.filter((m) => m.mentorId === filters.mentorId);
      }
      if (filters?.menteeId) {
        matches = matches.filter((m) => m.menteeId === filters.menteeId);
      }
      return matches;
    } catch (error) {
      console.error('Error fetching matches:', error);
      return [];
    }
  },

  getMatch: async (id: string): Promise<MentorshipMatch | null> => {
    // A "match" is an approved mentee request
    try {
      const response = await apiService.get(endpoints.getMenteeRequestById(id));
      const r = response.data as Record<string, unknown>;
      if (r.status !== 'APPROVED' || !r.assignedMentor) return null;
      const mentorUser = r.assignedMentor as Record<string, unknown>;
      const menteeUser = r.mentee as Record<string, unknown>;
      return {
        id: r.id as string,
        mentorId: mentorUser?.id as string,
        mentor: mapUserToMentor(mentorUser || {}),
        menteeId: menteeUser?.id as string,
        mentee: mapUserToMentee(menteeUser || {}) as Mentee,
        status: 'active',
        matchedBy: '',
        matchedAt: (r.reviewedAt as string) || (r.createdAt as string),
        goals: (r.goals as string) || '',
        meetingFrequency: (r.preferredMeetingFrequency as string) || '',
        totalSessions: 0,
        completedSessions: 0,
        createdAt: r.createdAt as string,
        updatedAt: r.createdAt as string,
      };
    } catch (error) {
      console.error('Error fetching match:', error);
      return null;
    }
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
    // Matches are derived from requests — update the underlying request
    console.warn('updateMatch: matches are derived from mentee requests');
    return null;
  },

  // Groups — real API
  getGroups: async (filters?: {
    mentorId?: string;
    status?: string;
  }): Promise<MentorGroup[]> => {
    try {
      let url = endpoints.getAllMentorGroups;
      if (filters?.status === 'active') {
        url = endpoints.getActiveMentorGroups;
      }
      const response = await apiService.get(url);
      let result: MentorGroup[] = (response.data || []).map(
        (g: Record<string, unknown>) => mapGroupResponse(g)
      );

      if (filters?.mentorId) {
        result = result.filter((g) => g.mentorId === filters.mentorId);
      }
      if (filters?.status && filters.status !== 'active') {
        result = result.filter((g) => g.status === filters.status);
      }
      return result;
    } catch (error) {
      console.error('Error fetching groups:', error);
      return [];
    }
  },

  getGroup: async (id: string): Promise<MentorGroup | null> => {
    try {
      const response = await apiService.get(endpoints.getMentorGroupById(id));
      return mapGroupResponse(response.data);
    } catch (error) {
      console.error('Error fetching group:', error);
      return null;
    }
  },

  createGroup: async (data: Partial<MentorGroup>): Promise<MentorGroup> => {
    try {
      const response = await apiService.post(endpoints.createMentorGroup, {
        name: data.name,
        description: data.description,
        focus: data.focus,
        maxMembers: data.maxMembers || 10,
        meetingSchedule: data.meetingSchedule,
      });
      return mapGroupResponse(response.data);
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  },

  updateGroup: async (
    id: string,
    data: Partial<MentorGroup>
  ): Promise<MentorGroup | null> => {
    try {
      const response = await apiService.put(endpoints.updateMentorGroup(id), {
        name: data.name,
        description: data.description,
        focus: data.focus,
        maxMembers: data.maxMembers,
        meetingSchedule: data.meetingSchedule,
      });
      return mapGroupResponse(response.data);
    } catch (error) {
      console.error('Error updating group:', error);
      return null;
    }
  },

  addGroupMember: async (groupId: string, userId: string): Promise<MentorGroup> => {
    try {
      const response = await apiService.post(
        endpoints.addMentorGroupMember(groupId, userId),
        {}
      );
      return mapGroupResponse(response.data);
    } catch (error) {
      console.error('Error adding group member:', error);
      throw error;
    }
  },

  removeGroupMember: async (groupId: string, userId: string): Promise<MentorGroup> => {
    try {
      const response = await apiService.delete(
        endpoints.removeMentorGroupMember(groupId, userId)
      );
      return mapGroupResponse(response.data);
    } catch (error) {
      console.error('Error removing group member:', error);
      throw error;
    }
  },

  // Sessions — real API
  getSessions: async (filters?: {
    mentorId?: string;
    menteeId?: string;
    groupId?: string;
    status?: string;
  }): Promise<MentorshipSession[]> => {
    try {
      let url = endpoints.getAllMentorshipSessions;
      if (filters?.groupId) {
        url = endpoints.getMentorshipSessionsByGroup(filters.groupId);
      }
      const response = await apiService.get(url);
      let result: MentorshipSession[] = (response.data || []).map(
        (s: Record<string, unknown>) => mapSession(s)
      );

      if (filters?.mentorId) {
        result = result.filter((s) => s.mentorId === filters.mentorId);
      }
      if (filters?.menteeId) {
        result = result.filter((s) => s.menteeIds.includes(filters.menteeId!));
      }
      if (filters?.status) {
        result = result.filter((s) => s.status === filters.status);
      }
      return result;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }
  },

  getSession: async (id: string): Promise<MentorshipSession | null> => {
    try {
      const response = await apiService.get(
        endpoints.getMentorshipSessionById(id)
      );
      return mapSession(response.data);
    } catch (error) {
      console.error('Error fetching session:', error);
      return null;
    }
  },

  createSession: async (
    data: Partial<MentorshipSession>
  ): Promise<MentorshipSession> => {
    try {
      const response = await apiService.post(
        endpoints.createMentorshipSession,
        {
          title: data.title,
          description: data.description,
          scheduledAt: data.scheduledAt,
          duration: data.duration || 60,
          meetingLink: data.meetingLink,
          agenda: data.agenda,
          groupId: data.groupId,
          menteeIds: data.menteeIds,
        }
      );
      return mapSession(response.data);
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  updateSession: async (
    id: string,
    data: Partial<MentorshipSession>
  ): Promise<MentorshipSession | null> => {
    try {
      const response = await apiService.put(
        endpoints.updateMentorshipSession(id),
        {
          title: data.title,
          description: data.description,
          scheduledAt: data.scheduledAt,
          duration: data.duration,
          meetingLink: data.meetingLink,
          agenda: data.agenda,
          notes: data.notes,
          mentorFeedback: data.mentorFeedback,
          menteeFeedback: data.menteeFeedback,
          rating: data.rating,
        }
      );
      return mapSession(response.data);
    } catch (error) {
      console.error('Error updating session:', error);
      return null;
    }
  },

  // Goals — no backend entity yet, return empty for now
  getGoals: async (filters?: {
    menteeId?: string;
    matchId?: string;
  }): Promise<MenteeGoal[]> => {
    // TODO: Create MenteeGoal entity in backend when needed
    return [];
  },

  createGoal: async (data: Partial<MenteeGoal>): Promise<MenteeGoal> => {
    throw new Error('MenteeGoal backend not yet implemented');
  },

  updateGoal: async (
    id: string,
    data: Partial<MenteeGoal>
  ): Promise<MenteeGoal | null> => {
    throw new Error('MenteeGoal backend not yet implemented');
  },
};
