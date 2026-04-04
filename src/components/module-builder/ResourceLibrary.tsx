import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, endpoints } from '@/lib/api';
import {
  CourseModule,
  ModuleFile,
  mockModules,
  findModuleById,
  getModuleBreadcrumbs,
  updateModuleInTree,
  removeModuleFromTree,
  addChildModule,
  reorderSiblings,
  getDepthLabel,
  generateId,
  countModules,
} from '@/lib/module-utils';
import { ModuleTree } from './ModuleTree';
import { ModuleEditor } from './ModuleEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { BookOpen, Loader2, ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { TeamFileHub } from './TeamFileHub';
// API endpoints for course modules
const moduleEndpoints = {
  getAll: '/course-modules',
  getById: (id: string) => `/course-modules/${id}`,
  create: '/course-modules',
  update: (id: string) => `/course-modules/${id}`,
  delete: (id: string) => `/course-modules/${id}`,
  uploadFile: (id: string) => `/course-modules/${id}/files`,
};

interface ModuleBuilderProps {
  courseId?: string;
}

export function ResourceLibrary({ courseId }: ModuleBuilderProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State
  const [modules, setModules] = useState<CourseModule[]>(mockModules);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newModuleParentId, setNewModuleParentId] = useState<string | null>(
    null
  );
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [renameModule, setRenameModule] = useState<CourseModule | null>(null);
  const [renameTitle, setRenameTitle] = useState('');
  const [moduleFiles, setModuleFiles] = useState<Record<string, ModuleFile[]>>(
    {}
  );
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');
  const [isSaving, setIsSaving] = useState(false);
  const [useMockData, setUseMockData] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(
    courseId
  );
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () =>
      apiService.get(endpoints.getAllCourses).then((res) => res.data),
  });
  // Fetch modules from API
  const {
    data: apiModules,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['course-modules', courseId],
    queryFn: async () => {
      try {
        const response = await apiService.get(
          endpoints.getCourseModules(selectedCourse?.id)
        );
        return response.data as CourseModule[];
      } catch (err) {
        console.log('Using mock data - API not available');
        setUseMockData(true);
        return mockModules;
      }
    },
    enabled: !!selectedCourseId && !useMockData,
  });

  // Use API data if available
  useEffect(() => {
    if (apiModules && !useMockData) {
      setModules(apiModules);
    }
  }, [apiModules, useMockData]);

  // Derived state
  const selectedModule = selectedModuleId
    ? findModuleById(modules, selectedModuleId)
    : null;
  const breadcrumbs = selectedModuleId
    ? getModuleBreadcrumbs(modules, selectedModuleId)
    : [];
  const selectedDepth = breadcrumbs.length - 1;

  // Handlers
  const handleSelectModule = (module: CourseModule) => {
    setSelectedModuleId(module.id);
  };

  const handleAddChild = (parentId: string | null) => {
    setNewModuleParentId(parentId);
    setNewModuleTitle('');
    setIsCreateDialogOpen(true);
  };

  const handleCreateModule = async () => {
    if (!newModuleTitle.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for the new module',
        variant: 'destructive',
      });
      return;
    }

    const newModule: CourseModule = {
      id: generateId(),
      title: newModuleTitle.trim(),
      description: '',
      contentMarkdown: '',
      contentUrl: '',
      durationInMinutes: 0,
      orderIndex: 0,
      parentId: newModuleParentId,
      subModules: [],
      courseId: selectedCourseId || null,
    };

    // Calculate order index
    if (newModuleParentId) {
      const parent = findModuleById(modules, newModuleParentId);
      if (parent) {
        newModule.orderIndex = parent.subModules?.length || 0;
      }
    } else {
      newModule.orderIndex = modules.length;
    }

    // Optimistic update
    if (newModuleParentId) {
      setModules(addChildModule(modules, newModuleParentId, newModule));
    } else {
      setModules([...modules, newModule]);
    }

    // API call (if not using mock data)
    if (!useMockData) {
      try {
        await apiService.post(endpoints.create, newModule);
        queryClient.invalidateQueries({ queryKey: ['course-modules'] });
      } catch (err) {
        console.error('Failed to create module:', err);
      }
    }

    setIsCreateDialogOpen(false);
    setSelectedModuleId(newModule.id);
    toast({ title: 'Module created' });
  };

  const handleRenameClick = (module: CourseModule) => {
    setRenameModule(module);
    setRenameTitle(module.title);
    setIsRenameDialogOpen(true);
  };

  const handleRename = async () => {
    if (!renameModule || !renameTitle.trim()) return;

    const updated = { ...renameModule, title: renameTitle.trim() };
    setModules(updateModuleInTree(modules, updated));

    if (!useMockData) {
      try {
        await apiService.put(endpoints.update(renameModule.id), updated);
        queryClient.invalidateQueries({ queryKey: ['course-modules'] });
      } catch (err) {
        console.error('Failed to rename module:', err);
      }
    }

    setIsRenameDialogOpen(false);
    toast({ title: 'Module renamed' });
  };

  const handleSaveModule = async (module: CourseModule) => {
    setIsSaving(true);

    // Optimistic update
    setModules(updateModuleInTree(modules, module));

    // API call (if not using mock data)
    if (!useMockData) {
      try {
        await apiService.put(endpoints.update(module.id), module);
        queryClient.invalidateQueries({ queryKey: ['course-modules'] });
      } catch (err) {
        console.error('Failed to save module:', err);
        toast({
          title: 'Save failed',
          description: 'Failed to save changes. Please try again.',
          variant: 'destructive',
        });
        setIsSaving(false);
        return;
      }
    }

    // Simulate save delay for demo
    await new Promise((r) => setTimeout(r, 500));

    setIsSaving(false);
    toast({ title: 'Changes saved' });
  };

  const handleDeleteModule = async (moduleId: string) => {
    // If deleting selected module, clear selection
    if (selectedModuleId === moduleId) {
      setSelectedModuleId(null);
    }

    // Optimistic update
    setModules(removeModuleFromTree(modules, moduleId));

    // API call (if not using mock data)
    if (!useMockData) {
      try {
        await apiService.delete(endpoints.delete(moduleId));
        queryClient.invalidateQueries({ queryKey: ['course-modules'] });
      } catch (err) {
        console.error('Failed to delete module:', err);
      }
    }

    toast({ title: 'Module deleted' });
  };

  const handleReorder = (moduleId: string, direction: 'up' | 'down') => {
    const module = findModuleById(modules, moduleId);
    if (!module) return;

    // Find siblings
    let siblings: CourseModule[];
    if (module.parentId) {
      const parent = findModuleById(modules, module.parentId);
      siblings = parent?.subModules || [];
    } else {
      siblings = modules;
    }

    const currentIndex = siblings.findIndex((s) => s.id === moduleId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= siblings.length) return;

    setModules(
      reorderSiblings(modules, module.parentId, currentIndex, newIndex)
    );
    toast({ title: 'Module reordered' });
  };

  const handleBreadcrumbClick = (module: CourseModule) => {
    setSelectedModuleId(module.id);
  };

  const handleUploadFiles = async (
    moduleId: string,
    files: File[]
  ): Promise<void> => {
    // Simulate file upload
    const newFiles: ModuleFile[] = files.map((file) => ({
      id: generateId(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
    }));

    setModuleFiles((prev) => ({
      ...prev,
      [moduleId]: [...(prev[moduleId] || []), ...newFiles],
    }));

    // API call (if not using mock data)
    if (!useMockData) {
      try {
        const formData = new FormData();
        files.forEach((file) => formData.append('files', file));
        await apiService.post(`/course-modules/${moduleId}/files`, formData);
      } catch (err) {
        console.error('Failed to upload files:', err);
      }
    }
  };

  const handleDeleteFile = (fileId: string) => {
    setModuleFiles((prev) => {
      const updated = { ...prev };
      for (const moduleId in updated) {
        updated[moduleId] = updated[moduleId].filter((f) => f.id !== fileId);
      }
      return updated;
    });
    toast({ title: 'File deleted' });
  };

  if (isLoading && !useMockData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="">
      {!selectedCourse ? (
        <div className=" mt-3 ml-4">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-2xl font-bold">Resource Library</h2>
              <p className="text-sm text-muted-foreground">Browse and manage course documents, files, and learning materials</p>
            </div>
          </div>
          {coursesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {coursesData?.map((course: any) => (
                <div
                  key={course.id}
                  className="group bg-card border rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200 flex flex-col p-5 cursor-pointer"
                  onClick={() => {
                    setSelectedCourse(course);
                    setSelectedCourseId(course.id);
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="h-8 w-8 text-primary" />
                    <span className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {course.title}
                    </span>
                    {course.code && (
                      <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded font-mono text-muted-foreground">
                        {course.code}
                      </span>
                    )}
                  </div>
                  {course.shortDescription && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {course.shortDescription}
                    </p>
                  )}
                  <p className="text-muted-foreground mb-2 line-clamp-3 min-h-[48px]">
                    {course.description || 'No description provided.'}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-2">
                    {course.category && (
                      <span className="bg-muted px-2 py-0.5 rounded">
                        {course.category}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-2">
                    {course.startDate && (
                      <span>
                        <strong>Start:</strong>{' '}
                        {new Date(course.startDate).toLocaleDateString()}
                      </span>
                    )}
                    {course.endDate && (
                      <span>
                        <strong>End:</strong>{' '}
                        {new Date(course.endDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col h-screen bg-background">
          {/* Header */}
          <TeamFileHub
            files={selectedCourse?.documents}
            currentTeam={selectedCourse}
          />
        </div>
      )}
    </div>
  );
}
