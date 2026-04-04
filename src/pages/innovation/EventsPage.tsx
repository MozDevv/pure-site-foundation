import { useState } from 'react';
import { Trophy, Calendar, Users, Plus, Clock, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useInnovation } from '@/components/innovation-hub/InnovationContext';
import { Event as MockEvent, getEvents } from '@/lib/innovation-hub-data';
import { apiService, endpoints } from '@/lib/api';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface DisplayEvent {
  id: string;
  title: string;
  description: string;
  theme: string;
  start_date: string;
  end_date: string;
  participant_count: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  location?: string;
  meetLink?: string;
}

function computeEventStatus(startTime: string, endTime: string): 'upcoming' | 'ongoing' | 'completed' {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (now < start) return 'upcoming';
  if (now > end) return 'completed';
  return 'ongoing';
}

function mapBackendEvent(event: any): DisplayEvent {
  return {
    id: event.id,
    title: event.title || '',
    description: event.description || '',
    theme: event.courseName || 'General',
    start_date: event.startTime || event.createdAt || '',
    end_date: event.endTime || event.startTime || '',
    participant_count: event.attendeesObj?.length || 0,
    status: computeEventStatus(event.startTime || '', event.endTime || ''),
    location: event.location,
    meetLink: event.meetLink,
  };
}

const statusColors: Record<DisplayEvent['status'], string> = {
  upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ongoing: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  completed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export function EventsPage() {
  const { currentUser } = useInnovation();
  const queryClient = useQueryClient();
  const [joiningEventId, setJoiningEventId] = useState<string | null>(null);

  const { data: events = [], isLoading: loading } = useQuery({
    queryKey: ['innovation-events'],
    queryFn: async () => {
      try {
        const response = await apiService.get(endpoints.getUserEvents);
        return (response.data || []).map(mapBackendEvent);
      } catch {
        const eventsData = await getEvents();
        return eventsData.map(e => ({ ...e, id: String(e.id) }));
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleJoinEvent = async (eventId: string) => {
    setJoiningEventId(eventId);
    try {
      await apiService.post(endpoints.respondToRsvp(eventId), { response: 'ACCEPTED' });
      toast({ title: 'Joined!', description: 'You have successfully joined this event.' });
      queryClient.invalidateQueries({ queryKey: ['innovation-events'] });
    } catch (error: any) {
      toast({ title: 'Failed to join event', description: error?.response?.data?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setJoiningEventId(null);
    }
  };

  const handleRegisterEvent = async (eventId: string) => {
    setJoiningEventId(eventId);
    try {
      await apiService.post(endpoints.respondToRsvp(eventId), { response: 'ACCEPTED' });
      toast({ title: 'Registered!', description: 'You have successfully registered for this event.' });
      queryClient.invalidateQueries({ queryKey: ['innovation-events'] });
    } catch (error: any) {
      toast({ title: 'Registration failed', description: error?.response?.data?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setJoiningEventId(null);
    }
  };

  const ongoingEvent = events.find(e => e.status === 'ongoing');
  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const pastEvents = events.filter(e => e.status === 'completed');

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Events & Challenges</h1>
              <p className="text-muted-foreground text-sm mt-1">Join hackathons and innovation challenges</p>
            </div>
            {currentUser.role === 'Admin' && (
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null;
                const role = (user?.role || 'Student').toLowerCase();
                const basePath = role === 'student' ? '/student' : role === 'tutor' ? '/tutor' : '/admin';
                window.location.href = `${basePath}/timetable`;
              }}><Plus className="h-4 w-4 mr-2" />Create Event</Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">
        {/* Featured Ongoing Event */}
        {ongoingEvent && (
          <Card className="overflow-hidden border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <Badge className="bg-emerald-500 text-white mb-3">🔥 Happening Now</Badge>
                  <h2 className="text-2xl font-bold text-foreground mb-2">{ongoingEvent.title}</h2>
                  <p className="text-muted-foreground mb-4 max-w-2xl">{ongoingEvent.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{format(new Date(ongoingEvent.end_date), 'MMM d, yyyy')}</span>
                    <span className="flex items-center gap-1"><Users className="h-4 w-4" />{ongoingEvent.participant_count} participants</span>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => ongoingEvent.meetLink ? window.open(ongoingEvent.meetLink, '_blank') : handleJoinEvent(ongoingEvent.id)}
                  disabled={joiningEventId === ongoingEvent.id}
                >
                  {joiningEventId === ongoingEvent.id ? 'Joining...' : 'Join Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Events */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <Card key={i}><CardContent className="p-6"><Skeleton className="h-32" /></CardContent></Card>)}
            </div>
          ) : upcomingEvents.length === 0 ? (
            <Card className="p-8 text-center"><p className="text-muted-foreground">No upcoming events</p></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingEvents.map(event => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <Badge className={cn('mb-3', statusColors[event.status])}>{event.theme}</Badge>
                    <h3 className="font-semibold text-foreground mb-2">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(event.start_date), 'MMM d')}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{event.participant_count}</span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleRegisterEvent(event.id)}
                      disabled={joiningEventId === event.id}
                    >
                      {joiningEventId === event.id ? 'Registering...' : 'Register'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Past Events */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Past Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastEvents.map(event => (
              <Card key={event.id} className="opacity-75">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center"><Trophy className="h-6 w-6 text-muted-foreground" /></div>
                  <div className="flex-1">
                    <h3 className="font-medium">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">{event.participant_count} participants</p>
                  </div>
                  <Badge variant="outline">Completed</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
