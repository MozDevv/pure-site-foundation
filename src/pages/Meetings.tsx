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
  Tag,
  Globe,
  Building,
  Loader2,
  Link2Off,
  ArrowRight,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { apiService, endpoints } from '@/lib/api';
// import { useTeams } from '@/contexts/TeamsContext';

import './shadcn-big-calendar.css';
// import { useIntegrations } from '@/hooks/use-integrations';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { UserAvatar } from '@/components/ProjectMembers';
import { Backdrop, CircularProgress, Drawer } from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const localizer = momentLocalizer(moment);

const AUTHORIZATION_URI = import.meta.env
  .VITE_GOOGLE_CALENDER_AUTHORIZATION_URI;

// Current user mock
const currentUser = {
  id: 'u-1',
  name: 'Alex',
  email: 'alex@parabel.app',
  initials: 'AX',
};

const params = new URLSearchParams({
  client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  redirect_uri: 'http://localhost:4000/timetable',
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
    return data.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      start: new Date(event.startTime),
      end: new Date(event.endTime),
      meetLink: event.meetLink,
      location: event.isTeamEvent ? 'Virtual' : 'Conference Room',
      attendees: event.attendeesObj || [],
      creatorId: event.ownerId,
      tags: event.isTeamEvent ? ['team'] : ['personal'],
      hasMeetLink: event.hasMeetLink,
      teamId: event.teamId,
      courseName: event.courseName,
      guests: event.guests || [],
    }));
  } catch (error) {
    if (
      error?.response?.data?.error === 'invalid_grant' ||
      error?.response?.data?.error_description?.includes(
        'Token has been expired or revoked'
      )
    ) {
      // Prompt user to reconnect Google Calendar
      handleConnectGoogleCalendar();
    }
  }
};

const Meetings = () => {
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

  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () =>
      apiService.get(endpoints.getAllCourses).then((res) => res.data),
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () =>
      apiService.get(endpoints.getAllUsers).then((res) => res.data.data),
  });
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
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [meetLinkFilter, setMeetLinkFilter] = useState('all');
  const [creatorFilter, setCreatorFilter] = useState('all');

  const { currentTeam } = {
    id: '434362c4-dfa0-4898-a2bc-a428aeed4773',
    name: 'Product Team',
  }; //useTeams();

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
      setEvents(eventsData);
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
    console.log("Event clicked:", event);

    setSelectedEvent({...event, attendeesObj: event.attendees || []});
    setDrawerOpen(true);
  };

  const handleJoinMeeting = useCallback(
    (meetLink) => {
      if (meetLink) {
        window.open(meetLink, '_blank');
        toast({
          title: 'Joining meeting...',
          description: 'Opening Google Meet link',
        });
      }
    },
    [toast]
  );

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
    setSelectedSlot(slotInfo);
    setCreateEventModalOpen(true);
  }, []);

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
      (creatorFilter === 'me' && meeting.creatorId === currentUser.id) ||
      (creatorFilter === 'team' && meeting.creatorId !== currentUser.id);

    return matchesSearch && matchesMeetLink && matchesCreator;
  });

  const myMeetings = filteredMeetings?.filter(
    (m) => m.creatorId === currentUser.id
  );
  const teamMeetings = filteredMeetings?.filter(
    (m) => m.creatorId !== currentUser.id
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

  // Mock attendees for now

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [meetingReminders, setMeetingReminders] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();

    const eventData = {
      title,
      description,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      addMeetingLink,
      teamId: currentTeam?.id,
      attendees: selectedAttendees.map((id) => id),
      recurrence: isRecurring ? recurrence : undefined,
      courseId: isCourseEvent ? selectedCourseId : undefined,
    };

    handleCreateEvent(eventData);
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

  // Group events
  const todayEvents = events?.filter((event) => isToday(event.start));
  const weekEvents = events?.filter((event) => isThisWeek(event.start));
  const monthEvents = events?.filter((event) => isThisMonth(event.start));
  const getDateLabel = (date) => {
    const m = moment(date);
    if (m.isSame(moment(), 'day')) return 'Today';
    if (m.isSame(moment().add(1, 'day'), 'day')) return 'Tomorrow';
    // Example: Friday, Sep 27
    return m.format('dddd, MMM D');
  };
  const MeetingCard = ({ meeting }) => (
    <div
      className="group cursor-pointer w-full"
      onClick={() => handleEventClick(meeting)}
    >
      <Card
        className={`shadow-xs hover:shadow-elegant transition-smooth border-l-4
       `}
      >
        <CardContent className="p-5">
          {/* Header with time badge */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  meeting.highlight ? 'bg-success' : 'bg-primary'
                }`}
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
            <h3 className="font-semibold text-lg mb-2 text-card-foreground">
              {meeting.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
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
                {meeting.attendees.slice(0, 4).map((attendee, index) => (
                  <UserAvatar user={
                    {firstName: attendee.name.split(' ')[0],}
                  } />
                ))}
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {meeting.attendees.length}{' '}
                {meeting.attendees.length === 1 ? 'Member' : 'Members'}
              </span>
            </div>

            {/* Enhanced arrow button */}
            <button
              className={`p-2 rounded-full transition-smooth group-hover:scale-110 ${
                meeting.highlight
                  ? 'hover:bg-success/20 text-success'
                  : 'hover:bg-primary/20 text-primary'
              }`}
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

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
      <Button onClick={() => setScheduleModalOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Schedule Meeting
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
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-6 py-8"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Meetings
            </h1>
            <p className="text-muted-foreground">
              Manage team schedules & join meetings
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleConnectGoogleCalendar}
              disabled={googleConnected}
            >
              <CalendarDays className="h-4 w-4" />
              Connect Google Calendar
            </Button>

            <Dialog open={connectModalOpen} onOpenChange={setConnectModalOpen}>
              <DialogTrigger asChild></DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Connect Google Calendar</DialogTitle>
                </DialogHeader>
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
              </DialogContent>
            </Dialog>

            <Button
              className="flex items-center gap-2"
              onClick={() => setCreateEventModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Schedule Meeting
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button
              variant="success"
              className="flex items-center gap-2"
              onClick={() => setOpenFilters(!openFilters)}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
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
              <TabsList className="grid w-full grid-cols-3 mb-6">
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
                          {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                          ) : (
                            <BigCalendar
                              localizer={localizer}
                              events={events}
                              startAccessor="start"
                              endAccessor="end"
                              titleAccessor="title"
                              view={calendarView}
                              onView={setCalendarView}
                              onSelectEvent={handleEventClick}
                              onSelectSlot={handleSelectSlot}
                              selectable
                              resizable
                              className=""
                              draggableAccessor={() => true}
                              onEventDrop={async ({ event, start, end }) => {
                                // Handle drag and drop
                                toast({
                                  title: 'Event moved',
                                  description: 'Event time updated',
                                });
                              }}
                              onEventResize={async ({ event, start, end }) => {
                                // Handle resize
                                toast({
                                  title: 'Event resized',
                                  description: 'Event duration updated',
                                });
                              }}
                              eventPropGetter={(event) => ({
                                style: {
                                  // backgroundColor: event.hasMeetLink
                                  //   ? '#10b981'
                                  //   : '#3b82f6',
                                  borderRadius: '5px',
                                  border: 'none',
                                  color: 'white',
                                  padding: '8px 8px',
                                },
                              })}
                              style={{ height: '100%' }}
                            />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="my-meetings" className="mt-0">
                  <div className="space-y-4  overflow-y-auto">
                    {events && events?.length > 0 ? (
                      <>
                        {todayEvents.length > 0 && (
                          <>
                            <h3 className="text-lg font-semibold mb-2">
                              Today
                            </h3>
                            <div className="grid grid-cols-4 gap-6 mb-6">
                              {todayEvents.map((event) => (
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
                            <div className="grid grid-cols-4 gap-6 mb-6">
                              {weekEvents.map((event) => (
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
                            <div className="grid grid-cols-4 gap-6 mb-6">
                              {monthEvents.map((event) => (
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
                    {teamMeetings && teamMeetings?.length > 0 && currentTeam ? (
                      teamMeetings
                        ?.filter((meeting) => meeting.teamId === currentTeam.id)
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
      <div className="text-xl font-semibold">{selectedEvent?.title}</div>
      <p className="text-muted-foreground mt-1">{selectedEvent?.description}</p>
    
      {selectedEvent?.courseName && (
        <div className="text-xs mt-1">
          <strong>Course:</strong> {selectedEvent.courseName}
        </div>
      )}
      {selectedEvent?.googleEventId && (
        <div className="text-xs mt-1">
          <strong>Google Event ID:</strong> {selectedEvent.googleEventId}
        </div>
      )}
      {selectedEvent?.ownerId && (
        <div className="text-xs mt-1">
          <strong>Owner ID:</strong> {selectedEvent.ownerId}
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
                ? moment(selectedEvent.startTime).format('MMMM DD, YYYY')
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
              {selectedEvent?.location || (selectedEvent?.isOnlineEvent ? 'Online' : '—')}
            </p>
          </div>
        </div>

 {selectedEvent?.meetLink && (
  <div className="flex items-center gap-3 p-4 rounded-lg border border-green-200 bg-green-50">
    <Video className="h-5 w-5 text-green-600" />
    <span className="text-sm font-medium text-green-800">
      Google Meet link available
    </span>
    <a
      href={selectedEvent.meetLink}
      target="_blank"
      rel="noopener noreferrer"
      className="ml-auto"
    >
      <Button
        size="sm"
        variant="outline"
        className="border-green-300 text-green-700 hover:bg-green-100"
      >
        Join Meeting
        <ExternalLink className="h-4 w-4 ml-1" />
      </Button>
    </a>
  </div>
)}
      </div>

      <div className="space-y-4">
        {/* Attendees by role */}
        {selectedEvent?.attendeesObj && selectedEvent.attendeesObj.length > 0 && (
          <>
            <div>
              <h4 className="font-medium mb-2">Attendees</h4>
              <div className="flex flex-col gap-2">
                {/* Students */}
                {selectedEvent.attendeesObj.some(a => a.role === 'Student') && (
                  <div>
                    <div className="text-xs font-semibold mb-1">Students</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.attendeesObj
                        .filter(a => a.role === 'Student')
                        .map((attendee) => (
                          <div
                            key={attendee.id}
                            className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full"
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {attendee.name
                                  ? attendee.name.substring(0, 2).toUpperCase()
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
                {selectedEvent.attendeesObj.some(a => a.role === 'Tutor') && (
                  <div>
                    <div className="text-xs font-semibold mb-1">Tutors</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.attendeesObj
                        .filter(a => a.role === 'Tutor')
                        .map((attendee) => (
                          <div
                            key={attendee.id}
                            className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full"
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {attendee.name
                                  ? attendee.name.substring(0, 2).toUpperCase()
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
              {selectedEvent.guests.map((guest, idx) => (
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

        {/* Tags */}
        {selectedEvent?.tags && selectedEvent.tags.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {selectedEvent.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="capitalize"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>

    <Separator />

    <div className="flex flex-wrap gap-3 pt-12">
      {selectedEvent?.meetLink && (
        <Button onClick={() => handleJoinMeeting(selectedEvent.meetLink)}>
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
        <Dialog
          open={createEventModalOpen}
          onOpenChange={(open) => {
            setCreateEventModalOpen(open);
            setSelectedAttendees([]);
            setSelectedCourse(null);
          }}
        >
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="flex items-center space-x-2 mt-4 mb-3">
                <Switch
                  id="add-meet-link"
                  checked={addMeetingLink}
                  onCheckedChange={setAddMeetingLink}
                />
                <Label htmlFor="add-meet-link">Add Google Meet link</Label>
              </div>
              <div className="z-[999999]">
                <Label>Attendees</Label>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {selectedAttendees.length > 0 ? (
                    selectedAttendees.map((id) => {
                      const user = usersData?.find((u) => u.id === id);
                      console.log('Attendee user:', user);
                      return (
                        <div
                          key={id}
                          className="flex items-center gap-1 cursor-pointer"
                        >
                          <UserAvatar user={user} />
                          <span className="text-sm">{user?.name}</span>
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
                  <Dialog
                    open={attendeeDialogOpen}
                    onOpenChange={setAttendeeDialogOpen}
                  >
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Select Attendees</DialogTitle>
                      </DialogHeader>
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
                                {usersData?.map((user) => (
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
                    </DialogContent>
                  </Dialog>
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
          </DialogContent>
        </Dialog>
        <Dialog open={guestDialogOpen} onOpenChange={setGuestDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>
                {editingGuestIndex !== null ? 'Edit Guest' : 'Add Guest'}
              </DialogTitle>
            </DialogHeader>
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
          </DialogContent>
        </Dialog>
        {/* Schedule Meeting Modal (Legacy - keeping for compatibility) */}
        <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Meeting</DialogTitle>
            </DialogHeader>
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
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default Meetings;
