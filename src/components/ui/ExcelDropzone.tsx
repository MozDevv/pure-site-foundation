import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExcelDropzoneProps {
  onFileAccepted: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ExcelDropzone({ onFileAccepted }: ExcelDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel' ||
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.xls')
      ) {
        setFileName(file.name);
        // Create a synthetic event
        const input = document.createElement('input');
        input.type = 'file';
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        const event = { target: input } as React.ChangeEvent<HTMLInputElement>;
        onFileAccepted(event);
      }
    }
  }, [onFileAccepted]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileAccepted(e);
    }
  };

  return (
    <div
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
        isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleChange}
        className="hidden"
        id="excel-upload"
      />
      <label htmlFor="excel-upload" className="cursor-pointer">
        <div className="flex flex-col items-center gap-3">
          {fileName ? (
            <>
              <FileSpreadsheet className="h-12 w-12 text-green-500" />
              <p className="text-sm font-medium">{fileName}</p>
              <p className="text-xs text-muted-foreground">Click to change file</p>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm font-medium">Drop your Excel file here</p>
              <p className="text-xs text-muted-foreground">or click to browse</p>
            </>
          )}
        </div>
      </label>
    </div>
  );
}
