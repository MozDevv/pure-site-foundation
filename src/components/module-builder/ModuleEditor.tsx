import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Clock, Link, Eye, Code, ExternalLink } from 'lucide-react';
import { CourseModule, ModuleFile, getDepthLabel, formatDuration, generateId } from '@/lib/module-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileUpload } from './FileUpload';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';

interface ModuleEditorProps {
  module: CourseModule;
  depth: number;
  breadcrumbs: CourseModule[];
  files: ModuleFile[];
  onSave: (module: CourseModule) => void;
  onAddChild: (parentId: string) => void;
  onDelete: (moduleId: string) => void;
  onBreadcrumbClick: (module: CourseModule) => void;
  onUploadFiles: (moduleId: string, files: File[]) => Promise<void>;
  onDeleteFile: (fileId: string) => void;
  isSaving: boolean;
}

export function ModuleEditor({
  module,
  depth,
  breadcrumbs,
  files,
  onSave,
  onAddChild,
  onDelete,
  onBreadcrumbClick,
  onUploadFiles,
  onDeleteFile,
  isSaving,
}: ModuleEditorProps) {
  const [formData, setFormData] = useState({
    title: module.title,
    description: module.description,
    contentMarkdown: module.contentMarkdown,
    contentUrl: module.contentUrl,
    durationInMinutes: module.durationInMinutes,
  });
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Reset form when module changes
  useEffect(() => {
    setFormData({
      title: module.title,
      description: module.description,
      contentMarkdown: module.contentMarkdown,
      contentUrl: module.contentUrl,
      durationInMinutes: module.durationInMinutes,
    });
    setHasChanges(false);
  }, [module.id]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for this module',
        variant: 'destructive',
      });
      return;
    }

    onSave({
      ...module,
      ...formData,
    });
    setHasChanges(false);
  };

  const handleDelete = () => {
    onDelete(module.id);
    setShowDeleteDialog(false);
  };

  // Simple markdown to HTML converter for preview
  const renderMarkdown = (content: string) => {
    let html = content
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
      // Bold
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm">$2</code></pre>')
      // Inline code
      .replace(/`(.*?)`/gim, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>')
      // Lists
      .replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>')
      // Line breaks
      .replace(/\n/gim, '<br />');

    return html;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumbs */}
      <div className="px-6 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-1 text-sm">
          <button
            onClick={() => breadcrumbs.length > 0 && onBreadcrumbClick(breadcrumbs[0])}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Course
          </button>
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.id} className="flex items-center gap-1">
              <span className="text-muted-foreground">/</span>
              <button
                onClick={() => onBreadcrumbClick(crumb)}
                className={
                  index === breadcrumbs.length - 1
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground hover:text-foreground transition-colors'
                }
              >
                {crumb.title}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-6 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {getDepthLabel(depth)}
          </span>
          {hasChanges && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
              Unsaved changes
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddChild(module.id)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add {getDepthLabel(depth + 1)}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
          >
            <Save className="h-4 w-4 mr-1" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6 max-w-4xl">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter module title..."
              className="text-lg font-medium"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief description of this module..."
              rows={2}
            />
          </div>

          {/* Duration & Content URL */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Duration (minutes)
              </Label>
              <Input
                id="duration"
                type="number"
                min={0}
                value={formData.durationInMinutes}
                onChange={(e) => handleChange('durationInMinutes', parseInt(e.target.value) || 0)}
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contentUrl" className="text-sm font-medium flex items-center gap-2">
                <Link className="h-4 w-4 text-muted-foreground" />
                Content URL (Video/Resource)
              </Label>
              <Input
                id="contentUrl"
                type="url"
                value={formData.contentUrl}
                onChange={(e) => handleChange('contentUrl', e.target.value)}
                placeholder="https://youtube.com/embed/..."
              />
            </div>
          </div>

          {/* Video Embed Preview */}
          {formData.contentUrl && (
            <div className="rounded-lg border bg-muted/30 overflow-hidden">
              <div className="px-3 py-2 border-b bg-muted/50 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Video Preview</span>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" asChild>
                  <a href={formData.contentUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Open
                  </a>
                </Button>
              </div>
              <div className="aspect-video">
                <iframe
                  src={formData.contentUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          <Separator />

          {/* Markdown Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Content</Label>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'edit' | 'preview')}>
                <TabsList className="h-8">
                  <TabsTrigger value="edit" className="text-xs px-3 h-6">
                    <Code className="h-3 w-3 mr-1" />
                    Edit
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="text-xs px-3 h-6">
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {activeTab === 'edit' ? (
              <Textarea
                value={formData.contentMarkdown}
                onChange={(e) => handleChange('contentMarkdown', e.target.value)}
                placeholder="Write your content in Markdown...

## Example Heading

This is a paragraph with **bold** and *italic* text.

- List item 1
- List item 2

```javascript
const code = 'example';
```"
                className="min-h-[300px] font-mono text-sm"
              />
            ) : (
              <div
                className="min-h-[300px] p-4 rounded-lg border bg-background prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(formData.contentMarkdown) }}
              />
            )}
          </div>

          <Separator />

          {/* File Upload */}
          <FileUpload
            moduleId={module.id}
            files={files}
            onUpload={(files) => onUploadFiles(module.id, files)}
            onDelete={onDeleteFile}
          />
        </div>
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {getDepthLabel(depth)}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{module.title}" and all its child modules.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
