import React from 'react';
import { Bold, Italic, Underline, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RichTextToolbarProps {
  isVisible: boolean;
  onFormatToggle: (format: 'bold' | 'italic' | 'underline' | 'link') => void;
  activeFormats: string[];
}

export const RichTextToolbar: React.FC<RichTextToolbarProps> = ({
  isVisible,
  onFormatToggle,
  activeFormats,
}) => {
  return (
    <div 
      className={cn(
        "transition-all duration-300 ease-out overflow-hidden",
        isVisible 
          ? "opacity-100 transform translate-y-0 max-h-16" 
          : "opacity-0 transform translate-y-2 max-h-0"
      )}
    >
      <div className="flex items-center gap-2 p-2 bg-card border border-border rounded-lg shadow-sm">
        <Button 
          size="sm" 
          variant={activeFormats.includes('bold') ? 'default' : 'ghost'}
          className="h-7 px-2 text-xs"
          onClick={() => onFormatToggle('bold')}
        >
          <Bold className="w-3 h-3" />
        </Button>
        <Button 
          size="sm" 
          variant={activeFormats.includes('italic') ? 'default' : 'ghost'}
          className="h-7 px-2 text-xs"
          onClick={() => onFormatToggle('italic')}
        >
          <Italic className="w-3 h-3" />
        </Button>
        <Button 
          size="sm" 
          variant={activeFormats.includes('underline') ? 'default' : 'ghost'}
          className="h-7 px-2 text-xs"
          onClick={() => onFormatToggle('underline')}
        >
          <Underline className="w-3 h-3" />
        </Button>
        <Button 
          size="sm" 
          variant={activeFormats.includes('link') ? 'default' : 'ghost'}
          className="h-7 px-2 text-xs"
          onClick={() => onFormatToggle('link')}
        >
          <Link className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};