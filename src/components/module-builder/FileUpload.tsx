import { useState, useRef, useCallback } from 'react';
import { Upload, File, FileText, Image, Video, X, Loader2, FileImage, FileVideo } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModuleFile } from '@/lib/module-utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';

interface FileUploadProps {
  moduleId: string;
  files: ModuleFile[];
  onUpload: (files: File[]) => Promise<void>;
  onDelete: (fileId: string) => void;
}

const acceptedTypes = {
  'application/pdf': { icon: FileText, label: 'PDF', color: 'text-red-500' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: FileText, label: 'DOCX', color: 'text-blue-500' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { icon: FileImage, label: 'PPTX', color: 'text-orange-500' },
  'image/jpeg': { icon: Image, label: 'JPG', color: 'text-green-500' },
  'image/png': { icon: Image, label: 'PNG', color: 'text-green-500' },
  'image/gif': { icon: Image, label: 'GIF', color: 'text-purple-500' },
  'video/mp4': { icon: Video, label: 'MP4', color: 'text-pink-500' },
  'video/webm': { icon: Video, label: 'WEBM', color: 'text-pink-500' },
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(type: string) {
  const config = acceptedTypes[type as keyof typeof acceptedTypes];
  if (config) {
    const Icon = config.icon;
    return <Icon className={cn('h-5 w-5', config.color)} />;
  }
  return <File className="h-5 w-5 text-muted-foreground" />;
}

function getFileLabel(type: string): string {
  const config = acceptedTypes[type as keyof typeof acceptedTypes];
  return config?.label || 'File';
}

export function FileUpload({ moduleId, files, onUpload, onDelete }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      await handleFiles(droppedFiles);
    }
  }, []);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      await handleFiles(Array.from(selectedFiles));
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFiles = async (filesToUpload: File[]) => {
    // Validate file types
    const validFiles = filesToUpload.filter((file) => {
      const isValid = Object.keys(acceptedTypes).includes(file.type);
      if (!isValid) {
        toast({
          title: 'Invalid file type',
          description: `${file.name} is not a supported file type`,
          variant: 'destructive',
        });
      }
      return isValid;
    });

    if (validFiles.length === 0) return;

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    const sizedFiles = validFiles.filter((file) => {
      const isValid = file.size <= maxSize;
      if (!isValid) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds the 50MB limit`,
          variant: 'destructive',
        });
      }
      return isValid;
    });

    if (sizedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await onUpload(sizedFiles);
      setUploadProgress(100);
      toast({
        title: 'Files uploaded',
        description: `Successfully uploaded ${sizedFiles.length} file(s)`,
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload files. Please try again.',
        variant: 'destructive',
      });
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Attachments</h3>
        <span className="text-xs text-muted-foreground">{files.length} files</span>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer',
          'hover:border-primary/50 hover:bg-primary/5',
          isDragging && 'border-primary bg-primary/10',
          isUploading && 'pointer-events-none opacity-70'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.webm"
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-col items-center text-center">
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
              <div className="w-full max-w-xs mt-3">
                <Progress value={uploadProgress} className="h-1" />
              </div>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm font-medium text-foreground">
                Drop files here or click to upload
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, DOCX, PPTX, Images, Videos (max 50MB)
              </p>
            </>
          )}
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50 group"
            >
              {getFileIcon(file.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{getFileLabel(file.type)}</span>
                  <span>•</span>
                  <span>{formatFileSize(file.size)}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(file.id)}
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
