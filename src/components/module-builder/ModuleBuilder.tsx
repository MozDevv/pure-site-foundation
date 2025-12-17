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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { BookOpen, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

export function ModuleBuilder({ courseId }: ModuleBuilderProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State
  const [modules, setModules] = useState<CourseModule[]>(mockModules);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newModuleParentId, setNewModuleParentId] = useState<string | null>(null);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [renameModule, setRenameModule] = useState<CourseModule | null>(null);
  const [renameTitle, setRenameTitle] = useState('');
  const [moduleFiles, setModuleFiles] = useState<Record<string, ModuleFile[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [useMockData, setUseMockData] = useState(true);

  // Fetch modules from API
  const { data: apiModules, isLoading, error } = useQuery({
    queryKey: ['course-modules', courseId],
    queryFn: async () => {
      try {
        const response = await apiService.get(moduleEndpoints.getAll);
        return response.data as CourseModule[];
      } catch (err) {
        console.log('Using mock data - API not available');
        setUseMockData(true);
        return mockModules;
      }
    },
    enabled: !useMockData,
  });

  // Use API data if available
  useEffect(() => {
    if (apiModules && !useMockData) {
      setModules(apiModules);
    }
  }, [apiModules, useMockData]);

  // Derived state
  const selectedModule = selectedModuleId ? findModuleById(modules, selectedModuleId) : null;
  const breadcrumbs = selectedModuleId ? getModuleBreadcrumbs(modules, selectedModuleId) : [];
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
        await apiService.post(moduleEndpoints.create, newModule);
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
        await apiService.put(moduleEndpoints.update(renameModule.id), updated);
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
        await apiService.put(moduleEndpoints.update(module.id), module);
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
        await apiService.delete(moduleEndpoints.delete(moduleId));
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

    setModules(reorderSiblings(modules, module.parentId, currentIndex, newIndex));
    toast({ title: 'Module reordered' });
  };

  const handleBreadcrumbClick = (module: CourseModule) => {
    setSelectedModuleId(module.id);
  };

  const handleUploadFiles = async (moduleId: string, files: File[]): Promise<void> => {
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
        await apiService.post(moduleEndpoints.uploadFile(moduleId), formData);
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
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b flex items-center justify-between px-4 bg-card shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-8 px-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h1 className="font-semibold text-foreground">Course Module Builder</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {countModules(modules)} modules
          </span>
          {useMockData && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
              Demo Mode
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Module Tree */}
        <aside className="w-80 shrink-0 overflow-hidden">
          <ModuleTree
            modules={modules}
            selectedModuleId={selectedModuleId}
            onSelectModule={handleSelectModule}
            onAddChild={handleAddChild}
            onRename={handleRenameClick}
            onDelete={handleDeleteModule}
            onReorder={handleReorder}
          />
        </aside>

        {/* Main Content - Editor */}
        <main className="flex-1 overflow-hidden bg-muted/20">
          {selectedModule ? (
            <ModuleEditor
              module={selectedModule}
              depth={selectedDepth}
              breadcrumbs={breadcrumbs}
              files={moduleFiles[selectedModule.id] || []}
              onSave={handleSaveModule}
              onAddChild={handleAddChild}
              onDelete={handleDeleteModule}
              onBreadcrumbClick={handleBreadcrumbClick}
              onUploadFiles={handleUploadFiles}
              onDeleteFile={handleDeleteFile}
              isSaving={isSaving}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <BookOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Select a Module
              </h2>
              <p className="text-muted-foreground max-w-md">
                Choose a module from the sidebar to edit its content, or create a new one to get started.
              </p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => handleAddChild(null)}
              >
                Create First Module
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* Create Module Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Create New {getDepthLabel(newModuleParentId ? breadcrumbs.length : 0)}
            </DialogTitle>
            <DialogDescription>
              {newModuleParentId
                ? `Add a new ${getDepthLabel(breadcrumbs.length).toLowerCase()} to this module`
                : 'Create a new top-level module for your course'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-title">Title</Label>
              <Input
                id="new-title"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                placeholder="Enter module title..."
                onKeyDown={(e) => e.key === 'Enter' && handleCreateModule()}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateModule}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Module</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename-title">New Title</Label>
              <Input
                id="rename-title"
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                placeholder="Enter new title..."
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
