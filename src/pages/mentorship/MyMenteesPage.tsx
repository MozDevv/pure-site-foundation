import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  User,
  Calendar,
  MessageSquare,
  Video,
  Mail,
  Clock,
  Target,
  Briefcase,
  CheckCircle,
  Users,
  FileText,
  ChevronRight,
  AlertCircle,
  GraduationCap,
  MapPin,
  Phone,
  Code,
  Sparkles,
  BookOpen,
  Link as LinkIcon,
  Globe,
  Star,
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
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiService, endpoints } from '@/lib/api';

// Type for the API response
interface UserProfile {
  id: string;
  educationLevel: string;
  fieldOfStudy: string;
  institutionName: string;
  programmingExperience: string;
  programmingLanguages: string;
  techInterests: string;
  motivation: string;
  careerGoals: string;
  availableHours: string;
  portfolioLinks: string;
  hearAboutUs: string;
  additionalInfo: string;
  agreeTerms: boolean;
  receiveUpdates: boolean;
}

interface MenteeUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  age: string;
  location: string;
  email: string;
  profilePicture: string;
  isMentor: boolean;
  expertise: string[];
  yearsOfExperience: number;
  createdAt: string;
  updatedAt: string;
  status: string;
  userProfile: UserProfile | null;
  role: string;
}

interface MenteeRequestResponse {
  id: string;
  mentee: MenteeUser;
  requestedExpertise: string[];
  goals: string;
  preferredMeetingFrequency: string;
  additionalNotes: string;
  status: 'PENDING' | 'MATCHED' | 'REJECTED' | 'CANCELLED';
  assignedMentor: MenteeUser | null;
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
          Active
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
          Ended
        </Badge>
      );
    case 'cancelled':
      return <Badge variant="secondary">Cancelled</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export function MyMenteesPage() {
  const [selectedMentee, setSelectedMentee] =
    useState<MenteeRequestResponse | null>(null);

  // Fetch mentee requests for the current mentor
  const {
    data: menteeRequests,
    isLoading,
    error,
  } = useQuery<MenteeRequestResponse[]>({
    queryKey: ['menteeRequests', 'byMentor'],
    queryFn: async () => {
      const response = await apiService.get(
        endpoints.getMenteeRequestsByMentor
      );
      return response.data;
    },
  });

  useEffect(() => {
    // Select the first mentee by default
    if (menteeRequests && menteeRequests.length > 0 && !selectedMentee) {
      setSelectedMentee(menteeRequests[0]);
    }
  }, [menteeRequests, selectedMentee]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96" />
          <Skeleton className="h-96 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Mentees</h1>
          <p className="text-muted-foreground">
            View and manage your assigned mentees
          </p>
        </div>
        <Card className="max-w-lg mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
            <p className="text-muted-foreground">
              Failed to load your mentees. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!menteeRequests || menteeRequests.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Mentees</h1>
          <p className="text-muted-foreground">
            View and manage your assigned mentees
          </p>
        </div>

        <Card className="max-w-lg mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Mentees Yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't been assigned any mentees yet. New mentorship requests
              will appear here once they're matched to you.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Stats
  const totalMentees = menteeRequests.length;
  const activeMentees = menteeRequests.filter(
    (r) => r.status?.toLowerCase() === 'matched'
  ).length;
  const pendingMentees = menteeRequests.filter(
    (r) => r.status?.toLowerCase() === 'pending'
  ).length;

  // Get unique expertise areas requested
  const allExpertise = menteeRequests.flatMap(
    (r) => r.requestedExpertise || []
  );
  const uniqueExpertise = [...new Set(allExpertise)];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Mentees</h1>
        <p className="text-muted-foreground">
          View and manage your assigned mentees
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Mentees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMentees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeMentees}
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
              {pendingMentees}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Topics</CardTitle>
            <Sparkles className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {uniqueExpertise.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Mentees List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Your Mentees</CardTitle>
            <CardDescription>
              Click on a mentee to view their details
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="divide-y">
                {menteeRequests.map((request) => (
                  <button
                    key={request.id}
                    onClick={() => setSelectedMentee(request)}
                    className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                      selectedMentee?.id === request.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage src={request.mentee?.profilePicture} />
                        <AvatarFallback>
                          {request.mentee?.firstName?.[0]}
                          {request.mentee?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium truncate">
                            {request.mentee?.firstName}{' '}
                            {request.mentee?.lastName}
                          </p>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {request.mentee?.email}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {request.requestedExpertise
                            ?.slice(0, 2)
                            .map((exp) => (
                              <Badge
                                key={exp}
                                variant="outline"
                                className="text-xs py-0"
                              >
                                {exp}
                              </Badge>
                            ))}
                          {(request.requestedExpertise?.length || 0) > 2 && (
                            <Badge variant="outline" className="text-xs py-0">
                              +{request.requestedExpertise.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Mentee Details */}
        <Card className="lg:col-span-2">
          {selectedMentee ? (
            <ScrollArea className="h-[700px]">
              <CardHeader className="sticky top-0 bg-card z-10 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={selectedMentee.mentee?.profilePicture}
                      />
                      <AvatarFallback className="text-lg">
                        {selectedMentee.mentee?.firstName?.[0]}
                        {selectedMentee.mentee?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">
                        {selectedMentee.mentee?.firstName}{' '}
                        {selectedMentee.mentee?.lastName}
                      </CardTitle>
                      <CardDescription>
                        @{selectedMentee.mentee?.username} • Joined{' '}
                        {new Date(
                          selectedMentee.mentee?.createdAt
                        ).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(selectedMentee.status)}
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button size="sm" variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                  <Button size="sm" variant="outline">
                    <Video className="h-4 w-4 mr-2" />
                    Schedule Session
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pt-6">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="profile">Full Profile</TabsTrigger>
                    <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-6 mt-6">
                    {/* Contact Info */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Contact Information
                      </h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">
                              Email
                            </p>
                            <p className="text-sm font-medium truncate">
                              {selectedMentee.mentee?.email || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Phone
                            </p>
                            <p className="text-sm font-medium">
                              {selectedMentee.mentee?.phoneNumber || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Location
                            </p>
                            <p className="text-sm font-medium">
                              {selectedMentee.mentee?.location || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Age</p>
                            <p className="text-sm font-medium">
                              {selectedMentee.mentee?.age || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Mentorship Goals */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Mentorship Goals
                      </h4>
                      <div className="p-4 rounded-lg border bg-gradient-to-r from-primary/5 to-primary/10">
                        <p className="text-sm">
                          {selectedMentee.goals || 'No specific goals provided'}
                        </p>
                      </div>
                    </div>

                    {/* Requested Expertise */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Topics They Want to Learn
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMentee.requestedExpertise?.map((exp) => (
                          <Badge
                            key={exp}
                            className="bg-primary/10 text-primary"
                          >
                            {exp}
                          </Badge>
                        )) || (
                          <span className="text-sm text-muted-foreground">
                            No topics specified
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Meeting Preferences */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Meeting Preferences
                      </h4>
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm font-medium capitalize">
                          {selectedMentee.preferredMeetingFrequency ||
                            'Not specified'}
                        </span>
                      </div>
                    </div>

                    {/* Additional Notes */}
                    {selectedMentee.additionalNotes && (
                      <div>
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Additional Notes
                        </h4>
                        <div className="p-4 rounded-lg border bg-muted/30">
                          <p className="text-sm text-muted-foreground">
                            {selectedMentee.additionalNotes}
                          </p>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Full Profile Tab */}
                  <TabsContent value="profile" className="space-y-6 mt-6">
                    {selectedMentee.mentee?.userProfile ? (
                      <>
                        {/* Education */}
                        <div>
                          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            Education
                          </h4>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="p-4 rounded-lg border">
                              <p className="text-xs text-muted-foreground mb-1">
                                Education Level
                              </p>
                              <p className="font-medium">
                                {selectedMentee.mentee.userProfile
                                  .educationLevel || 'N/A'}
                              </p>
                            </div>
                            <div className="p-4 rounded-lg border">
                              <p className="text-xs text-muted-foreground mb-1">
                                Field of Study
                              </p>
                              <p className="font-medium">
                                {selectedMentee.mentee.userProfile
                                  .fieldOfStudy || 'N/A'}
                              </p>
                            </div>
                            <div className="p-4 rounded-lg border sm:col-span-2">
                              <p className="text-xs text-muted-foreground mb-1">
                                Institution
                              </p>
                              <p className="font-medium">
                                {selectedMentee.mentee.userProfile
                                  .institutionName || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Programming Experience */}
                        <div>
                          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            Technical Background
                          </h4>
                          <div className="space-y-4">
                            <div className="p-4 rounded-lg border">
                              <p className="text-xs text-muted-foreground mb-1">
                                Programming Experience
                              </p>
                              <p className="font-medium">
                                {selectedMentee.mentee.userProfile
                                  .programmingExperience || 'N/A'}
                              </p>
                            </div>
                            <div className="p-4 rounded-lg border">
                              <p className="text-xs text-muted-foreground mb-2">
                                Programming Languages
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {selectedMentee.mentee.userProfile.programmingLanguages
                                  ?.split(',')
                                  .map((lang) => (
                                    <Badge
                                      key={lang.trim()}
                                      variant="secondary"
                                    >
                                      {lang.trim()}
                                    </Badge>
                                  )) || (
                                  <span className="text-muted-foreground">
                                    None specified
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="p-4 rounded-lg border">
                              <p className="text-xs text-muted-foreground mb-2">
                                Tech Interests
                              </p>
                              <p className="text-sm">
                                {selectedMentee.mentee.userProfile
                                  .techInterests || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Goals & Motivation */}
                        <div>
                          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            Goals & Motivation
                          </h4>
                          <div className="space-y-4">
                            <div className="p-4 rounded-lg border bg-gradient-to-r from-amber-500/5 to-orange-500/5">
                              <p className="text-xs text-muted-foreground mb-2">
                                Career Goals
                              </p>
                              <p className="text-sm">
                                {selectedMentee.mentee.userProfile
                                  .careerGoals || 'N/A'}
                              </p>
                            </div>
                            <div className="p-4 rounded-lg border bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
                              <p className="text-xs text-muted-foreground mb-2">
                                Motivation
                              </p>
                              <p className="text-sm">
                                {selectedMentee.mentee.userProfile.motivation ||
                                  'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Availability & Links */}
                        <div>
                          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Availability & Links
                          </h4>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="p-4 rounded-lg border">
                              <p className="text-xs text-muted-foreground mb-1">
                                Available Hours per Week
                              </p>
                              <p className="font-medium">
                                {selectedMentee.mentee.userProfile
                                  .availableHours || 'N/A'}
                              </p>
                            </div>
                            <div className="p-4 rounded-lg border">
                              <p className="text-xs text-muted-foreground mb-1">
                                How They Found Us
                              </p>
                              <p className="font-medium">
                                {selectedMentee.mentee.userProfile
                                  .hearAboutUs || 'N/A'}
                              </p>
                            </div>
                            {selectedMentee.mentee.userProfile
                              .portfolioLinks && (
                              <div className="p-4 rounded-lg border sm:col-span-2">
                                <p className="text-xs text-muted-foreground mb-2">
                                  Portfolio Links
                                </p>
                                <div className="flex items-center gap-2">
                                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                  <a
                                    href={
                                      selectedMentee.mentee.userProfile
                                        .portfolioLinks
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline"
                                  >
                                    {
                                      selectedMentee.mentee.userProfile
                                        .portfolioLinks
                                    }
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Additional Info */}
                        {selectedMentee.mentee.userProfile.additionalInfo && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Additional Information
                              </h4>
                              <div className="p-4 rounded-lg border bg-muted/30">
                                <p className="text-sm">
                                  {
                                    selectedMentee.mentee.userProfile
                                      .additionalInfo
                                  }
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <User className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          No Profile Details
                        </h3>
                        <p className="text-muted-foreground">
                          This mentee hasn't completed their full profile yet.
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Mentorship Tab */}
                  <TabsContent value="mentorship" className="space-y-6 mt-6">
                    {/* Request Timeline */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Request Timeline
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">Request Submitted</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(
                                selectedMentee.createdAt
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {selectedMentee.reviewedAt && (
                          <div className="flex items-start gap-4">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                              <BookOpen className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">Request Reviewed</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(
                                  selectedMentee.reviewedAt
                                ).toLocaleString()}
                                {selectedMentee.reviewedBy && (
                                  <span>
                                    {' '}
                                    by {
                                      selectedMentee.reviewedBy.firstName
                                    }{' '}
                                    {selectedMentee.reviewedBy.lastName}
                                  </span>
                                )}
                              </p>
                              {selectedMentee.reviewNotes && (
                                <p className="text-sm mt-1 p-2 bg-muted rounded">
                                  "{selectedMentee.reviewNotes}"
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {selectedMentee.status?.toLowerCase() === 'matched' && (
                          <div className="flex items-start gap-4">
                            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                              <Users className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium">Matched with You</p>
                              <p className="text-sm text-muted-foreground">
                                Mentorship is now active
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Quick Actions */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">
                        Quick Actions
                      </h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Button
                          variant="outline"
                          className="justify-start h-auto py-4"
                        >
                          <Video className="h-5 w-5 mr-3" />
                          <div className="text-left">
                            <p className="font-medium">Schedule a Session</p>
                            <p className="text-xs text-muted-foreground">
                              Set up a video call with your mentee
                            </p>
                          </div>
                        </Button>
                        <Button
                          variant="outline"
                          className="justify-start h-auto py-4"
                        >
                          <Target className="h-5 w-5 mr-3" />
                          <div className="text-left">
                            <p className="font-medium">Set Goals</p>
                            <p className="text-xs text-muted-foreground">
                              Define milestones and objectives
                            </p>
                          </div>
                        </Button>
                        <Button
                          variant="outline"
                          className="justify-start h-auto py-4"
                        >
                          <FileText className="h-5 w-5 mr-3" />
                          <div className="text-left">
                            <p className="font-medium">Add Notes</p>
                            <p className="text-xs text-muted-foreground">
                              Record progress and observations
                            </p>
                          </div>
                        </Button>
                        <Button
                          variant="outline"
                          className="justify-start h-auto py-4"
                        >
                          <BookOpen className="h-5 w-5 mr-3" />
                          <div className="text-left">
                            <p className="font-medium">Share Resources</p>
                            <p className="text-xs text-muted-foreground">
                              Send learning materials
                            </p>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </ScrollArea>
          ) : (
            <CardContent className="flex flex-col items-center justify-center py-24 text-center">
              <ChevronRight className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                Select a mentee to view their details
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
