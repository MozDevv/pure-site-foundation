import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Download } from "lucide-react";
import { apiService } from "@/services/apiService";
import { SubmissionCard } from "@/components/assessments/SubmissionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function SubmissionsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["submissions"],
    queryFn: () => apiService.getSubmissions(),
  });

  const { data: assignments } = useQuery({
    queryKey: ["assignments"],
    queryFn: () => apiService.getAssignments(),
  });

  const filteredSubmissions = submissions?.filter((submission) => {
    const matchesSearch = submission.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.assignmentTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAssignment = assignmentFilter === "all" || submission.assignmentId === assignmentFilter;
    const matchesStatus = statusFilter === "all" || submission.status === statusFilter;
    return matchesSearch && matchesAssignment && matchesStatus;
  });

  const pendingCount = submissions?.filter(s => s.status === "pending").length || 0;
  const submittedCount = submissions?.filter(s => s.status === "submitted").length || 0;
  const gradedCount = submissions?.filter(s => s.status === "graded").length || 0;
  const lateCount = submissions?.filter(s => s.status === "late").length || 0;

  const handleExport = async () => {
    try {
      const csvData = await apiService.exportGrades({ assignmentId: assignmentFilter !== "all" ? assignmentFilter : undefined });
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "submissions_export.csv";
      a.click();
      toast({
        title: "Export successful",
        description: "Submissions have been exported to CSV.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting the submissions.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Submissions</h1>
          <p className="mt-1 text-muted-foreground">
            Review and grade student submissions
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Status Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start gap-2 bg-transparent p-0">
          <TabsTrigger 
            value="all"
            onClick={() => setStatusFilter("all")}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4"
          >
            All ({submissions?.length || 0})
          </TabsTrigger>
          <TabsTrigger 
            value="submitted"
            onClick={() => setStatusFilter("submitted")}
            className="data-[state=active]:bg-info data-[state=active]:text-info-foreground rounded-full px-4"
          >
            Submitted ({submittedCount})
          </TabsTrigger>
          <TabsTrigger 
            value="late"
            onClick={() => setStatusFilter("late")}
            className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground rounded-full px-4"
          >
            Late ({lateCount})
          </TabsTrigger>
          <TabsTrigger 
            value="graded"
            onClick={() => setStatusFilter("graded")}
            className="data-[state=active]:bg-success data-[state=active]:text-success-foreground rounded-full px-4"
          >
            Graded ({gradedCount})
          </TabsTrigger>
          <TabsTrigger 
            value="pending"
            onClick={() => setStatusFilter("pending")}
            className="data-[state=active]:bg-warning data-[state=active]:text-warning-foreground rounded-full px-4"
          >
            Pending ({pendingCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by student or assignment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
          <SelectTrigger className="w-64">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by assignment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignments</SelectItem>
            {assignments?.map((assignment) => (
              <SelectItem key={assignment.id} value={assignment.id}>
                {assignment.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Submissions List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : filteredSubmissions?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <Search className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No submissions found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions?.map((submission) => (
            <SubmissionCard key={submission.id} submission={submission} />
          ))}
        </div>
      )}
    </div>
  );
}
