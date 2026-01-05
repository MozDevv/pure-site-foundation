// Mentorship Module Type Definitions

// Enums
export type MentorStatus = 'active' | 'inactive' | 'pending_approval' | 'on_leave';
export type MenteeStatus = 'seeking_mentor' | 'matched' | 'inactive';
export type MatchStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'matched';

// Base User for Mentorship
export interface MentorshipUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  roleName: 'Mentor' | 'Tutor' | 'Student' | 'Admin';
}

// Mentor Profile
export interface Mentor {
  id: string;
  userId: string;
  user: MentorshipUser;
  status: MentorStatus;
  bio: string;
  expertise: string[];
  availability: string; // e.g., "Weekdays 9-5", "Flexible"
  maxMentees: number;
  currentMenteeCount: number;
  yearsOfExperience: number;
  linkedinUrl?: string;
  calendlyUrl?: string;
  rating?: number;
  totalSessions: number;
  createdAt: string;
  updatedAt: string;
}

// Mentee (Student seeking mentorship)
export interface Mentee {
  id: string;
  userId: string;
  user: MentorshipUser;
  status: MenteeStatus;
  goals: string;
  interests: string[];
  preferredMeetingFrequency: string; // e.g., "Weekly", "Bi-weekly"
  currentMentorId?: string;
  createdAt: string;
  updatedAt: string;
}

// Mentee Request for a Mentor
export interface MenteeRequest {
  id: string;
  menteeId: string;
  mentee: Mentee;
  requestedExpertise: string[];
  goals: string;
  preferredMeetingFrequency: string;
  additionalNotes?: string;
  status: RequestStatus;
  assignedMentorId?: string;
  assignedMentor?: Mentor;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Mentorship Match (pairing of mentor and mentee)
export interface MentorshipMatch {
  id: string;
  mentorId: string;
  mentor: Mentor;
  menteeId: string;
  mentee: Mentee;
  groupId?: string;
  group?: MentorGroup;
  status: MatchStatus;
  matchedBy: string; // Admin who made the match
  matchedAt: string;
  goals: string;
  meetingFrequency: string;
  nextSessionDate?: string;
  totalSessions: number;
  completedSessions: number;
  notes?: string;
  endedAt?: string;
  endReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Mentor Group (for group mentorship)
export interface MentorGroup {
  id: string;
  name: string;
  description: string;
  mentorId: string;
  mentor: Mentor;
  maxMembers: number;
  currentMemberCount: number;
  members: Mentee[];
  focus: string; // e.g., "Career Development", "Technical Skills"
  meetingSchedule: string;
  status: 'active' | 'inactive' | 'full';
  createdAt: string;
  updatedAt: string;
}

// Mentorship Session
export interface MentorshipSession {
  id: string;
  matchId?: string;
  match?: MentorshipMatch;
  groupId?: string;
  group?: MentorGroup;
  mentorId: string;
  mentor: Mentor;
  menteeIds: string[];
  mentees: Mentee[];
  title: string;
  description?: string;
  scheduledAt: string;
  duration: number; // in minutes
  meetingLink?: string;
  status: SessionStatus;
  agenda?: string;
  notes?: string;
  menteeFeedback?: string;
  mentorFeedback?: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

// Goal tracking for mentees
export interface MenteeGoal {
  id: string;
  menteeId: string;
  matchId?: string;
  title: string;
  description: string;
  targetDate?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  progress: number; // 0-100
  mentorNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Dashboard Statistics
export interface MentorshipStats {
  totalMentors: number;
  activeMentors: number;
  totalMentees: number;
  pendingRequests: number;
  activeMatches: number;
  upcomingSessions: number;
  totalGroups: number;
  completedSessions: number;
}
