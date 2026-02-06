import { useEffect, useState } from 'react';
import {
  Video,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  MessageSquare,
  Star,
  ExternalLink,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useMentorship } from '@/components/mentorship/MentorshipContext';
import { MentorshipSession, SessionStatus } from '@/types/mentorship';

const statusConfig: Record<
  SessionStatus,
  { label: string; icon: React.ElementType; color: string }
> = {
  scheduled: {
    label: 'Scheduled',
    icon: Clock,
    color: 'text-blue-600 bg-blue-100',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    color: 'text-green-600 bg-green-100',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    color: 'text-red-600 bg-red-100',
  },
  no_show: {
    label: 'No Show',
    icon: AlertCircle,
    color: 'text-amber-600 bg-amber-100',
  },
};

export function StudentSessionsPage() {
  const { sessions, fetchSessions, updateSession, loading } = useMentorship();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [feedbackSession, setFeedbackSession] =
    useState<MentorshipSession | null>(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const now = new Date();

  const upcomingSessions = sessions
    .filter((s) => s.status === 'scheduled' && new Date(s.scheduledAt) > now)
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );

  const pastSessions = sessions
    .filter(
      (s) =>
        s.status === 'completed' ||
        s.status === 'cancelled' ||
        s.status === 'no_show' ||
        (s.status === 'scheduled' && new Date(s.scheduledAt) <= now)
    )
    .sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
    );

  const handleSubmitFeedback = async () => {
    if (!feedbackSession || rating === 0) return;

    setSubmitting(true);
    try {
      await updateSession(feedbackSession.id, {
        menteeFeedback: feedback,
        rating: rating,
      });
      setFeedbackSession(null);
      setFeedback('');
      setRating(0);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  const renderSessionCard = (
    session: MentorshipSession,
    showFeedback = false
  ) => {
    const status = statusConfig[session.status];
    const StatusIcon = status.icon;
    const isUpcoming =
      session.status === 'scheduled' && new Date(session.scheduledAt) > now;
    const canProvideFeedback =
      session.status === 'completed' &&
      !session.menteeFeedback &&
      !session.rating;

    return (
      <Card key={session.id}>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold">{session.title}</h4>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(session.scheduledAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(session.scheduledAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span>• {session.duration} min</span>
                </div>
                {session.mentor && (
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={session.mentor.user.avatar} />
                      <AvatarFallback className="text-xs">
                        {session.mentor.user.firstName[0]}
                        {session.mentor.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {session.mentor.user.firstName}{' '}
                      {session.mentor.user.lastName}
                    </span>
                  </div>
                )}
                {session.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {session.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <Badge className={status.color}>
                <StatusIcon className="mr-1 h-3 w-3" />
                {status.label}
              </Badge>

              <div className="flex gap-2">
                {isUpcoming && session.meetingLink && (
                  <Button size="sm" asChild>
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-1 h-3.5 w-3.5" />
                      Join
                    </a>
                  </Button>
                )}
                {canProvideFeedback && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setFeedbackSession(session)}
                  >
                    <Star className="mr-1 h-3.5 w-3.5" />
                    Give Feedback
                  </Button>
                )}
              </div>

              {session.rating && (
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= session.rating!
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {session.agenda && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <h5 className="text-sm font-medium mb-1">Agenda</h5>
              <p className="text-sm text-muted-foreground">{session.agenda}</p>
            </div>
          )}

          {session.notes && showFeedback && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <h5 className="text-sm font-medium mb-1">Session Notes</h5>
              <p className="text-sm text-muted-foreground">{session.notes}</p>
            </div>
          )}

          {session.menteeFeedback && showFeedback && (
            <div className="mt-4 p-3 bg-primary/5 rounded-lg">
              <h5 className="text-sm font-medium mb-1">Your Feedback</h5>
              <p className="text-sm text-muted-foreground">
                {session.menteeFeedback}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Sessions</h1>
        <p className="text-muted-foreground">
          View and manage your mentorship sessions
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{upcomingSessions.length}</p>
              <p className="text-sm text-muted-foreground">Upcoming</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {sessions.filter((s) => s.status === 'completed').length}
              </p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
              <Star className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {
                  sessions.filter((s) => s.status === 'completed' && !s.rating)
                    .length
                }
              </p>
              <p className="text-sm text-muted-foreground">Needs Feedback</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Video className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{sessions.length}</p>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Upcoming ({upcomingSessions.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Past ({pastSessions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 space-y-4">
          {upcomingSessions.length > 0 ? (
            upcomingSessions.map((session) => renderSessionCard(session))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  No Upcoming Sessions
                </h3>
                <p className="text-muted-foreground">
                  You don't have any scheduled sessions. Contact your mentor to
                  schedule one.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4 space-y-4">
          {pastSessions.length > 0 ? (
            pastSessions.map((session) => renderSessionCard(session, true))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Past Sessions</h3>
                <p className="text-muted-foreground">
                  Your completed sessions will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Feedback Dialog */}
      <Dialog
        open={!!feedbackSession}
        onOpenChange={() => setFeedbackSession(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session Feedback</DialogTitle>
            <DialogDescription>
              Share your feedback for "{feedbackSession?.title}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Rating *</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= rating
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-muted-foreground hover:text-amber-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback (optional)</Label>
              <Textarea
                id="feedback"
                placeholder="What did you learn? How was the session helpful?"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackSession(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitFeedback}
              disabled={rating === 0 || submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
