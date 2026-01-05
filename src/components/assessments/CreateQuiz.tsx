import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2, GripVertical, CheckCircle, XCircle, Type, Code } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { QuizQuestion, QuestionType } from "@/types/lms";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const questionTypeIcons: Record<QuestionType, React.ReactNode> = {
  multiple_choice: <CheckCircle className="h-4 w-4" />,
  true_false: <XCircle className="h-4 w-4" />,
  short_answer: <Type className="h-4 w-4" />,
  code: <Code className="h-4 w-4" />,
};

const questionTypeLabels: Record<QuestionType, string> = {
  multiple_choice: "Multiple Choice",
  true_false: "True/False",
  short_answer: "Short Answer",
  code: "Code Question",
};

export default function CreateQuiz() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseId: "",
    timeLimit: 30,
    hasTimeLimit: true,
    dueDate: "",
    dueTime: "23:59",
    shuffleQuestions: true,
    showResults: true,
    maxAttempts: 1,
  });

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: () => apiService.getCourses(),
  });

  const createMutation = useMutation({
    mutationFn: apiService.createQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast({
        title: "Quiz created",
        description: "Your quiz has been created successfully.",
      });
      navigate("/admin/assessments/quizzes");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create quiz. Please try again.",
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
      timeLimit: formData.hasTimeLimit ? formData.timeLimit : undefined,
      questions,
    });
  };

  const addQuestion = (type: QuestionType) => {
    const newQuestion: QuizQuestion = {
      id: `q${Date.now()}`,
      type,
      question: "",
      points: 10,
      options: type === "multiple_choice" ? ["", "", "", ""] : type === "true_false" ? ["True", "False"] : undefined,
      correctAnswer: type === "true_false" ? "true" : "",
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    if (updated[questionIndex].options) {
      updated[questionIndex].options![optionIndex] = value;
      setQuestions(updated);
    }
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/assessments/quizzes">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Create Quiz</h1>
          <p className="mt-1 text-muted-foreground">
            Build a new quiz for your course
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
            <CardDescription>Enter the quiz title and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter quiz title"
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
                placeholder="Brief description of the quiz"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quiz Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Quiz Settings</CardTitle>
            <CardDescription>Configure time limits and attempt rules</CardDescription>
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
                  <p className="font-medium text-foreground">Time Limit</p>
                  <p className="text-sm text-muted-foreground">
                    Set a time limit for completing the quiz
                  </p>
                </div>
                <Switch
                  checked={formData.hasTimeLimit}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasTimeLimit: checked })}
                />
              </div>

              {formData.hasTimeLimit && (
                <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                    className="w-32"
                  />
                </div>
              )}

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="font-medium text-foreground">Shuffle Questions</p>
                  <p className="text-sm text-muted-foreground">
                    Randomize question order for each student
                  </p>
                </div>
                <Switch
                  checked={formData.shuffleQuestions}
                  onCheckedChange={(checked) => setFormData({ ...formData, shuffleQuestions: checked })}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="font-medium text-foreground">Show Results</p>
                  <p className="text-sm text-muted-foreground">
                    Show correct answers after submission
                  </p>
                </div>
                <Switch
                  checked={formData.showResults}
                  onCheckedChange={(checked) => setFormData({ ...formData, showResults: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAttempts">Maximum Attempts</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  min={1}
                  value={formData.maxAttempts}
                  onChange={(e) => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) })}
                  className="w-32"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Builder */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Questions</CardTitle>
                <CardDescription>
                  {questions.length} question{questions.length !== 1 ? "s" : ""} • {totalPoints} total points
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="rounded-lg border border-border bg-muted/30 p-4 space-y-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
                        question.type === "multiple_choice" && "bg-primary/10 text-primary",
                        question.type === "true_false" && "bg-info/10 text-info",
                        question.type === "short_answer" && "bg-warning/10 text-warning",
                        question.type === "code" && "bg-success/10 text-success"
                      )}>
                        {questionTypeIcons[question.type]}
                        {questionTypeLabels[question.type]}
                      </span>
                      <Input
                        type="number"
                        value={question.points}
                        onChange={(e) => updateQuestion(index, "points", parseInt(e.target.value))}
                        className="w-20 h-7 text-sm"
                        placeholder="Points"
                      />
                      <span className="text-xs text-muted-foreground">points</span>
                    </div>

                    <div className="space-y-2">
                      <Textarea
                        placeholder="Enter your question here..."
                        value={question.question}
                        onChange={(e) => updateQuestion(index, "question", e.target.value)}
                        rows={2}
                      />
                    </div>

                    {question.type === "multiple_choice" && (
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Options (select the correct answer)</Label>
                        {question.options?.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${question.id}`}
                              checked={question.correctAnswer === option}
                              onChange={() => updateQuestion(index, "correctAnswer", option)}
                              className="h-4 w-4 text-primary"
                            />
                            <Input
                              placeholder={`Option ${optIndex + 1}`}
                              value={option}
                              onChange={(e) => updateOption(index, optIndex, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {question.type === "true_false" && (
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Correct Answer</Label>
                        <Select
                          value={question.correctAnswer as string}
                          onValueChange={(value) => updateQuestion(index, "correctAnswer", value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">True</SelectItem>
                            <SelectItem value="false">False</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {question.type === "short_answer" && (
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Expected Answer (for auto-grading)</Label>
                        <Input
                          placeholder="Expected answer"
                          value={question.correctAnswer as string}
                          onChange={(e) => updateQuestion(index, "correctAnswer", e.target.value)}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Explanation (shown after submission)</Label>
                      <Textarea
                        placeholder="Explain why this answer is correct..."
                        value={question.explanation || ""}
                        onChange={(e) => updateQuestion(index, "explanation", e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeQuestion(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Add Question Buttons */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => addQuestion("multiple_choice")}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Multiple Choice
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => addQuestion("true_false")}>
                <XCircle className="mr-2 h-4 w-4" />
                True/False
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => addQuestion("short_answer")}>
                <Type className="mr-2 h-4 w-4" />
                Short Answer
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => addQuestion("code")} disabled>
                <Code className="mr-2 h-4 w-4" />
                Code (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link to="/admin/assessments/quizzes">Cancel</Link>
          </Button>
          <Button type="submit" disabled={createMutation.isPending || questions.length === 0}>
            {createMutation.isPending ? "Creating..." : "Create Quiz"}
          </Button>
        </div>
      </form>
    </div>
  );
}
