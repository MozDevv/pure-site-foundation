import { useEffect, useState } from 'react';
import {
  Search,
  Check,
  X,
  User,
  Calendar,
  FileText,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  SmartDrawer,
  SmartDrawerContent,
  SmartDrawerHeader,
  SmartDrawerTitle,
  SmartDrawerDescription,
} from '@/components/ui/smart-drawer';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { apiService, endpoints } from '@/lib/api';

interface Reviewer {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  profilePicture: string;
  role: string;
}

interface ProjectInfo {
  id: string;
  name: string;
  description: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  teamName: string;
}

interface Approval {
  id: string;
  reviewer: Reviewer;
  action: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  comments: string;
  actionDate: string;
  projectInfo: ProjectInfo;
}

interface ActionPayload {
  comments: string;
  reason: string;
}

const statusConfig: Record<
  string,
  { color: string; icon: React.ReactNode; label: string }
> = {
  DRAFT: {
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    icon: <FileText className="h-3 w-3" />,
    label: 'Draft',
  },
  SUBMITTED: {
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: <Clock className="h-3 w-3" />,
    label: 'Submitted',
  },
  UNDER_REVIEW: {
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon: <AlertCircle className="h-3 w-3" />,
    label: 'Under Review',
  },
  APPROVED: {
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    icon: <CheckCircle2 className="h-3 w-3" />,
    label: 'Approved',
  },
  REJECTED: {
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: <XCircle className="h-3 w-3" />,
    label: 'Rejected',
  },
};

const actionConfig: Record<string, { color: string; label: string }> = {
  SUBMITTED: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'Submitted' },
  APPROVED: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'Approved' },
  REJECTED: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Rejected' },
  UNDER_REVIEW: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: 'Under Review' },
};

export function ReviewsPage() {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null;
  const userRole = (user?.role || 'Student').toLowerCase();
  const isStudent = userRole === 'student';

  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(
    null
  );
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(
    null
  );
  const [actionPayload, setActionPayload] = useState<ActionPayload>({
    comments: '',
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(endpoints.getAllApprovals);
      setApprovals(response.data || []);
    } catch (error) {
      console.error('Failed to fetch approvals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load approvals. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const pendingApprovals = approvals.filter(
    (a) =>
      a.projectInfo.status === 'SUBMITTED' ||
      a.projectInfo.status === 'UNDER_REVIEW'
  );

  const filteredApprovals = approvals.filter((a) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      a.projectInfo.name.toLowerCase().includes(searchLower) ||
      a.projectInfo.teamName?.toLowerCase().includes(searchLower) ||
      a.reviewer?.firstName?.toLowerCase().includes(searchLower) ||
      a.reviewer?.lastName?.toLowerCase().includes(searchLower)
    );
  });

  const handleOpenActionDialog = (type: 'approve' | 'reject') => {
    setActionType(type);
    setActionPayload({ comments: '', reason: '' });
    setActionDialogOpen(true);
  };

  const handleSubmitAction = async () => {
    if (!selectedApproval || !actionType) return;

    setSubmitting(true);
    try {
      const endpoint =
        actionType === 'approve'
          ? endpoints.approveProject(selectedApproval.projectInfo.id)
          : endpoints.rejectProject(selectedApproval.projectInfo.id);

      await apiService.post(endpoint, actionPayload);

      toast({
        title: 'Success',
        description: `Project has been ${
          actionType === 'approve' ? 'approved' : 'rejected'
        } successfully.`,
      });

      setActionDialogOpen(false);
      setSelectedApproval(null);
      fetchApprovals();
    } catch (error) {
      console.error(`Failed to ${actionType} project:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${actionType} project. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const canTakeAction = (status: string) => {
    return status === 'SUBMITTED' || status === 'UNDER_REVIEW';
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Project Reviews
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Review and manage project submissions
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
                <p className="text-2xl font-bold text-primary">
                  {pendingApprovals.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by project name, team, or reviewer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 max-w-md"
          />
        </div>

        {/* Table */}
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : filteredApprovals.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No approvals found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'No project submissions to review yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Reviewer</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApprovals.map((approval) => (
                  <TableRow
                    key={approval.id}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      {approval.projectInfo.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {approval.projectInfo.teamName || 'No Team'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-3 w-3 text-primary" />
                        </div>
                        {approval?.reviewer?.firstName}{' '}
                        {approval?.reviewer?.lastName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          'gap-1',
                          actionConfig[approval.action]?.color
                        )}
                      >
                        {actionConfig[approval.action]?.label ||
                          approval.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          'gap-1',
                          statusConfig[approval.projectInfo.status]?.color
                        )}
                      >
                        {statusConfig[approval.projectInfo.status]?.icon}
                        {statusConfig[approval.projectInfo.status]?.label ||
                          approval.projectInfo.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(approval.actionDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedApproval(approval)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      {/* Project Details Dialog */}
      <SmartDrawer
        open={!!selectedApproval && !actionDialogOpen}
        onOpenChange={() => setSelectedApproval(null)}
      >
        <SmartDrawerContent defaultWidth={768}>
          <SmartDrawerHeader>
            <SmartDrawerTitle className="text-xl">
              Project Review Details
            </SmartDrawerTitle>
            <SmartDrawerDescription>
              Review the project information and take action
            </SmartDrawerDescription>
          </SmartDrawerHeader>

          {selectedApproval && (
            <div className="space-y-6">
              {/* Project Info Card */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {selectedApproval.projectInfo.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {selectedApproval.projectInfo.teamName ||
                            'No Team Assigned'}
                        </span>
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        'gap-1',
                        statusConfig[selectedApproval.projectInfo.status]?.color
                      )}
                    >
                      {statusConfig[selectedApproval.projectInfo.status]?.icon}
                      {statusConfig[selectedApproval.projectInfo.status]?.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Description
                      </Label>
                      <p className="mt-1 text-sm bg-muted/50 p-3 rounded-lg">
                        {selectedApproval.projectInfo.description ||
                          'No description provided'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reviewer Info Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Reviewer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Name
                      </Label>
                      <p className="text-sm mt-1">
                        {selectedApproval?.reviewer?.firstName || 'N/A'}{' '}
                        {selectedApproval?.reviewer?.lastName || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Email
                      </Label>
                      <p className="text-sm mt-1">
                        {selectedApproval?.reviewer?.email || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Role
                      </Label>
                      <p className="text-sm mt-1 capitalize">
                        {selectedApproval?.reviewer?.role?.toLowerCase() ||
                          'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Username
                      </Label>
                      <p className="text-sm mt-1">
                        {selectedApproval?.reviewer?.username || 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action History Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Action History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge
                          className={cn(
                            'gap-1',
                            actionConfig[selectedApproval.action]?.color
                          )}
                        >
                          {actionConfig[selectedApproval.action]?.label}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(
                            new Date(selectedApproval.actionDate),
                            'MMMM dd, yyyy • hh:mm a'
                          )}
                        </span>
                      </div>
                    </div>
                    {selectedApproval.comments && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Comments
                        </Label>
                        <p className="mt-1 text-sm bg-muted/50 p-3 rounded-lg">
                          {selectedApproval.comments}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons — only for admin/tutor */}
              {!isStudent && canTakeAction(selectedApproval.projectInfo.status) && (
                <>
                  <Separator />
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedApproval(null)}
                    >
                      Close
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleOpenActionDialog('reject')}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Reject Project
                    </Button>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                      onClick={() => handleOpenActionDialog('approve')}
                    >
                      <Check className="h-4 w-4" />
                      Approve Project
                    </Button>
                  </div>
                </>
              )}
              {(isStudent || !canTakeAction(selectedApproval.projectInfo.status)) && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedApproval(null)}
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          )}
        </SmartDrawerContent>
      </SmartDrawer>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle
              className={cn(
                'flex items-center gap-2',
                actionType === 'approve'
                  ? 'text-emerald-600'
                  : 'text-destructive'
              )}
            >
              {actionType === 'approve' ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Approve Project
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5" />
                  Reject Project
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? 'Confirm approval of this project submission'
                : 'Provide a reason for rejecting this project'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason{' '}
                {actionType === 'reject' && (
                  <span className="text-destructive">*</span>
                )}
              </Label>
              <Textarea
                id="reason"
                placeholder={
                  actionType === 'approve'
                    ? 'Optional: Provide a reason for approval...'
                    : 'Explain why this project is being rejected...'
                }
                value={actionPayload.reason}
                onChange={(e) =>
                  setActionPayload((prev) => ({
                    ...prev,
                    reason: e.target.value,
                  }))
                }
                rows={3}
                className={cn(
                  actionType === 'reject' &&
                    !actionPayload.reason &&
                    'border-destructive'
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">Additional Comments</Label>
              <Textarea
                id="comments"
                placeholder="Any additional feedback for the team..."
                value={actionPayload.comments}
                onChange={(e) =>
                  setActionPayload((prev) => ({
                    ...prev,
                    comments: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === 'approve' ? 'default' : 'destructive'}
              onClick={handleSubmitAction}
              disabled={
                submitting || (actionType === 'reject' && !actionPayload.reason)
              }
              className={cn(
                actionType === 'approve' &&
                  'bg-emerald-600 hover:bg-emerald-700'
              )}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {actionType === 'approve' ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Confirm Approval
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Confirm Rejection
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
