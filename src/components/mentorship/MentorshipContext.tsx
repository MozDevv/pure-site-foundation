import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from 'react';
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
import { mentorshipApi } from '@/lib/mentorship-api';
import { useToast } from '@/hooks/use-toast';

interface MentorshipContextType {
  // Data
  mentors: Mentor[];
  mentees: Mentee[];
  requests: MenteeRequest[];
  matches: MentorshipMatch[];
  groups: MentorGroup[];
  sessions: MentorshipSession[];
  goals: MenteeGoal[];
  stats: MentorshipStats | null;

  // Loading states
  loading: boolean;

  // Fetch methods
  fetchMentors: (filters?: {
    status?: string;
    expertise?: string;
  }) => Promise<void>;
  fetchMentees: (filters?: { status?: string }) => Promise<void>;
  fetchRequests: (filters?: { status?: string }) => Promise<void>;
  fetchMatches: (filters?: {
    status?: string;
    mentorId?: string;
    menteeId?: string;
  }) => Promise<void>;
  fetchGroups: (filters?: {
    mentorId?: string;
    status?: string;
  }) => Promise<void>;
  fetchSessions: (filters?: {
    mentorId?: string;
    menteeId?: string;
    groupId?: string;
    status?: string;
  }) => Promise<void>;
  fetchGoals: (filters?: {
    menteeId?: string;
    matchId?: string;
  }) => Promise<void>;
  fetchStats: () => Promise<void>;

  // CRUD methods
  createMentor: (data: Partial<Mentor>) => Promise<Mentor | null>;
  updateMentor: (id: string, data: Partial<Mentor>) => Promise<Mentor | null>;
  approveMentor: (id: string) => Promise<Mentor | null>;

  createRequest: (
    data: Partial<MenteeRequest>
  ) => Promise<MenteeRequest | null>;
  updateRequest: (
    id: string,
    data: Partial<MenteeRequest>
  ) => Promise<MenteeRequest | null>;

  createMatch: (data: {
    mentorId: string;
    menteeId: string;
    requestId?: string;
    groupId?: string;
    goals: string;
    meetingFrequency: string;
  }) => Promise<MentorshipMatch | null>;
  updateMatch: (
    id: string,
    data: Partial<MentorshipMatch>
  ) => Promise<MentorshipMatch | null>;

  createGroup: (data: Partial<MentorGroup>) => Promise<MentorGroup | null>;
  updateGroup: (
    id: string,
    data: Partial<MentorGroup>
  ) => Promise<MentorGroup | null>;

  createSession: (
    data: Partial<MentorshipSession>
  ) => Promise<MentorshipSession | null>;
  updateSession: (
    id: string,
    data: Partial<MentorshipSession>
  ) => Promise<MentorshipSession | null>;

  createGoal: (data: Partial<MenteeGoal>) => Promise<MenteeGoal | null>;
  updateGoal: (
    id: string,
    data: Partial<MenteeGoal>
  ) => Promise<MenteeGoal | null>;
}

const MentorshipContext = createContext<MentorshipContextType | undefined>(
  undefined
);

export function MentorshipProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [requests, setRequests] = useState<MenteeRequest[]>([]);
  const [matches, setMatches] = useState<MentorshipMatch[]>([]);
  const [groups, setGroups] = useState<MentorGroup[]>([]);
  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [goals, setGoals] = useState<MenteeGoal[]>([]);
  const [stats, setStats] = useState<MentorshipStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch methods
  const fetchMentors = useCallback(
    async (filters?: { status?: string; expertise?: string }) => {
      try {
        setLoading(true);
        const data = await mentorshipApi.getMentors(filters);
        console.log('Fetched mentors:', data);
        setMentors(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch mentors',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const fetchMentees = useCallback(
    async (filters?: { status?: string }) => {
      try {
        setLoading(true);
        const data = await mentorshipApi.getMentees(filters);
        setMentees(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch mentees',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const fetchRequests = useCallback(
    async (filters?: { status?: string }) => {
      try {
        setLoading(true);
        const data = await mentorshipApi.getRequests(filters);
        setRequests(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch requests',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const fetchMatches = useCallback(
    async (filters?: {
      status?: string;
      mentorId?: string;
      menteeId?: string;
    }) => {
      try {
        setLoading(true);
        const data = await mentorshipApi.getMatches(filters);
        setMatches(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch matches',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const fetchGroups = useCallback(
    async (filters?: { mentorId?: string; status?: string }) => {
      try {
        setLoading(true);
        const data = await mentorshipApi.getGroups(filters);
        setGroups(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch groups',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const fetchSessions = useCallback(
    async (filters?: {
      mentorId?: string;
      menteeId?: string;
      groupId?: string;
      status?: string;
    }) => {
      try {
        setLoading(true);
        const data = await mentorshipApi.getSessions(filters);
        setSessions(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch sessions',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const fetchGoals = useCallback(
    async (filters?: { menteeId?: string; matchId?: string }) => {
      try {
        setLoading(true);
        const data = await mentorshipApi.getGoals(filters);
        setGoals(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch goals',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const fetchStats = useCallback(async () => {
    try {
      const data = await mentorshipApi.getStats();
      setStats(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch stats',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // CRUD methods
  const createMentor = useCallback(
    async (data: Partial<Mentor>) => {
      try {
        const result = await mentorshipApi.createMentor(data);
        setMentors((prev) => [...prev, result]);
        toast({ title: 'Success', description: 'Mentor profile created' });
        return result;
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to create mentor',
          variant: 'destructive',
        });
        return null;
      }
    },
    [toast]
  );

  const updateMentor = useCallback(
    async (id: string, data: Partial<Mentor>) => {
      try {
        const result = await mentorshipApi.updateMentor(id, data);
        if (result) {
          setMentors((prev) => prev.map((m) => (m.id === id ? result : m)));
          toast({ title: 'Success', description: 'Mentor updated' });
        }
        return result;
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to update mentor',
          variant: 'destructive',
        });
        return null;
      }
    },
    [toast]
  );

  const approveMentor = useCallback(
    async (id: string) => {
      try {
        const result = await mentorshipApi.approveMentor(id);
        if (result) {
          setMentors((prev) => prev.map((m) => (m.id === id ? result : m)));
          toast({ title: 'Success', description: 'Mentor approved' });
        }
        return result;
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to approve mentor',
          variant: 'destructive',
        });
        return null;
      }
    },
    [toast]
  );

  const createRequest = useCallback(
    async (data: Partial<MenteeRequest>) => {
      try {
        const result = await mentorshipApi.createRequest(data);
        setRequests((prev) => [...prev, result]);
        toast({ title: 'Success', description: 'Mentor request submitted' });
        return result;
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to submit request',
          variant: 'destructive',
        });
        return null;
      }
    },
    [toast]
  );

  const updateRequest = useCallback(
    async (id: string, data: Partial<MenteeRequest>) => {
      try {
        const result = await mentorshipApi.updateRequest(id, data);
        if (result) {
          setRequests((prev) => prev.map((r) => (r.id === id ? result : r)));
          toast({ title: 'Success', description: 'Request updated' });
        }
        return result;
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to update request',
          variant: 'destructive',
        });
        return null;
      }
    },
    [toast]
  );

  const createMatch = useCallback(
    async (data: {
      mentorId: string;
      menteeId: string;
      requestId?: string;
      groupId?: string;
      goals: string;
      meetingFrequency: string;
    }) => {
      try {
        const result = await mentorshipApi.createMatch(data);
        setMatches((prev) => [...prev, result]);
        // Update requests list if a request was matched
        if (data.requestId) {
          await fetchRequests();
        }
        toast({ title: 'Success', description: 'Match created successfully' });
        return result;
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to create match',
          variant: 'destructive',
        });
        return null;
      }
    },
    [toast, fetchRequests]
  );

  const updateMatch = useCallback(
    async (id: string, data: Partial<MentorshipMatch>) => {
      try {
        const result = await mentorshipApi.updateMatch(id, data);
        if (result) {
          setMatches((prev) => prev.map((m) => (m.id === id ? result : m)));
          toast({ title: 'Success', description: 'Match updated' });
        }
        return result;
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to update match',
          variant: 'destructive',
        });
        return null;
      }
    },
    [toast]
  );

  const createGroup = useCallback(
    async (data: Partial<MentorGroup>) => {
      try {
        const result = await mentorshipApi.createGroup(data);
        setGroups((prev) => [...prev, result]);
        toast({ title: 'Success', description: 'Group created' });
        return result;
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to create group',
          variant: 'destructive',
        });
        return null;
      }
    },
    [toast]
  );

  const updateGroup = useCallback(
    async (id: string, data: Partial<MentorGroup>) => {
      try {
        const result = await mentorshipApi.updateGroup(id, data);
        if (result) {
          setGroups((prev) => prev.map((g) => (g.id === id ? result : g)));
          toast({ title: 'Success', description: 'Group updated' });
        }
        return result;
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to update group',
          variant: 'destructive',
        });
        return null;
      }
    },
    [toast]
  );

  const createSession = useCallback(
    async (data: Partial<MentorshipSession>) => {
      try {
        const result = await mentorshipApi.createSession(data);
        setSessions((prev) => [...prev, result]);
        toast({ title: 'Success', description: 'Session scheduled' });
        return result;
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to schedule session',
          variant: 'destructive',
        });
        return null;
      }
    },
    [toast]
  );

  const updateSession = useCallback(
    async (id: string, data: Partial<MentorshipSession>) => {
      try {
        const result = await mentorshipApi.updateSession(id, data);
        if (result) {
          setSessions((prev) => prev.map((s) => (s.id === id ? result : s)));
          toast({ title: 'Success', description: 'Session updated' });
        }
        return result;
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to update session',
          variant: 'destructive',
        });
        return null;
      }
    },
    [toast]
  );

  const createGoal = useCallback(
    async (data: Partial<MenteeGoal>) => {
      try {
        const result = await mentorshipApi.createGoal(data);
        setGoals((prev) => [...prev, result]);
        toast({ title: 'Success', description: 'Goal created' });
        return result;
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to create goal',
          variant: 'destructive',
        });
        return null;
      }
    },
    [toast]
  );

  const updateGoal = useCallback(
    async (id: string, data: Partial<MenteeGoal>) => {
      try {
        const result = await mentorshipApi.updateGoal(id, data);
        if (result) {
          setGoals((prev) => prev.map((g) => (g.id === id ? result : g)));
          toast({ title: 'Success', description: 'Goal updated' });
        }
        return result;
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to update goal',
          variant: 'destructive',
        });
        return null;
      }
    },
    [toast]
  );

  // Stats are fetched on-demand by individual pages, not on context mount
  // This avoids unnecessary API calls on every route change

  return (
    <MentorshipContext.Provider
      value={{
        mentors,
        mentees,
        requests,
        matches,
        groups,
        sessions,
        goals,
        stats,
        loading,
        fetchMentors,
        fetchMentees,
        fetchRequests,
        fetchMatches,
        fetchGroups,
        fetchSessions,
        fetchGoals,
        fetchStats,
        createMentor,
        updateMentor,
        approveMentor,
        createRequest,
        updateRequest,
        createMatch,
        updateMatch,
        createGroup,
        updateGroup,
        createSession,
        updateSession,
        createGoal,
        updateGoal,
      }}
    >
      {children}
    </MentorshipContext.Provider>
  );
}

export function useMentorship() {
  const context = useContext(MentorshipContext);
  if (!context) {
    throw new Error('useMentorship must be used within MentorshipProvider');
  }
  return context;
}
