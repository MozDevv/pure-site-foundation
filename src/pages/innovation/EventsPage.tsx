import { useEffect, useState } from 'react';
import { Trophy, Calendar, Users, Plus, Clock, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useInnovation } from '@/components/innovation-hub/InnovationContext';
import { getEvents, Event } from '@/lib/innovation-hub-data';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const statusColors: Record<Event['status'], string> = {
  upcoming: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-gray-100 text-gray-700',
};

export function EventsPage() {
  const { currentUser } = useInnovation();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const eventsData = await getEvents();
      setEvents(eventsData);
      setLoading(false);
    };
    loadData();
  }, []);

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
              <Button className="bg-blue-600 hover:bg-blue-700"><Plus className="h-4 w-4 mr-2" />Create Event</Button>
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
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">Join Now</Button>
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
                    <Button variant="outline" className="w-full">Register</Button>
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
                  <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center"><Trophy className="h-6 w-6 text-gray-400" /></div>
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
