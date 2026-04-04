import React from 'react';
import { X, FileText, Image, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export interface AttachmentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  uploadProgress?: number;
}

interface AttachmentPreviewProps {
  files: AttachmentFile[];
  onRemove: (fileId: string) => void;
}

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  files,
  onRemove,
}) => {
  if (files.length === 0) return null;

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    return FileText;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {files.map((file) => {
        const IconComponent = getFileIcon(file.type);
        const isUploading = typeof file.uploadProgress === 'number' && file.uploadProgress < 100;
        
        return (
          <div
            key={file.id}
            className={cn(
              "relative group bg-card border border-border rounded-lg overflow-hidden transition-all duration-200",
              "hover:shadow-md",
              isUploading && "opacity-75"
            )}
            style={{ width: '120px', height: '120px' }}
          >
            {/* File preview */}
            <div className="w-full h-full flex items-center justify-center p-3">
              {file.type.startsWith('image/') && file.url ? (
                <img 
                  src={file.url} 
                  alt={file.name}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <IconComponent className="w-8 h-8 text-primary mb-2" />
                  <span className="text-xs text-foreground font-medium truncate w-full">
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                </div>
              )}
            </div>

            {/* Upload progress */}
            {isUploading && (
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-background/95">
                <Progress value={file.uploadProgress} className="h-0.5" />
              </div>
            )}

            {/* Remove button */}
            <Button
              size="sm"
              variant="destructive"
              className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={() => onRemove(file.id)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        );
      })}
    </div>
  );
};