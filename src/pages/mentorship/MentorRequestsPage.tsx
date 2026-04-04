import { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  User,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useMentorship } from '@/components/mentorship/MentorshipContext';
import { MenteeRequest, RequestStatus } from '@/types/mentorship';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const statusConfig: Record<
  RequestStatus,
  { label: string; icon: React.ElementType; color: string }
> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  matched: { label: 'Matched', icon: User, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
};

export function MentorRequestsPage() {
  const navigate = useNavigate();
  const { requests, fetchRequests, updateRequest, loading } = useMentorship();

  // Role guard — only Tutor, Mentor, Admin, Super_Admin can manage mentee requests
  useEffect(() => {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
    const role = (user?.role || 'Student').toLowerCase();
    if (!['tutor', 'mentor', 'admin', 'super_admin'].includes(role)) {
      navigate(-1);
    }
  }, [navigate]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<MenteeRequest | null>(
    null
  );
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Helper to safely get user data from mentee (handles both nested and flat structure)
  const getMenteeUser = (request: MenteeRequest) => {
    const mentee = request.mentee as unknown as Record<string, unknown>;
    // Check if it's the flat structure (mentee has firstName directly) or nested (mentee.user)
    if ('firstName' in mentee && typeof mentee.firstName === 'string') {
      return mentee as {
        firstName: string;
        lastName: string;
        email: string;
        avatar?: string;
        profilePicture?: string;
      };
    }
    const user = (mentee as { user?: Record<string, unknown> }).user;
    return (user || mentee) as {
      firstName: string;
      lastName: string;
      email: string;
      avatar?: string;
      profilePicture?: string;
    };
  };

  // Helper to safely get mentor user data (handles both nested and flat structure)
  const getMentorUser = (mentor: MenteeRequest['assignedMentor']) => {
    if (!mentor) return null;
    const m = mentor as unknown as Record<string, unknown>;
    if ('firstName' in m && typeof m.firstName === 'string') {
      return m as {
        firstName: string;
        lastName: string;
        avatar?: string;
        profilePicture?: string;
      };
    }
    const user = (m as { user?: Record<string, unknown> }).user;
    return (user || m) as {
      firstName: string;
      lastName: string;
      avatar?: string;
      profilePicture?: string;
    };
  };

  // Normalize status to lowercase for comparison
  const normalizeStatus = (status: string) =>
    status?.toLowerCase() as RequestStatus;

  const filteredRequests = requests.filter((request) => {
    const user = getMenteeUser(request);
    const matchesSearch =
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.requestedExpertise?.some((e) =>
        e.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const requestStatus = normalizeStatus(request.status);
    const matchesTab = activeTab === 'all' || requestStatus === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleReject = async () => {
    if (!selectedRequest) return;
    await updateRequest(selectedRequest.id, {
      status: 'rejected',
      reviewNotes: rejectReason,
      reviewedAt: new Date().toISOString(),
    });
    setRejectDialogOpen(false);
    setRejectReason('');
    setSelectedRequest(null);
  };

  const handleMatchNow = (request: MenteeRequest) => {
    navigate('/admin/mentorship/matching', {
      state: { requestId: request.id },
    });
  };

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mentee Requests</h1>
          <p className="text-muted-foreground">
            Review and process mentor requests from students
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="destructive" className="text-lg px-3 py-1">
            {pendingCount} pending
          </Badge>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or expertise..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-amber-500 text-white rounded-full">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="matched">Matched</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">No requests found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => {
                const status = normalizeStatus(request.status);
                const statusInfo = statusConfig[status] || statusConfig.pending;
                const StatusIcon = statusInfo.icon;
                const user = getMenteeUser(request);
                return (
                  <Card
                    key={request.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={user.avatar || user.profilePicture}
                            />
                            <AvatarFallback>
                              {user.firstName?.[0]}
                              {user.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">
                                {user.firstName} {user.lastName}
                              </h3>
                              <Badge className={statusInfo.color}>
                                <StatusIcon className="mr-1 h-3 w-3" />
                                {statusInfo.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {request.requestedExpertise.map((exp) => (
                                <Badge
                                  key={exp}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {exp}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-sm mt-2">
                              <span className="font-medium">Goals:</span>{' '}
                              {request.goals}
                            </p>
                            {request.additionalNotes && (
                              <p className="text-sm text-muted-foreground mt-1">
                                <span className="font-medium">Notes:</span>{' '}
                                {request.additionalNotes}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Submitted{' '}
                              {format(
                                new Date(request.createdAt),
                                'MMM d, yyyy'
                              )}{' '}
                              • Prefers{' '}
                              {request.preferredMeetingFrequency.toLowerCase()}{' '}
                              meetings
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {status === 'pending' && (
                            <>
                              <Button onClick={() => handleMatchNow(request)}>
                                Match Now{' '}
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setRejectDialogOpen(true);
                                }}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                              </Button>
                            </>
                          )}
                          {status === 'matched' &&
                            request.assignedMentor &&
                            (() => {
                              const mentorUser = getMentorUser(
                                request.assignedMentor
                              );
                              if (!mentorUser) return null;
                              return (
                                <div className="text-right">
                                  <p className="text-sm font-medium">
                                    Matched with
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage
                                        src={
                                          mentorUser.avatar ||
                                          mentorUser.profilePicture
                                        }
                                      />
                                      <AvatarFallback>
                                        {mentorUser.firstName?.[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">
                                      {mentorUser.firstName}{' '}
                                      {mentorUser.lastName}
                                    </span>
                                  </div>
                                </div>
                              );
                            })()}
                          {status === 'rejected' && request.reviewNotes && (
                            <p className="text-sm text-muted-foreground max-w-xs text-right">
                              {request.reviewNotes}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this mentorship request.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter reason for rejection..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
