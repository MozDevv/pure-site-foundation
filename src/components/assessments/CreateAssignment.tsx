import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react";
import { apiService } from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { RubricCriteria, AssignmentType, SubmissionType, GradingMethod } from "@/types/lms";
import { Link } from "react-router-dom";

export default function CreateAssignment() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Role guard — only Tutor, Mentor, Admin, Super_Admin can create assignments
  useEffect(() => {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
    const role = (user?.role || 'Student').toLowerCase();
    if (!['tutor', 'mentor', 'admin', 'super_admin'].includes(role)) {
      toast({ title: 'Access Denied', description: 'You do not have permission to create assignments.', variant: 'destructive' });
      navigate(-1);
    }
  }, [navigate, toast]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    courseId: "",
    type: "individual" as AssignmentType,
    submissionTypes: ["file"] as SubmissionType[],
    gradingMethod: "score" as GradingMethod,
    maxScore: 100,
    dueDate: "",
    dueTime: "23:59",
    lateSubmissionAllowed: false,
    latePenalty: 10,
    allowResubmission: false,
    maxResubmissions: 1,
  });

  const [rubric, setRubric] = useState<RubricCriteria[]>([]);

  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: () => apiService.getCourses(),
  });

  const createMutation = useMutation({
    mutationFn: apiService.createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      toast({
        title: "Assignment created",
        description: "Your assignment has been created successfully.",
      });
      const u = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
      const r = (u?.role || 'Student').toLowerCase();
      const isAdmin = r === 'admin' || r === 'super_admin';
      navigate(isAdmin ? '/admin/assessments/assignments' : '/tutor/assessments/assignments');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to create assignment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dueDateTime = `${formData.dueDate}T${formData.dueTime}:00Z`;
    createMutation.mutate({
      ...formData,
      dueDate: dueDateTime,
      rubric: formData.gradingMethod === "rubric" ? rubric : undefined,
    });
  };

  const addRubricCriteria = () => {
    setRubric([
      ...rubric,
      {
        id: `r${Date.now()}`,
        name: "",
        description: "",
        maxPoints: 25,
        weight: 25,
      },
    ]);
  };

  const updateRubricCriteria = (index: number, field: keyof RubricCriteria, value: any) => {
    const updated = [...rubric];
    updated[index] = { ...updated[index], [field]: value };
    setRubric(updated);
  };

  const removeRubricCriteria = (index: number) => {
    setRubric(rubric.filter((_, i) => i !== index));
  };

  const toggleSubmissionType = (type: SubmissionType) => {
    setFormData((prev) => ({
      ...prev,
      submissionTypes: prev.submissionTypes.includes(type)
        ? prev.submissionTypes.filter((t) => t !== type)
        : [...prev.submissionTypes, type],
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Create Assignment</h1>
          <p className="mt-1 text-muted-foreground">
            Set up a new assignment for your course
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the assignment title and description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter assignment title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select
                  value={formData.courseId}
                  onValueChange={(value) => setFormData({ ...formData, courseId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses?.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the assignment"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="Detailed instructions for students (supports basic HTML)"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                rows={6}
              />
            </div>
          </CardContent>
        </Card>

        {/* Assignment Type & Submissions */}
        <Card>
          <CardHeader>
            <CardTitle>Assignment Settings</CardTitle>
            <CardDescription>Configure assignment type and submission options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Assignment Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: AssignmentType) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="group">Group / Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Grading Method</Label>
                <Select
                  value={formData.gradingMethod}
                  onValueChange={(value: GradingMethod) => setFormData({ ...formData, gradingMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score">Score-based (e.g., /100)</SelectItem>
                    <SelectItem value="rubric">Rubric-based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Allowed Submission Types</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="file"
                    checked={formData.submissionTypes.includes("file")}
                    onCheckedChange={() => toggleSubmissionType("file")}
                  />
                  <label htmlFor="file" className="text-sm font-medium leading-none cursor-pointer">
                    File Upload (PDF, DOCX, ZIP)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="repo"
                    checked={formData.submissionTypes.includes("repo")}
                    onCheckedChange={() => toggleSubmissionType("repo")}
                  />
                  <label htmlFor="repo" className="text-sm font-medium leading-none cursor-pointer">
                    Repository Link (GitHub/GitLab)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="url"
                    checked={formData.submissionTypes.includes("url")}
                    onCheckedChange={() => toggleSubmissionType("url")}
                  />
                  <label htmlFor="url" className="text-sm font-medium leading-none cursor-pointer">
                    Live Demo URL
                  </label>
                </div>
              </div>
            </div>

            {formData.gradingMethod === "score" && (
              <div className="space-y-2">
                <Label htmlFor="maxScore">Maximum Score</Label>
                <Input
                  id="maxScore"
                  type="number"
                  value={formData.maxScore}
                  onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) })}
                  className="w-32"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rubric Builder */}
        {formData.gradingMethod === "rubric" && (
          <Card>
            <CardHeader>
              <CardTitle>Grading Rubric</CardTitle>
              <CardDescription>Define criteria for grading submissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {rubric.map((criteria, index) => (
                <div
                  key={criteria.id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4"
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground mt-2 cursor-grab" />
                  <div className="flex-1 grid gap-4 sm:grid-cols-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Criteria Name</Label>
                      <Input
                        placeholder="e.g., Code Quality"
                        value={criteria.name}
                        onChange={(e) => updateRubricCriteria(index, "name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Points</Label>
                      <Input
                        type="number"
                        value={criteria.maxPoints}
                        onChange={(e) => updateRubricCriteria(index, "maxPoints", parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Weight (%)</Label>
                      <Input
                        type="number"
                        value={criteria.weight}
                        onChange={(e) => updateRubricCriteria(index, "weight", parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-4">
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Describe what this criteria evaluates"
                        value={criteria.description}
                        onChange={(e) => updateRubricCriteria(index, "description", e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeRubricCriteria(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addRubricCriteria}>
                <Plus className="mr-2 h-4 w-4" />
                Add Criteria
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Due Date & Policies */}
        <Card>
          <CardHeader>
            <CardTitle>Due Date & Policies</CardTitle>
            <CardDescription>Set deadline and submission policies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueTime">Due Time</Label>
                <Input
                  id="dueTime"
                  type="time"
                  value={formData.dueTime}
                  onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="font-medium text-foreground">Allow Late Submissions</p>
                  <p className="text-sm text-muted-foreground">
                    Students can submit after the due date with a penalty
                  </p>
                </div>
                <Switch
                  checked={formData.lateSubmissionAllowed}
                  onCheckedChange={(checked) => setFormData({ ...formData, lateSubmissionAllowed: checked })}
                />
              </div>

              {formData.lateSubmissionAllowed && (
                <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                  <Label htmlFor="latePenalty">Late Penalty (%)</Label>
                  <Input
                    id="latePenalty"
                    type="number"
                    value={formData.latePenalty}
                    onChange={(e) => setFormData({ ...formData, latePenalty: parseInt(e.target.value) })}
                    className="w-32"
                  />
                </div>
              )}

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="font-medium text-foreground">Allow Resubmissions</p>
                  <p className="text-sm text-muted-foreground">
                    Students can submit multiple versions of their work
                  </p>
                </div>
                <Switch
                  checked={formData.allowResubmission}
                  onCheckedChange={(checked) => setFormData({ ...formData, allowResubmission: checked })}
                />
              </div>

              {formData.allowResubmission && (
                <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                  <Label htmlFor="maxResubmissions">Maximum Resubmissions</Label>
                  <Input
                    id="maxResubmissions"
                    type="number"
                    value={formData.maxResubmissions}
                    onChange={(e) => setFormData({ ...formData, maxResubmissions: parseInt(e.target.value) })}
                    className="w-32"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link to="/admin/assessments/assignments">Cancel</Link>
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create Assignment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
