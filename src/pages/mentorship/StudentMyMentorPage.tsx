import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  User,
  Calendar,
  Star,
  MessageSquare,
  Video,
  Linkedin,
  Mail,
  Clock,
  Target,
  Briefcase,
  CheckCircle,
  Users,
  FileText,
  ChevronRight,
  AlertCircle,
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
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiService, endpoints } from '@/lib/api';

// Type for the API response
interface MenteeRequestResponse {
  id: string;
  mentee: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture: string;
    role: string;
  };
  requestedExpertise: string[];
  goals: string;
  preferredMeetingFrequency: string;
  additionalNotes: string;
  status: 'PENDING' | 'MATCHED' | 'REJECTED' | 'CANCELLED';
  assignedMentor: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture: string;
    isMentor: boolean;
    expertise: string[];
    yearsOfExperience: number;
    maxMentees: number;
    currentMenteeCount: number;
    preferredMeetingFrequency: string;
    mentorBio: string;
    role: string;
  } | null;
  reviewedBy: {
    firstName: string;
    lastName: string;
  } | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  createdAt: string;
}

const getStatusBadge = (status: string) => {
  const statusLower = status?.toLowerCase();
  switch (statusLower) {
    case 'matched':
      return (
        <Badge className="bg-green-500 text-white">
          <CheckCircle className="h-3 w-3 mr-1" />
          Matched
        </Badge>
      );
    case 'pending':
      return (
        <Badge className="bg-amber-500 text-white">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      );
    case 'cancelled':
      return <Badge variant="secondary">Cancelled</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export function StudentMyMentorPage() {
  const [selectedRequest, setSelectedRequest] =
    useState<MenteeRequestResponse | null>(null);

  // Fetch mentee requests for the current student
  const {
    data: requests,
    isLoading,
    error,
  } = useQuery<MenteeRequestResponse[]>({
    queryKey: ['menteeRequests', 'byMentee'],
    queryFn: async () => {
      const response = await apiService.get(
        endpoints.getMenteeRequestsByMentee
      );
      return response.data;
    },
  });

  useEffect(() => {
    // Select the first matched request by default, or the first request
    if (requests && requests.length > 0 && !selectedRequest) {
      const matchedRequest = requests.find(
        (r) => r.status?.toLowerCase() === 'matched' && r.assignedMentor
      );
      setSelectedRequest(matchedRequest || requests[0]);
    }
  }, [requests, selectedRequest]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Mentors</h1>
          <p className="text-muted-foreground">
            View your mentorship requests and assigned mentors
          </p>
        </div>
        <Card className="max-w-lg mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
            <p className="text-muted-foreground">
              Failed to load your mentorship requests. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Mentors</h1>
          <p className="text-muted-foreground">
            View your mentorship requests and assigned mentors
          </p>
        </div>

        <Card className="max-w-lg mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              No Mentorship Requests Yet
            </h3>
            <p className="text-muted-foreground mb-4">
              You haven't submitted any mentorship requests. Find a mentor to
              get started on your learning journey.
            </p>
            <Button asChild>
              <a href="/admin/mentorship">Find a Mentor</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Stats
  const totalRequests = requests.length;
  const matchedRequests = requests.filter(
    (r) => r.status?.toLowerCase() === 'matched'
  ).length;
  const pendingRequests = requests.filter(
    (r) => r.status?.toLowerCase() === 'pending'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Mentors</h1>
          <p className="text-muted-foreground">
            View your mentorship requests and assigned mentors
          </p>
        </div>
        <Button asChild>
          <a href="/student/mentorship">
            <User className="h-4 w-4 mr-2" />
            Find New Mentor
          </a>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Mentorships
            </CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {matchedRequests}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {pendingRequests}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Requests List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">My Requests</CardTitle>
            <CardDescription>
              Click on a request to view details
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {requests.map((request) => (
                <button
                  key={request.id}
                  onClick={() => setSelectedRequest(request)}
                  className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                    selectedRequest?.id === request.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {request.assignedMentor ? (
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage
                            src={request.assignedMentor.profilePicture}
                          />
                          <AvatarFallback>
                            {request.assignedMentor.firstName?.[0]}
                            {request.assignedMentor.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {request.assignedMentor
                            ? `${request.assignedMentor.firstName} ${request.assignedMentor.lastName}`
                            : 'Awaiting Match'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {request.requestedExpertise?.slice(0, 2).join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {getStatusBadge(request.status)}
                      <span className="text-xs text-muted-foreground">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Request Details */}
        <Card className="lg:col-span-2">
          {selectedRequest ? (
            <>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Request Details</CardTitle>
                    <CardDescription>
                      Submitted on{' '}
                      {new Date(selectedRequest.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  {getStatusBadge(selectedRequest.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Assigned Mentor Section */}
                {selectedRequest.assignedMentor ? (
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-primary/5 to-primary/10">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Assigned Mentor
                    </h4>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Avatar className="h-16 w-16 mx-auto sm:mx-0">
                        <AvatarImage
                          src={selectedRequest.assignedMentor.profilePicture}
                        />
                        <AvatarFallback className="text-lg">
                          {selectedRequest.assignedMentor.firstName?.[0]}
                          {selectedRequest.assignedMentor.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-lg font-semibold">
                          {selectedRequest.assignedMentor.firstName}{' '}
                          {selectedRequest.assignedMentor.lastName}
                        </h3>
                        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {
                              selectedRequest.assignedMentor.yearsOfExperience
                            }{' '}
                            years exp.
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {
                              selectedRequest.assignedMentor
                                .preferredMeetingFrequency
                            }
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {selectedRequest.assignedMentor.mentorBio}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedRequest.assignedMentor.expertise
                            ?.slice(0, 4)
                            .map((exp) => (
                              <Badge
                                key={exp}
                                variant="secondary"
                                className="text-xs"
                              >
                                {exp}
                              </Badge>
                            ))}
                        </div>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Message
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="h-3 w-3 mr-1" />
                            Email
                          </Button>
                          <Button size="sm">
                            <Video className="h-3 w-3 mr-1" />
                            Schedule Session
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 border rounded-lg text-center bg-muted/30">
                    <User className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No mentor assigned yet. Your request is being reviewed.
                    </p>
                  </div>
                )}

                {/* Request Info */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Goals
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedRequest.goals || 'No goals specified'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Preferred Frequency
                    </h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {selectedRequest.preferredMeetingFrequency ||
                        'Not specified'}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Requested Expertise
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.requestedExpertise?.map((exp) => (
                      <Badge key={exp} variant="outline">
                        {exp}
                      </Badge>
                    )) || (
                      <span className="text-sm text-muted-foreground">
                        No expertise specified
                      </span>
                    )}
                  </div>
                </div>

                {selectedRequest.additionalNotes && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      Additional Notes
                    </h4>
                    <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                      {selectedRequest.additionalNotes}
                    </p>
                  </div>
                )}

                {/* Review Info */}
                {selectedRequest.reviewedBy && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">
                      Review Information
                    </h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        <strong>Reviewed by:</strong>{' '}
                        {selectedRequest.reviewedBy.firstName}{' '}
                        {selectedRequest.reviewedBy.lastName}
                      </p>
                      {selectedRequest.reviewedAt && (
                        <p>
                          <strong>Reviewed on:</strong>{' '}
                          {new Date(
                            selectedRequest.reviewedAt
                          ).toLocaleDateString()}
                        </p>
                      )}
                      {selectedRequest.reviewNotes && (
                        <p>
                          <strong>Notes:</strong> {selectedRequest.reviewNotes}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <ChevronRight className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                Select a request to view details
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
