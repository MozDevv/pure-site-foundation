/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import {
  Calendar,
  Plus,
  Video,
  Users,
  Edit,
  Share,
  Copy,
  Clock,
  MapPin,
  Search,
  CalendarDays,
  UserPlus,
  Settings,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Save,
  Download,
  Tag,
  Globe,
  Building,
  Loader2,
  Link2Off,
  ArrowRight,
  Bell,
  StickyNote,
  CheckCircle2,
  AlertTriangle,
  Palette,
  BookOpen,
  Target,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Check } from 'lucide-react';

import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  SmartDrawer,
  SmartDrawerContent,
  SmartDrawerHeader,
  SmartDrawerTitle,
  SmartDrawerTrigger,
} from '@/components/ui/smart-drawer';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { apiService, endpoints } from '@/lib/api';

import './shadcn-big-calendar.css';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserAvatar } from '@/components/ProjectMembers';
import { Backdrop, CircularProgress, Drawer } from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const localizer = momentLocalizer(moment);

// Event type colors for calendar display
const EVENT_TYPE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  MEETING: { bg: '#3b82f6', text: '#ffffff', label: 'Meeting' },
  CLASS: { bg: '#8b5cf6', text: '#ffffff', label: 'Class' },
  PERSONAL: { bg: '#10b981', text: '#ffffff', label: 'Personal' },
  EXAM: { bg: '#ef4444', text: '#ffffff', label: 'Exam' },
  DEADLINE: { bg: '#f97316', text: '#ffffff', label: 'Deadline' },
  REMINDER: { bg: '#eab308', text: '#000000', label: 'Reminder' },
  STUDY_SESSION: { bg: '#06b6d4', text: '#ffffff', label: 'Study Session' },
};

const VENUE_TYPES = [
  { value: 'ONLINE', label: 'Online', icon: Globe },
  { value: 'PHYSICAL', label: 'Physical', icon: Building },
  { value: 'HYBRID', label: 'Hybrid', icon: Users },
];

const REMINDER_OPTIONS = [
  { value: 5, label: '5 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 120, label: '2 hours before' },
  { value: 1440, label: '1 day before' },
  { value: 10080, label: '1 week before' },
];

const NOTE_COLORS = ['#3b82f6', '#10b981', '#f97316', '#ef4444', '#8b5cf6', '#eab308', '#06b6d4', '#ec4899'];

const AUTHORIZATION_URI = import.meta.env
  .VITE_GOOGLE_CALENDER_AUTHORIZATION_URI;

const params = new URLSearchParams({
  client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/timetable`,
  response_type: 'code',
  scope: [
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/calendar.events',
  ].join(' '),
  access_type: 'offline',
  prompt: 'consent',
});

const handleConnectGoogleCalendar = () => {
  window.location.href = `${
    import.meta.env.VITE_GOOGLE_CALENDAR_AUTHORIZATION_URI
  }?${params.toString()}`;
};

const fetchEvents = async () => {
  try {
    const response = await apiService.get(endpoints.getUserEvents);
    const data = await response.data;

    // Transform API data to calendar format
    return (Array.isArray(data) ? data : []).map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      start: new Date(event.startTime),
      end: new Date(event.endTime),
      meetLink: event.meetLink,
      location: event.location || (event.isOnlineEvent ? 'Online' : ''),
      attendees: event.attendeesObj || [],
      creatorId: event.ownerId,
      tags: event.isTeamEvent ? ['team'] : ['personal'],
      hasMeetLink: event.hasMeetLink,
      teamId: event.teamId,
      courseName: event.courseName,
      guests: event.guests || [],
      hostLink: event.hostLink,
      eventType: event.eventType || 'MEETING',
      venueType: event.venueType || 'ONLINE',
      status: event.status || 'UPCOMING',
      color: event.color,
      agenda: event.agenda,
      isAllDay: event.isAllDay,
    }));
  } catch (error) {
    if (
      error?.response?.data?.error === 'invalid_grant' ||
      error?.response?.data?.error_description?.includes(
        'Token has been expired or revoked'
      )
    ) {
      handleConnectGoogleCalendar();
    }
  }
};

const Meetings = () => {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null;
  const userRole = (user?.role || 'Student').toLowerCase();
  const isStudent = userRole === 'student';
  const currentUserId = user?.id || '';

  const [activeTab, setActiveTab] = useState('my-meetings');
  const [calendarView, setCalendarView] = useState('month');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [createEventModalOpen, setCreateEventModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const { toast } = useToast();
  const [primaryEmail, setPrimaryEmail] = useState<string | null>(null);
  const [guests, setGuests] = useState([]);
  const [guestDialogOpen, setGuestDialogOpen] = useState(false);
  const [guestForm, setGuestForm] = useState({ name: '', email: '', role: '' });
  const [editingGuestIndex, setEditingGuestIndex] = useState(null);

  // Calendar Notes state
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedNoteDate, setSelectedNoteDate] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState('#3b82f6');
  const [noteType, setNoteType] = useState('NOTE');
  const [calendarNotes, setCalendarNotes] = useState([]);

  // Event form new fields
  const [eventType, setEventType] = useState('MEETING');
  const [venueType, setVenueType] = useState('ONLINE');
  const [eventColor, setEventColor] = useState('');
  const [eventAgenda, setEventAgenda] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [reminders, setReminders] = useState<{ minutesBefore: number; type: string }[]>([]);

  // RSVP state
  const [myRsvpStatus, setMyRsvpStatus] = useState<string | null>(null);
  const [rsvpCounts, setRsvpCounts] = useState({ accepted: 0, declined: 0, tentative: 0, pending: 0 });

  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () =>
      apiService.get(endpoints.getAllCourses).then((res) => res.data),
  });

  const { data: usersDataRaw, isLoading: usersLoading } = useQuery({
    queryKey: ['users-all-meetings'],
    queryFn: () =>
      apiService.get(endpoints.getAllUsers).then((res) => res.data.data),
  });
  const usersData: any[] = Array.isArray(usersDataRaw) ? usersDataRaw : (usersDataRaw as any)?.data ?? [];
  const navigate = useNavigate();
  const [eventLoading, setEventLoading] = useState(false);

  const createEvent = async (eventData) => {
    setEventLoading(true);
    try {
      const response = await apiService.post(endpoints.createEvent, eventData);
      return response.data;
    } catch (error) {
      console.log(error);
    } finally {
      setEventLoading(false);
    }
  };
  const fetchIntegrationDetails = async () => {
    try {
      const response = await apiService.get(endpoints.getIntegrationDetails);

      setGoogleConnected(response.data.connected);
      setPrimaryEmail(response.data.connectedEmail);
    } catch (error) {
      console.log('Error fetching integration details:', error);
    }
  };
  useEffect(() => {
    fetchIntegrationDetails();
  }, []);

  // API state
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const code = params.get('code');

  useEffect(() => {
    async function activateAccount() {
      if (code) {
        await apiService
          .post(endpoints.googleCalendarCallback(code))
          .then(() => {
            toast({
              title: 'Google Calendar connected!',
              description: 'Your calendar is now synced',
            });
            navigate('/timetable');
          })
          .catch(() => {
            setLoading(false);
            toast({
              title: 'Error connecting Google Calendar',
              description: 'Please try again.',
            });
          });
      } else {
        setLoading(false);
      }
    }
    activateAccount();
  }, [code, navigate]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteNoteDialogOpen, setDeleteNoteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [meetLinkFilter, setMeetLinkFilter] = useState('all');
  const [creatorFilter, setCreatorFilter] = useState('all');

  const currentTeam = {
    id: '', // Dynamic - no longer hardcoded to one team
    name: 'All Teams',
  };

  // const { integrations } = useIntegrations();
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState({
    frequency: 'WEEKLY',
    interval: 1,
    byDay: [],
    until: '',
  });

  // --- In handleSubmit ---
  const eventData = {
    // ...other fields
    recurrence: isRecurring ? recurrence : undefined,
  };

  // Fetch events on component mount
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const eventsData = await fetchEvents();
      setEvents(eventsData || []);
    } catch (err) {
      setError(err.message);
      toast({
        title: 'Error loading events',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load calendar notes
  const loadCalendarNotes = async () => {
    try {
      const response = await apiService.get(endpoints.getCalendarNotes);
      setCalendarNotes(response.data || []);
    } catch (err) {
      console.log('Error loading calendar notes:', err);
    }
  };

  useEffect(() => {
    loadCalendarNotes();
  }, []);

  const handleCreateNote = async () => {
    try {
      await apiService.post(endpoints.createCalendarNote, {
        noteDate: selectedNoteDate,
        title: noteTitle,
        content: noteContent,
        color: noteColor,
        noteType: noteType,
      });
      toast({ title: 'Note created!', description: 'Your calendar note has been saved' });
      setNoteDialogOpen(false);
      setNoteTitle('');
      setNoteContent('');
      setNoteColor('#3b82f6');
      setNoteType('NOTE');
      loadCalendarNotes();
    } catch (err) {
      toast({ title: 'Error creating note', description: err.message, variant: 'destructive' });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await apiService.delete(endpoints.deleteCalendarNote(noteId));
      toast({ title: 'Note deleted' });
      loadCalendarNotes();
    } catch (err) {
      toast({ title: 'Error deleting note', variant: 'destructive' });
    }
  };

  const handleToggleNote = async (noteId: string) => {
    try {
      await apiService.put(endpoints.toggleCalendarNote(noteId), {});
      loadCalendarNotes();
    } catch (err) {
      console.log('Error toggling note:', err);
    }
  };

  // RSVP functions
  const loadRsvpStatus = async (eventId: string) => {
    try {
      const [rsvpRes, countsRes] = await Promise.all([
        apiService.get(endpoints.getMyRsvp(eventId)),
        apiService.get(endpoints.getRsvpCounts(eventId)),
      ]);
      setMyRsvpStatus(rsvpRes.data?.status || null);
      setRsvpCounts(countsRes.data);
    } catch (err) {
      console.log('Error loading RSVP:', err);
    }
  };

  const handleRsvpResponse = async (eventId: string, status: string) => {
    try {
      await apiService.post(endpoints.respondToRsvp(eventId), { status });
      setMyRsvpStatus(status);
      toast({ title: `RSVP updated to ${status.toLowerCase()}` });
      loadRsvpStatus(eventId);
    } catch (err) {
      toast({ title: 'Error updating RSVP', variant: 'destructive' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  };

  const handleEventClick = (event) => {
    console.log('Event clicked:', event);
    setSelectedEvent({ ...event, attendeesObj: event.attendees || [] });
    setDrawerOpen(true);
    if (event.id) {
      loadRsvpStatus(event.id);
    }
  };

  const handleJoinMeeting = useCallback(
    (meetLink) => {
      if (meetLink) {
        // Fix double-protocol URLs (e.g. "http://https//..." -> "https://...")
        let cleanUrl = meetLink.replace(/^https?:\/\/https?\/\//i, 'https://');
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
          cleanUrl = 'https://' + cleanUrl;
        }
        window.open(cleanUrl, '_blank');
        toast({
          title: 'Joining meeting...',
          description: 'Opening meeting link',
        });
      }
    },
    [toast]
  );

  const handleDownloadICS = useCallback((event: any) => {
    if (!event) return;
    const formatICSDate = (date: any) => {
      const d = new Date(date);
      return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };
    const escapeICS = (text: string) =>
      (text || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

    const start = formatICSDate(event.startTime || event.start);
    const end = formatICSDate(event.endTime || event.end);
    const summary = escapeICS(event.title);
    const description = escapeICS(event.description || event.agenda || '');
    const location = event.venueType === 'ONLINE'
      ? escapeICS(event.meetLink || 'Virtual')
      : escapeICS(event.location || '');

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TechAI//Meetings//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      `UID:${event.id}@techaipath.com`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(event.title || 'event').replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'Calendar file downloaded', description: 'Import the .ics file into your calendar app' });
  }, [toast]);

  const handleAddToGoogleCalendar = useCallback((event: any) => {
    if (!event) return;
    const formatGoogleDate = (date: any) => {
      const d = new Date(date);
      return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };
    const start = formatGoogleDate(event.startTime || event.start);
    const end = formatGoogleDate(event.endTime || event.end);
    const title = encodeURIComponent(event.title || '');
    const details = encodeURIComponent(event.description || event.agenda || '');
    const location = encodeURIComponent(
      event.venueType === 'ONLINE' ? (event.meetLink || 'Virtual') : (event.location || '')
    );
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const handleAddToOutlookCalendar = useCallback((event: any) => {
    if (!event) return;
    const start = new Date(event.startTime || event.start).toISOString();
    const end = new Date(event.endTime || event.end).toISOString();
    const title = encodeURIComponent(event.title || '');
    const body = encodeURIComponent(event.description || event.agenda || '');
    const location = encodeURIComponent(
      event.venueType === 'ONLINE' ? (event.meetLink || 'Virtual') : (event.location || '')
    );
    const url = `https://outlook.live.com/calendar/0/action/compose?subject=${title}&startdt=${start}&enddt=${end}&body=${body}&location=${location}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const handleConnectGoogle = useCallback(() => {
    setGoogleConnected(true);
    setConnectModalOpen(false);
    toast({
      title: 'Google Calendar connected!',
      description: 'Your calendar is now synced',
    });
  }, [toast]);

  const handleScheduleMeeting = useCallback(
    async (meetingData) => {
      try {
        await createEvent(meetingData);
        setScheduleModalOpen(false);
        await loadEvents(); // Refresh events
        toast({
          title: 'Meeting scheduled!',
          description: 'Your meeting has been created',
        });
      } catch (err) {
        toast({
          title: 'Error creating meeting',
          description: err.message,
          variant: 'destructive',
        });
      }
    },
    [toast]
  );

  const handleCreateEvent = useCallback(async (eventData) => {
    try {
      await createEvent({ ...eventData });
      // TODO
      setCreateEventModalOpen(false);
      await loadEvents(); // Refresh events
      toast({
        title: 'Event created!',
        description: 'Your event has been scheduled',
      });
    } catch (err) {
      console.log(err);
      toast({
        title: 'Error creating event',
        description: err.message,
        variant: 'destructive',
      });
    }
  }, []);

  const handleSelectSlot = useCallback((slotInfo) => {
    if (isStudent) {
      // Students can add notes or personal events
      setSelectedNoteDate(moment(slotInfo.start).format('YYYY-MM-DD'));
      setSelectedSlot(slotInfo);
      setEventType('PERSONAL');
      setCreateEventModalOpen(true);
    } else {
      setSelectedSlot(slotInfo);
      setCreateEventModalOpen(true);
    }
  }, [isStudent]);

  const filteredMeetings = events?.filter((meeting) => {
    const matchesSearch = meeting.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesMeetLink =
      meetLinkFilter === 'all' ||
      (meetLinkFilter === 'with-link' && meeting.meetLink) ||
      (meetLinkFilter === 'without-link' && !meeting.meetLink);
    const matchesCreator =
      creatorFilter === 'all' ||
      (creatorFilter === 'me' && meeting.creatorId === currentUserId) ||
      (creatorFilter === 'team' && meeting.creatorId !== currentUserId);

    return matchesSearch && matchesMeetLink && matchesCreator;
  });

  const myMeetings = filteredMeetings?.filter(
    (m) => m.creatorId === currentUserId
  );
  const teamMeetings = filteredMeetings?.filter(
    (m) => m.creatorId !== currentUserId
  );
  const [ownerId, setOwnerId] = useState('');
  const upcomingMeetings = filteredMeetings
    ?.filter((m) => moment(m.start).isAfter(moment()))
    .sort((a, b) => moment(a.start).diff(moment(b.start)))
    .slice(0, 3);
  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   if (token) {
  //     const decoded: any = jwtDecode(token);
  //     setOwnerId(decoded.userId);
  //     // getUserById(decoded.userId);
  //   }
  // }, []);

  const [attendeeDialogOpen, setAttendeeDialogOpen] = useState(false);
  // Create Event Form Component (matches API format)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState(
    selectedSlot ? moment(selectedSlot.start).format('YYYY-MM-DDTHH:mm') : ''
  );
  const [endTime, setEndTime] = useState(
    selectedSlot ? moment(selectedSlot.end).format('YYYY-MM-DDTHH:mm') : ''
  );
  const [addMeetingLink, setAddMeetingLink] = useState(false);
  const [teamId, setTeamId] = useState('434362c4-dfa0-4898-a2bc-a428aeed4773'); // Hardcoded for now
  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const [openFilters, setOpenFilters] = useState(false);
  const [isCourseEvent, setIsCourseEvent] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [meetingTemplates, setMeetingTemplates] = useState<any[]>([]);

  // Load meeting templates
  useEffect(() => {
    if (!isStudent) {
      apiService.get(endpoints.getMeetingTemplates)
        .then((res) => setMeetingTemplates(res.data || []))
        .catch((err) => console.log('Error loading templates:', err));
    }
  }, []);

  const applyTemplate = (template: any) => {
    if (!template) return;
    setEventType(template.eventType || 'MEETING');
    setVenueType(template.venueType || 'ONLINE');
    setEventColor(template.color || '');
    setEventAgenda(template.agenda || '');
    setAddMeetingLink(template.addMeetingLink || false);
    setDescription(template.description || '');
    if (template.defaultDurationMinutes && startTime) {
      const start = new Date(startTime);
      const end = new Date(start.getTime() + template.defaultDurationMinutes * 60000);
      setEndTime(moment(end).format('YYYY-MM-DDTHH:mm'));
    }
    if (template.defaultReminders) {
      try {
        const parsed = JSON.parse(template.defaultReminders);
        setReminders(parsed);
      } catch { /* ignore */ }
    }
    toast({ title: 'Template applied', description: `"${template.name}" settings loaded` });
  };

  const handleSaveAsTemplate = async () => {
    try {
      const templateData = {
        name: title || 'Untitled Template',
        description,
        eventType,
        venueType,
        color: eventColor,
        agenda: eventAgenda,
        defaultDurationMinutes: startTime && endTime
          ? Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000)
          : 60,
        addMeetingLink,
        defaultReminders: reminders.length > 0 ? JSON.stringify(reminders) : null,
        isShared: false,
      };
      await apiService.post(endpoints.createMeetingTemplate, templateData);
      toast({ title: 'Template saved!', description: 'You can reuse this template for future events' });
      // Refresh templates
      const res = await apiService.get(endpoints.getMeetingTemplates);
      setMeetingTemplates(res.data || []);
    } catch (err) {
      toast({ title: 'Error saving template', variant: 'destructive' });
    }
  };

  // Mock attendees for now

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [meetingReminders, setMeetingReminders] = useState(true);
  const [conflictingEvents, setConflictingEvents] = useState<any[]>([]);
  const [checkingConflicts, setCheckingConflicts] = useState(false);

  // Check for conflicting events when start/end times change
  const checkConflicts = async (start: string, end: string) => {
    if (!start || !end) return;
    try {
      setCheckingConflicts(true);
      const startISO = new Date(start).toISOString().replace('Z', '').replace('T', ' ');
      const endISO = new Date(end).toISOString().replace('Z', '').replace('T', ' ');
      const response = await apiService.get(endpoints.checkEventConflicts(startISO, endISO));
      setConflictingEvents(response.data || []);
    } catch (err) {
      console.log('Conflict check failed:', err);
      setConflictingEvents([]);
    } finally {
      setCheckingConflicts(false);
    }
  };

  // Debounced conflict check
  useEffect(() => {
    if (startTime && endTime && createEventModalOpen) {
      const timer = setTimeout(() => checkConflicts(startTime, endTime), 500);
      return () => clearTimeout(timer);
    }
  }, [startTime, endTime, createEventModalOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!title?.trim()) {
      toast({ title: 'Validation Error', description: 'Event title is required', variant: 'destructive' });
      return;
    }
    if (!startTime) {
      toast({ title: 'Validation Error', description: 'Start time is required', variant: 'destructive' });
      return;
    }
    if (!endTime) {
      toast({ title: 'Validation Error', description: 'End time is required', variant: 'destructive' });
      return;
    }
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      toast({ title: 'Validation Error', description: 'Please enter valid dates', variant: 'destructive' });
      return;
    }
    if (end <= start) {
      toast({ title: 'Validation Error', description: 'End time must be after start time', variant: 'destructive' });
      return;
    }
    if (isCourseEvent && !selectedCourseId) {
      toast({ title: 'Validation Error', description: 'Please select a course for this course event', variant: 'destructive' });
      return;
    }

    const eventData = {
      title: title.trim(),
      description: description?.trim(),
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      addMeetingLink,
      teamId: currentTeam?.id,
      attendees: selectedAttendees.map((id) => id),
      recurrence: isRecurring ? recurrence : undefined,
      courseId: isCourseEvent ? selectedCourseId : undefined,
      eventType,
      venueType,
      color: eventColor || EVENT_TYPE_COLORS[eventType]?.bg,
      agenda: eventAgenda,
      isAllDay,
      reminders: reminders.length > 0 ? reminders : undefined,
      sendEmailNotification: emailNotifications,
    };

    // Students use the personal event endpoint
    if (isStudent) {
      apiService.post(endpoints.createPersonalEvent, eventData).then(() => {
        setCreateEventModalOpen(false);
        loadEvents();
        resetForm();
        toast({ title: 'Event created!', description: 'Your personal event has been scheduled' });
      }).catch((err) => {
        toast({ title: 'Error creating event', description: typeof err?.response?.data === 'string' ? err.response.data : err?.message || 'Unknown error', variant: 'destructive' });
      });
    } else {
      handleCreateEvent(eventData);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartTime('');
    setEndTime('');
    setEventType('MEETING');
    setVenueType('ONLINE');
    setEventColor('');
    setEventAgenda('');
    setIsAllDay(false);
    setReminders([]);
    setSelectedAttendees([]);
    setGuests([]);
    setIsCourseEvent(false);
    setSelectedCourseId('');
    setSelectedCourse(null);
    setAddMeetingLink(false);
    setIsRecurring(false);
    setConflictingEvents([]);
  };
  const toggleAttendee = (attendeeId) => {
    console.log('Toggling attendee:', attendeeId);
    setSelectedAttendees((prev) =>
      prev.includes(attendeeId)
        ? prev.filter((id) => id !== attendeeId)
        : [...prev, attendeeId]
    );
  };

  // ...existing code...

  // Helper functions
  const isToday = (date) => moment(date).isSame(moment(), 'day');
  const isThisWeek = (date) =>
    moment(date).isSame(moment(), 'week') && !isToday(date);
  const isThisMonth = (date) =>
    moment(date).isSame(moment(), 'month') &&
    !isToday(date) &&
    !isThisWeek(date);

  // Group events (use filtered for display)
  const todayEvents = filteredMeetings?.filter((event) => isToday(event.start)) || [];
  const weekEvents = filteredMeetings?.filter((event) => isThisWeek(event.start)) || [];
  const monthEvents = filteredMeetings?.filter((event) => isThisMonth(event.start)) || [];
  const getDateLabel = (date) => {
    const m = moment(date);
    if (m.isSame(moment(), 'day')) return 'Today';
    if (m.isSame(moment().add(1, 'day'), 'day')) return 'Tomorrow';
    // Example: Friday, Sep 27
    return m.format('dddd, MMM D');
  };
  const MeetingCard = ({ meeting }) => {
    const typeConfig = EVENT_TYPE_COLORS[meeting.eventType] || EVENT_TYPE_COLORS.MEETING;
    return (
      <div
        className="group cursor-pointer w-full"
        onClick={() => handleEventClick(meeting)}
      >
        <Card
          className={`shadow-xs hover:shadow-elegant transition-smooth border-l-4`}
          style={{ borderLeftColor: meeting.color || typeConfig.bg }}
        >
          <CardContent className="p-5">
            {/* Header with time badge */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: meeting.color || typeConfig.bg }}
                />
                <span className="text-sm font-medium text-muted-foreground">
                  {getDateLabel(meeting.start)}
                </span>
              </div>
              <div className="bg-background/80 rounded-full px-3 py-1 border">
                <p className="text-sm font-semibold text-foreground">
                  {moment(meeting.start).format('HH:mm')} -{' '}
                  {moment(meeting.end).format('HH:mm')}
                </p>
              </div>
            </div>

            {/* Title + description */}
            <div className="mb-2">
              <h3 className="font-semibold text-lg mb-1 text-card-foreground">
                {meeting.title}
              </h3>
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  className="text-xs"
                  style={{ backgroundColor: typeConfig.bg, color: typeConfig.text }}
                >
                  {typeConfig.label}
                </Badge>
                {meeting.venueType && (
                  <Badge variant="outline" className="text-xs">
                    {meeting.venueType === 'ONLINE' && <Globe className="h-3 w-3 mr-1" />}
                    {meeting.venueType === 'PHYSICAL' && <Building className="h-3 w-3 mr-1" />}
                    {meeting.venueType === 'HYBRID' && <Users className="h-3 w-3 mr-1" />}
                    {meeting.venueType}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {meeting.description}
              </p>
            </div>

            {meeting.courseName && (
              <Badge className="bg-accent/30 text-accent-foreground border-0 mb-2">
                {meeting.courseName}
              </Badge>
            )}

            {/* Footer with attendees and action */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {(meeting.attendees || []).slice(0, 4).map((attendee, index) => (
                    <UserAvatar
                      key={index}
                      user={{
                        firstName: attendee.name?.split(' ')[0] || 'U',
                        lastName: attendee.name?.split(' ')[1] || '',
                      }}
                      fontSize={12}
                      height={28}
                      width={28}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {(meeting.attendees || []).length}{' '}
                  {meeting.attendees.length === 1 ? 'Member' : 'Members'}
                </span>
              </div>

              <button className="p-2 rounded-full transition-smooth group-hover:scale-110 hover:bg-primary/20 text-primary">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const EmptyState = ({ title, description }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
        <Calendar className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      <Button onClick={() => setCreateEventModalOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        {isStudent ? 'Add Personal Event' : 'Schedule Meeting'}
      </Button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      {eventLoading && (
        <Backdrop
          open={true}
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <div className="flex flex-col items-center gap-4">
            <CircularProgress color="inherit" />
            <span className="text-lg font-medium">Processing...</span>
          </div>
        </Backdrop>
      )}
      {loading && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your calendar...</p>
          </div>
        </div>
      )}
      {!loading && (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 sm:px-6 py-4 sm:py-8"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Meetings
            </h1>
            <p className="text-muted-foreground">
              Manage team schedules & join meetings
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {/* <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleConnectGoogleCalendar}
              disabled={googleConnected}
            >
              <CalendarDays className="h-4 w-4" />
              Connect Google Calendar
            </Button> */}

            <SmartDrawer open={connectModalOpen} onOpenChange={setConnectModalOpen}>
              <SmartDrawerTrigger asChild></SmartDrawerTrigger>
              <SmartDrawerContent>
                <SmartDrawerHeader>
                  <SmartDrawerTitle>Connect Google Calendar</SmartDrawerTitle>
                </SmartDrawerHeader>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Connect your Google Calendar to sync meetings and get
                    real-time updates.
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setConnectModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleConnectGoogle}>
                      Connect Calendar
                    </Button>
                  </div>
                </div>
              </SmartDrawerContent>
            </SmartDrawer>

            {!isStudent && (
              <Button
                className="flex items-center gap-2"
                onClick={() => setCreateEventModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Schedule Meeting
              </Button>
            )}
            {isStudent && (
              <Button
                className="flex items-center gap-2"
                onClick={() => {
                  setEventType('PERSONAL');
                  setCreateEventModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            )}
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                setSelectedNoteDate(moment().format('YYYY-MM-DD'));
                setNoteDialogOpen(true);
              }}
            >
              <StickyNote className="h-4 w-4" />
              Add Note
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            {!isStudent && (
              <Button
                variant="success"
                className="flex items-center gap-2"
                onClick={() => setOpenFilters(!openFilters)}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            )}
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <motion.div variants={itemVariants} className="flex-1">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6">
                <TabsTrigger
                  value="my-meetings"
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  My Meetings
                </TabsTrigger>
                <TabsTrigger
                  value="calendar"
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Calendar
                </TabsTrigger>

                <TabsTrigger
                  value="team-meetings"
                  className="flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Team Meetings
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <TabsContent value="calendar" className="mt-0">
                  <motion.div
                    key="calendar"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Card className="bg-card shadow-sm border">
                      <CardHeader className="pb-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <CardTitle>Calendar View</CardTitle>
                          <div className="flex gap-2">
                            <Select
                              value={calendarView}
                              onValueChange={setCalendarView}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="month">Month</SelectItem>
                                <SelectItem value="week">Week</SelectItem>
                                <SelectItem value="day">Day</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-96 sm:h-[600px] relative">
                          {loading && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                          )}
                            <BigCalendar
                              localizer={localizer}
                              events={Array.isArray(events) ? events : []}
                              startAccessor="start"
                              endAccessor="end"
                              titleAccessor="title"
                              view={calendarView}
                              onView={setCalendarView}
                              onSelectEvent={handleEventClick}
                              onSelectSlot={handleSelectSlot}
                              selectable={true}
                              resizable
                              className=""
                              draggableAccessor={() => true}
                              onEventDrop={async ({ event, start, end }) => {
                                toast({
                                  title: 'Event moved',
                                  description: 'Event time updated',
                                });
                              }}
                              onEventResize={async ({ event, start, end }) => {
                                toast({
                                  title: 'Event resized',
                                  description: 'Event duration updated',
                                });
                              }}
                              eventPropGetter={(event) => {
                                const typeConfig = EVENT_TYPE_COLORS[event.eventType] || EVENT_TYPE_COLORS.MEETING;
                                const bgColor = event.color || typeConfig.bg;
                                return {
                                  style: {
                                    backgroundColor: bgColor,
                                    borderRadius: '5px',
                                    border: 'none',
                                    color: typeConfig.text,
                                    padding: '4px 8px',
                                    fontSize: '12px',
                                  },
                                };
                              }}
                              style={{ height: '100%' }}
                            />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Event Type Legend */}
                    <div className="flex flex-wrap gap-3 mt-4">
                      {Object.entries(EVENT_TYPE_COLORS).map(([key, config]) => (
                        <div key={key} className="flex items-center gap-1.5">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: config.bg }}
                          />
                          <span className="text-xs text-muted-foreground">{config.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Calendar Notes Section */}
                    {calendarNotes.length > 0 && (
                      <Card className="mt-4">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <StickyNote className="h-4 w-4" />
                            My Notes
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {calendarNotes.map((note) => (
                              <div
                                key={note.id}
                                className="flex items-start gap-3 p-3 rounded-lg border"
                                style={{ borderLeftColor: note.color || '#3b82f6', borderLeftWidth: '3px' }}
                              >
                                <button onClick={() => handleToggleNote(note.id)} className="mt-0.5">
                                  <CheckCircle2
                                    className={`h-4 w-4 ${note.isCompleted ? 'text-green-500' : 'text-muted-foreground'}`}
                                  />
                                </button>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-sm font-medium ${note.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                      {note.title}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {note.noteType}
                                    </Badge>
                                  </div>
                                  {note.content && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{note.content}</p>
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {moment(note.noteDate).format('MMM D, YYYY')}
                                  </span>
                                </div>
                                <button
                                  onClick={() => { setNoteToDelete(note.id); setDeleteNoteDialogOpen(true); }}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                </TabsContent>

                <TabsContent value="my-meetings" className="mt-0">
                  {/* Search & Filter Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search meetings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Select value={meetLinkFilter} onValueChange={setMeetLinkFilter}>
                        <SelectTrigger className="w-full sm:w-[140px]">
                          <SelectValue placeholder="Meeting link" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Events</SelectItem>
                          <SelectItem value="with-link">With Link</SelectItem>
                          <SelectItem value="without-link">No Link</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={creatorFilter} onValueChange={setCreatorFilter}>
                        <SelectTrigger className="w-full sm:w-[120px]">
                          <SelectValue placeholder="Creator" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="me">Created by me</SelectItem>
                          <SelectItem value="team">Others</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4  overflow-y-auto">
                    {events && events?.length > 0 ? (
                      <>
                        {todayEvents.length > 0 && (
                          <>
                            <h3 className="text-lg font-semibold mb-2">
                              Today
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                              {todayEvents?.map((event) => (
                                <MeetingCard key={event.id} meeting={event} />
                              ))}
                            </div>
                          </>
                        )}

                        {weekEvents.length > 0 && (
                          <>
                            <h3 className="text-lg font-semibold mb-2">
                              This Week
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                              {weekEvents?.map((event) => (
                                <MeetingCard key={event.id} meeting={event} />
                              ))}
                            </div>
                          </>
                        )}

                        {monthEvents.length > 0 && (
                          <>
                            <h3 className="text-lg font-semibold mb-2">
                              This Month
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                              {monthEvents?.map((event) => (
                                <MeetingCard key={event.id} meeting={event} />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <EmptyState
                        title="No meetings created yet"
                        description="Schedule your first meeting to get started organizing your calendar."
                      />
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="team-meetings" className="mt-0">
                  <div key="team-meetings" className="space-y-4">
                    {teamMeetings && teamMeetings?.length > 0 ? (
                      teamMeetings
                        ?.map((meeting) => (
                          <MeetingCard key={meeting.id} meeting={meeting} />
                        ))
                    ) : (
                      <EmptyState
                        title="No team meetings yet"
                        description="Join team meetings or ask colleagues to invite you to their meetings."
                      />
                    )}
                  </div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </motion.div>

          {/* Right Sidebar */}
          <AnimatePresence>
            {openFilters && (
              <motion.div
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                transition={{ duration: 0.3 }}
                className="w-full lg:w-80 space-y-6"
              >
                <Card className="bg-card shadow-sm border h-[50vh]">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">System Settings</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    {/* Google Account Configuration */}
                    <div className="space-y-2">
                      <Label>Main system email</Label>

                      <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/40">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">
                            {googleConnected ? 'Connected' : 'Not connected'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Used to generate Google Meet links
                          </p>
                        </div>

                        <Button
                          size="sm"
                          variant={googleConnected ? 'outline' : 'default'}
                          onClick={handleConnectGoogleCalendar}
                        >
                          {googleConnected ? 'Reconfigure' : 'Configure'}
                        </Button>
                      </div>
                    </div>

                    {/* Notifications */}
                    <div className="space-y-3">
                      <Label>Notifications</Label>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            Email notifications
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Notify participants via email
                          </p>
                        </div>
                        <Switch
                          checked={emailNotifications}
                          onCheckedChange={setEmailNotifications}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            Meeting reminders
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Send reminders before meetings
                          </p>
                        </div>
                        <Switch
                          checked={meetingReminders}
                          onCheckedChange={setMeetingReminders}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Event Details Drawer */}
        <MuiDrawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: { xs: '100%', md: 600, lg: 700 },
              maxWidth: '100vw',
              p: 0,
            },
          }}
        >
          <div className="border-b pt-12 px-6 pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="text-xl font-semibold">
                  {selectedEvent?.title}
                </div>
                {selectedEvent?.eventType && (
                  <Badge
                    style={{
                      backgroundColor: EVENT_TYPE_COLORS[selectedEvent.eventType]?.bg || '#3b82f6',
                      color: EVENT_TYPE_COLORS[selectedEvent.eventType]?.text || '#fff',
                    }}
                  >
                    {EVENT_TYPE_COLORS[selectedEvent.eventType]?.label || selectedEvent.eventType}
                  </Badge>
                )}
                {selectedEvent?.status && selectedEvent.status !== 'UPCOMING' && (
                  <Badge variant={selectedEvent.status === 'CANCELLED' ? 'destructive' : 'outline'}>
                    {selectedEvent.status}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">
                {selectedEvent?.description}
              </p>

              {selectedEvent?.courseName && (
                <div className="text-xs mt-1">
                  <strong>Course:</strong> {selectedEvent.courseName}
                </div>
              )}
            </div>
            <IconButton onClick={() => setDrawerOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">
                      {selectedEvent?.startTime
                        ? moment(selectedEvent.startTime).format(
                            'MMMM DD, YYYY'
                          )
                        : selectedEvent?.start
                        ? moment(selectedEvent.start).format('MMMM DD, YYYY')
                        : ''}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedEvent?.startTime
                        ? moment(selectedEvent.startTime)
                        : moment(selectedEvent?.start)
                      ).format('h:mm A')}
                      {' - '}
                      {(selectedEvent?.endTime
                        ? moment(selectedEvent.endTime)
                        : moment(selectedEvent?.end)
                      ).format('h:mm A')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">
                      {selectedEvent?.location ||
                        (selectedEvent?.isOnlineEvent ? 'Online' : '—')}
                    </p>
                    {selectedEvent?.venueType && (
                      <p className="text-sm text-muted-foreground">
                        {selectedEvent.venueType === 'ONLINE' && '🌐 Virtual Meeting'}
                        {selectedEvent.venueType === 'PHYSICAL' && '🏢 In-Person'}
                        {selectedEvent.venueType === 'HYBRID' && '🔄 Hybrid (Online + In-Person)'}
                      </p>
                    )}
                  </div>
                </div>

                {selectedEvent?.agenda && (
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Agenda</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {selectedEvent.agenda}
                      </p>
                    </div>
                  </div>
                )}

                {selectedEvent?.meetLink &&
                  (() => {
                    let userName = '';
                    try {
                      const userRaw = localStorage.getItem('user');
                      if (userRaw) {
                        const userObj = JSON.parse(userRaw);
                        userName =
                          userObj?.firstName + ' ' + userObj?.lastName || '';
                      }
                    } catch {}
                    const encodedName = encodeURIComponent(userName);
                    const joinUrl = selectedEvent.meetLink;
                    return (
                      <div className="flex items-center gap-3 p-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                        <Video className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-300">
                          Meeting Link available
                        </span>
                        <a
                          href={joinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto"
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/30"
                          >
                            Join Meeting
                            <ExternalLink className="h-4 w-4 ml-1" />
                          </Button>
                        </a>
                      </div>
                    );
                  })()}
              </div>

              <div className="space-y-4">
                {/* Attendees by role */}
                {selectedEvent?.attendeesObj &&
                  selectedEvent.attendeesObj.length > 0 && (
                    <>
                      <div>
                        <h4 className="font-medium mb-2">Attendees</h4>
                        <div className="flex flex-col gap-2">
                          {/* Students */}
                          {selectedEvent.attendeesObj.some(
                            (a) => a.role === 'Student'
                          ) && (
                            <div>
                              <div className="text-xs font-semibold mb-1">
                                Students
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {selectedEvent.attendeesObj
                                  .filter((a) => a.role === 'Student')

                                  ?.map((attendee) => (
                                    <div
                                      key={attendee.id}
                                      className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full"
                                    >
                                      <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-xs">
                                          {attendee.name
                                            ? attendee.name
                                                .substring(0, 2)
                                                .toUpperCase()
                                            : 'U'}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm">
                                        {attendee.name || attendee.email}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                          {/* Tutors */}
                          {selectedEvent.attendeesObj.some(
                            (a) => a.role === 'Tutor'
                          ) && (
                            <div>
                              <div className="text-xs font-semibold mb-1">
                                Tutors
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {selectedEvent.attendeesObj
                                  .filter((a) => a.role === 'Tutor')
                                  ?.map((attendee) => (
                                    <div
                                      key={attendee.id}
                                      className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full"
                                    >
                                      <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-xs">
                                          {attendee.name
                                            ? attendee.name
                                                .substring(0, 2)
                                                .toUpperCase()
                                            : 'U'}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm">
                                        {attendee.name || attendee.email}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                {/* Guests */}
                {selectedEvent?.guests && selectedEvent.guests.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Guests</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent?.guests?.map((guest, idx) => (
                        <div
                          key={guest.email || idx}
                          className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {guest.name
                                ? guest.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()
                                : 'G'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {guest.name || guest.email}
                          </span>
                          {guest.role && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              {guest.role}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEvent?.hostLink &&
                  (() => {
                    let userName = '';
                    try {
                      const userRaw = localStorage.getItem('user');
                      if (userRaw) {
                        const userObj = JSON.parse(userRaw);
                        userName =
                          userObj?.firstName + ' ' + userObj?.lastName || '';
                      }
                    } catch {}
                    const encodedName = encodeURIComponent(userName);
                    const joinUrl = `${selectedEvent.hostLink}${
                      selectedEvent.hostLink.includes('#') ? '&' : '#'
                    }userInfo.displayName=${encodedName}`;
                    return (
                      <div className="flex items-center gap-4 p-4 rounded-xl border border-blue-200 bg-blue-50 shadow-sm dark:bg-blue-950 dark:border-blue-800">
                        <div className="flex items-center gap-2">
                          <Video className="h-6 w-6 text-blue-600" />
                          <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                            Speaker Link
                          </span>
                        </div>
                        <span className="text-xs text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded">
                          Moderator
                        </span>
                        <a
                          href={joinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto"
                        >
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-blue-600 text-white hover:bg-blue-700"
                            title="Open Google Meet"
                          >
                            Join Now
                            <ExternalLink className="h-4 w-4 ml-2" />
                          </Button>
                        </a>
                      </div>
                    );
                  })()}
              </div>
            </div>

            <Separator />

            {/* RSVP Section */}
            {selectedEvent?.id && selectedEvent.creatorId !== currentUserId && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  RSVP
                </h4>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={myRsvpStatus === 'ACCEPTED' ? 'default' : 'outline'}
                    className={myRsvpStatus === 'ACCEPTED' ? 'bg-green-600 hover:bg-green-700' : ''}
                    onClick={() => handleRsvpResponse(selectedEvent.id, 'ACCEPTED')}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant={myRsvpStatus === 'TENTATIVE' ? 'default' : 'outline'}
                    className={myRsvpStatus === 'TENTATIVE' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                    onClick={() => handleRsvpResponse(selectedEvent.id, 'TENTATIVE')}
                  >
                    Maybe
                  </Button>
                  <Button
                    size="sm"
                    variant={myRsvpStatus === 'DECLINED' ? 'default' : 'outline'}
                    className={myRsvpStatus === 'DECLINED' ? 'bg-red-600 hover:bg-red-700' : ''}
                    onClick={() => handleRsvpResponse(selectedEvent.id, 'DECLINED')}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="text-green-600">{rsvpCounts.accepted} accepted</span>
                  <span className="text-yellow-600">{rsvpCounts.tentative} maybe</span>
                  <span className="text-red-600">{rsvpCounts.declined} declined</span>
                  <span>{rsvpCounts.pending} pending</span>
                </div>
              </div>
            )}

            {/* RSVP Summary for event owner */}
            {selectedEvent?.id && selectedEvent.creatorId === currentUserId && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">RSVP Summary</h4>
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    {rsvpCounts.accepted}
                  </span>
                  <span className="flex items-center gap-1 text-yellow-600">
                    <AlertTriangle className="h-4 w-4" />
                    {rsvpCounts.tentative}
                  </span>
                  <span className="flex items-center gap-1 text-red-600">
                    <X className="h-4 w-4" />
                    {rsvpCounts.declined}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {rsvpCounts.pending} pending
                  </span>
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-2 py-2">
              <h4 className="font-medium text-sm">Save to Calendar</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddToGoogleCalendar(selectedEvent)}
                >
                  <Globe className="h-4 w-4 mr-1.5" />
                  Google
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddToOutlookCalendar(selectedEvent)}
                >
                  <CalendarDays className="h-4 w-4 mr-1.5" />
                  Outlook
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadICS(selectedEvent)}
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  .ics (Apple / Other)
                </Button>
              </div>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-3 pt-12">
              {selectedEvent?.meetLink && (
                <Button
                  onClick={() => handleJoinMeeting(selectedEvent.meetLink)}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Join Meeting
                </Button>
              )}
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>

              <Button variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Button variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </MuiDrawer>

        {/* Create Event Modal */}
        <SmartDrawer
          open={createEventModalOpen}
          onOpenChange={(open) => {
            setCreateEventModalOpen(open);
            setSelectedAttendees([]);
            setSelectedCourse(null);
          }}
        >
          <SmartDrawerContent>
            <SmartDrawerHeader>
              <SmartDrawerTitle>{isStudent ? 'Create Personal Event' : 'Create New Event'}</SmartDrawerTitle>
            </SmartDrawerHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Meeting Template Selector */}
              {!isStudent && meetingTemplates.length > 0 && (
                <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800 p-3">
                  <Label className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1.5 mb-2">
                    <BookOpen className="h-3.5 w-3.5" />
                    Use Template
                  </Label>
                  <Select onValueChange={(val) => {
                    const tmpl = meetingTemplates.find(t => t.id === val);
                    if (tmpl) applyTemplate(tmpl);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template to auto-fill..." />
                    </SelectTrigger>
                    <SelectContent>
                      {meetingTemplates.map((tmpl) => (
                        <SelectItem key={tmpl.id} value={tmpl.id}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tmpl.color || '#3b82f6' }} />
                            {tmpl.name}
                            <span className="text-xs text-muted-foreground ml-1">({tmpl.defaultDurationMinutes}min)</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Event Type Selection */}
              <div>
                <Label>Event Type</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {(isStudent
                    ? ['PERSONAL', 'STUDY_SESSION', 'REMINDER', 'DEADLINE']
                    : Object.keys(EVENT_TYPE_COLORS)
                  ).map((type) => {
                    const config = EVENT_TYPE_COLORS[type];
                    return (
                      <Button
                        key={type}
                        type="button"
                        variant={eventType === type ? 'default' : 'outline'}
                        size="sm"
                        style={eventType === type ? { backgroundColor: config.bg, color: config.text } : {}}
                        onClick={() => {
                          setEventType(type);
                          setEventColor(config.bg);
                        }}
                      >
                        {config.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Venue Type */}
              <div>
                <Label>Venue Type</Label>
                <div className="flex gap-2 mt-1">
                  {VENUE_TYPES.map(({ value, label, icon: Icon }) => (
                    <Button
                      key={value}
                      type="button"
                      variant={venueType === value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setVenueType(value)}
                    >
                      <Icon className="h-4 w-4 mr-1" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {!isStudent && (
                <div>
                  <Label htmlFor="is-course-event">Is this a course event?</Label>
                  <Select
                    value={isCourseEvent ? 'yes' : 'no'}
                    onValueChange={(val) => setIsCourseEvent(val === 'yes')}
                  >
                    <SelectTrigger id="is-course-event">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* New: Course select, only if isCourseEvent */}
              {isCourseEvent && (
                <div>
                  <Label htmlFor="course-select">Select Course</Label>
                  <Select
                    value={selectedCourseId}
                    onValueChange={(val) => {
                      setSelectedCourseId(val);
                      const course = coursesData.find((c) => c.id === val);
                      setSelectedCourse(course);
                    }}
                  >
                    <SelectTrigger id="course-select">
                      <SelectValue placeholder="Choose a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {coursesData?.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label htmlFor="event-title">Event Title</Label>
                <Input
                  id="event-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="event-description">Description</Label>
                <Textarea
                  id="event-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Event description (optional)"
                  rows={3}
                />
              </div>

              {/* Agenda */}
              <div>
                <Label htmlFor="event-agenda">Agenda</Label>
                <Textarea
                  id="event-agenda"
                  value={eventAgenda}
                  onChange={(e) => setEventAgenda(e.target.value)}
                  placeholder="Meeting agenda items (optional)"
                  rows={2}
                />
              </div>

              {/* All Day Toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="all-day"
                  checked={isAllDay}
                  onCheckedChange={setIsAllDay}
                />
                <Label htmlFor="all-day">All Day Event</Label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="event-start">Start Date & Time</Label>
                  <Input
                    id="event-start"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="event-end">End Date & Time</Label>
                  <Input
                    id="event-end"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Conflict Detection Warning */}
              {conflictingEvents.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-3">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {conflictingEvents.length} conflicting event{conflictingEvents.length > 1 ? 's' : ''} found
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {conflictingEvents.slice(0, 3).map((conflict) => (
                      <div key={conflict.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span className="font-medium">{conflict.title}</span>
                        <span>
                          {moment(conflict.startTime).format('h:mm A')} - {moment(conflict.endTime).format('h:mm A')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {checkingConflicts && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Checking for conflicts...
                </div>
              )}
              <div className="flex items-center space-x-2 mt-4 mb-3">
                <Switch
                  id="add-meet-link"
                  checked={addMeetingLink}
                  onCheckedChange={setAddMeetingLink}
                />
                <Label htmlFor="add-meet-link">Add Meeting link</Label>
              </div>

              {/* Reminders */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Bell className="h-4 w-4" />
                  Reminders
                </Label>
                <div className="space-y-2">
                  {reminders.map((reminder, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Select
                        value={String(reminder.minutesBefore)}
                        onValueChange={(val) => {
                          const updated = [...reminders];
                          updated[idx].minutesBefore = Number(val);
                          setReminders(updated);
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {REMINDER_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={String(opt.value)}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={reminder.type}
                        onValueChange={(val) => {
                          const updated = [...reminders];
                          updated[idx].type = val;
                          setReminders(updated);
                        }}
                      >
                        <SelectTrigger className="w-auto min-w-[7rem]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IN_APP">In-App</SelectItem>
                          <SelectItem value="EMAIL">Email</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setReminders(reminders.filter((_, i) => i !== idx))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setReminders([...reminders, { minutesBefore: 15, type: 'IN_APP' }])}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Reminder
                  </Button>
                </div>
              </div>
              <div className="z-[999999]">
                <Label>Attendees</Label>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {selectedAttendees.length > 0 ? (
                    selectedAttendees?.map((id) => {
                      const user = usersData?.find((u) => u.id === id);
                      console.log('Attendee user:', user);
                      return (
                        <div
                          key={id}
                          className="flex items-center gap-1 cursor-pointer"
                        >
                          <UserAvatar
                            user={user || { firstName: 'U', lastName: '' }}
                            fontSize={12}
                            height={24}
                            width={24}
                          />
                          <span className="text-sm">
                            {user?.firstName} {user?.lastName}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAttendee(id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No attendees
                    </span>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAttendeeDialogOpen(true)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                  <SmartDrawer
                    open={attendeeDialogOpen}
                    onOpenChange={setAttendeeDialogOpen}
                  >
                    <SmartDrawerContent defaultWidth={672}>
                      <SmartDrawerHeader>
                        <SmartDrawerTitle>Select Attendees</SmartDrawerTitle>
                      </SmartDrawerHeader>
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Selected: {selectedAttendees.length}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Select all visible users
                            if (selectedCourse) {
                              const allIds = [
                                ...(selectedCourse.tutors?.map((u) => u.id) ||
                                  []),
                                ...(selectedCourse.enrolledStudents?.map(
                                  (u) => u.id
                                ) || []),
                              ];
                              setSelectedAttendees(allIds);
                            }
                          }}
                        >
                          Select All
                        </Button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border text-sm">
                          <thead>
                            <tr className="bg-muted">
                              <th className="p-2 text-left">Select</th>
                              <th className="p-2 text-left">Name</th>
                              <th className="p-2 text-left">Role</th>
                              <th className="p-2 text-left">Email</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedCourse && isCourseEvent ? (
                              [
                                ...(selectedCourse.tutors || []).map(
                                  (user) => ({
                                    ...user,
                                    _role: 'Tutor',
                                    _id: user.userId || user.id, // always use _id
                                  })
                                ),
                                ...(selectedCourse.enrolledStudents || []).map(
                                  (user) => ({
                                    ...user,
                                    _role: 'Student',
                                    _id: user.userId || user.id, // always use _id
                                  })
                                ),
                              ].map((user) => (
                                <tr key={user._id} className="border-b">
                                  <td className="p-2">
                                    <Checkbox
                                      checked={selectedAttendees.includes(
                                        user._id
                                      )}
                                      onCheckedChange={() =>
                                        toggleAttendee(user._id)
                                      }
                                    />
                                  </td>
                                  <td className="p-2">
                                    {user.name ||
                                      `${user.firstName || ''} ${
                                        user.lastName || ''
                                      }`}
                                  </td>
                                  <td className="p-2">{user.role}</td>
                                  <td className="p-2">{user.email}</td>
                                </tr>
                              ))
                            ) : (
                              <>
                                {usersData &&
                                  usersData?.map((user) => (
                                    <tr key={user.id} className="border-b">
                                      <td className="p-2">
                                        <Checkbox
                                          checked={selectedAttendees.includes(
                                            user.id
                                          )}
                                          onCheckedChange={() =>
                                            toggleAttendee(user.id)
                                          }
                                        />
                                      </td>
                                      <td className="p-2">
                                        {user.name ||
                                          `${user.firstName || ''} ${
                                            user.lastName || ''
                                          }`}
                                      </td>
                                      <td className="p-2">{user.role}</td>
                                      <td className="p-2">{user.email}</td>
                                    </tr>
                                  ))}
                              </>
                            )}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex justify-end pt-4">
                        <Button
                          type="button"
                          onClick={() => setAttendeeDialogOpen(false)}
                        >
                          Done
                        </Button>
                      </div>
                    </SmartDrawerContent>
                  </SmartDrawer>
                </div>
              </div>
              <div className="z-[999999]">
                <Label>Guests</Label>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {guests.length > 0 ? (
                    guests.map((guest, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1 cursor-pointer"
                      >
                        <Avatar className="h-7 w-7">
                          <AvatarFallback>
                            {guest.name
                              ? guest.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .toUpperCase()
                              : 'G'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {guest.name || guest.email}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingGuestIndex(idx);
                            setGuestForm(guest);
                            setGuestDialogOpen(true);
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setGuests((prev) =>
                              prev.filter((_, i) => i !== idx)
                            )
                          }
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No guests
                    </span>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setGuestForm({ name: '', email: '', role: '' });
                      setEditingGuestIndex(null);
                      setGuestDialogOpen(true);
                    }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Add Guest
                  </Button>
                </div>
              </div>

              <div className="flex  gap-2 pt-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="recurring-event"
                      checked={isRecurring}
                      onCheckedChange={setIsRecurring}
                    />
                    <Label htmlFor="recurring-event">Recurring Event</Label>
                  </div>

                  {isRecurring && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="recurrence-frequency">Frequency</Label>
                        <Select
                          value={recurrence.frequency}
                          onValueChange={(val) =>
                            setRecurrence((r) => ({ ...r, frequency: val }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DAILY">Daily</SelectItem>
                            <SelectItem value="WEEKLY">Weekly</SelectItem>
                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                            <SelectItem value="YEARLY">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="recurrence-interval">Interval</Label>
                        <Input
                          id="recurrence-interval"
                          type="number"
                          min={1}
                          value={recurrence.interval}
                          onChange={(e) =>
                            setRecurrence((r) => ({
                              ...r,
                              interval: Number(e.target.value) || 1,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="recurrence-byday">
                          Days (for weekly)
                        </Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map(
                            (day) => (
                              <Button
                                key={day}
                                type="button"
                                variant={
                                  recurrence.byDay.includes(day)
                                    ? 'default'
                                    : 'outline'
                                }
                                size="sm"
                                onClick={() =>
                                  setRecurrence((r) => ({
                                    ...r,
                                    byDay: r.byDay.includes(day)
                                      ? r.byDay.filter((d) => d !== day)
                                      : [...r.byDay, day],
                                  }))
                                }
                              >
                                {day}
                              </Button>
                            )
                          )}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="recurrence-until">End Date</Label>
                        <Input
                          id="recurrence-until"
                          type="date"
                          value={
                            recurrence.until
                              ? recurrence.until.slice(0, 10)
                              : ''
                          }
                          onChange={(e) =>
                            setRecurrence((r) => ({
                              ...r,
                              until: e.target.value
                                ? new Date(e.target.value).toISOString()
                                : '',
                            }))
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                {!isStudent && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSaveAsTemplate}
                    disabled={!title}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save as Template
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateEventModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Event</Button>
              </div>
            </form>
          </SmartDrawerContent>
        </SmartDrawer>
        <SmartDrawer open={guestDialogOpen} onOpenChange={setGuestDialogOpen}>
          <SmartDrawerContent>
            <SmartDrawerHeader>
              <SmartDrawerTitle>
                {editingGuestIndex !== null ? 'Edit Guest' : 'Add Guest'}
              </SmartDrawerTitle>
            </SmartDrawerHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!guestForm.name && !guestForm.email && !guestForm.role)
                  return;
                setGuests((prev) => {
                  if (editingGuestIndex !== null) {
                    // Edit
                    const updated = [...prev];
                    updated[editingGuestIndex] = guestForm;
                    return updated;
                  }
                  // Add
                  return [...prev, guestForm];
                });
                setGuestDialogOpen(false);
                setGuestForm({ name: '', email: '', role: '' });
                setEditingGuestIndex(null);
              }}
              className="space-y-4"
            >
              <div>
                <Label>Name</Label>
                <Input
                  value={guestForm.name}
                  onChange={(e) =>
                    setGuestForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Guest name"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={guestForm.email}
                  onChange={(e) =>
                    setGuestForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="Guest email"
                />
              </div>
              <div>
                <Label>Role</Label>
                <Input
                  value={guestForm.role}
                  onChange={(e) =>
                    setGuestForm((f) => ({ ...f, role: e.target.value }))
                  }
                  placeholder="Guest role"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setGuestDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingGuestIndex !== null ? 'Save' : 'Add'}
                </Button>
              </div>
            </form>
          </SmartDrawerContent>
        </SmartDrawer>
        {/* Schedule Meeting Modal (Legacy - keeping for compatibility) */}
        <SmartDrawer open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
          <SmartDrawerContent>
            <SmartDrawerHeader>
              <SmartDrawerTitle>Schedule Meeting</SmartDrawerTitle>
            </SmartDrawerHeader>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Use the calendar to create events by clicking on time slots.
              </p>
              <Button
                className="mt-4"
                onClick={() => {
                  setScheduleModalOpen(false);
                  setActiveTab('calendar');
                }}
              >
                Go to Calendar
              </Button>
            </div>
          </SmartDrawerContent>
        </SmartDrawer>

        {/* Calendar Note Dialog */}
        <SmartDrawer open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
          <SmartDrawerContent>
            <SmartDrawerHeader>
              <SmartDrawerTitle className="flex items-center gap-2">
                <StickyNote className="h-5 w-5" />
                Add Calendar Note
              </SmartDrawerTitle>
            </SmartDrawerHeader>
            <div className="space-y-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={selectedNoteDate}
                  onChange={(e) => setSelectedNoteDate(e.target.value)}
                />
              </div>
              <div>
                <Label>Note Type</Label>
                <Select value={noteType} onValueChange={setNoteType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NOTE">Note</SelectItem>
                    <SelectItem value="REMINDER">Reminder</SelectItem>
                    <SelectItem value="DEADLINE">Deadline</SelectItem>
                    <SelectItem value="STUDY_PLAN">Study Plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Note title"
                />
              </div>
              <div>
                <Label>Content</Label>
                <Textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write your note..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Color</Label>
                <div className="flex gap-2 mt-1">
                  {NOTE_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        noteColor === color ? 'scale-125 border-foreground' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNoteColor(color)}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateNote} disabled={!noteTitle}>
                  Save Note
                </Button>
              </div>
            </div>
          </SmartDrawerContent>
        </SmartDrawer>
      </motion.div>
      )}

      <AlertDialog open={deleteNoteDialogOpen} onOpenChange={setDeleteNoteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this calendar note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (noteToDelete) handleDeleteNote(noteToDelete); setDeleteNoteDialogOpen(false); setNoteToDelete(null); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Meetings;
