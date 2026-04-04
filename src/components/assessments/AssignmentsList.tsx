import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter, LayoutGrid, List } from "lucide-react";
import { apiService } from "@/services/apiService";
import { AssignmentCard } from "@/components/assessments/AssignmentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function AssignmentsList() {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null;
  const userRole = (user?.role || 'Student').toLowerCase();
  const isStudent = userRole === 'student';
  const basePath = isStudent ? '/student' : (userRole === 'admin' || userRole === 'super_admin') ? '/admin' : '/tutor';

  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: assignments, isLoading } = useQuery({
    queryKey: ["assignments"],
    queryFn: () => apiService.getAssignments(),
  });

  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: () => apiService.getCourses(),
  });

  const filteredAssignments = assignments?.filter((assignment) => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = courseFilter === "all" || assignment.courseId === courseFilter;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Assignments</h1>
          <p className="mt-1 text-muted-foreground">
            Create and manage course assignments
          </p>
        </div>
        {!isStudent && (
          <Button asChild>
            <Link to={`${basePath}/assessments/assignments/create`}>
              <Plus className="mr-2 h-4 w-4" />
              New Assignment
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses?.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Assignments Grid/List */}
      {isLoading ? (
        <div className={cn(
          "grid gap-4",
          viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : filteredAssignments?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <Search className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No assignments found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
          {!isStudent && (
            <Button className="mt-4" asChild>
              <Link to={`${basePath}/assessments/assignments/create`}>
                <Plus className="mr-2 h-4 w-4" />
                Create Assignment
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className={cn(
          "grid gap-4",
          viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {filteredAssignments?.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))}
        </div>
      )}
    </div>
  );
}
