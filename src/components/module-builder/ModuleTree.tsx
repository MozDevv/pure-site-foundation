import { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, MoreVertical, GripVertical, FileText, FolderOpen, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CourseModule, getDepthLabel, formatDuration } from '@/lib/module-utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ModuleTreeProps {
  modules: CourseModule[];
  selectedModuleId: string | null;
  onSelectModule: (module: CourseModule) => void;
  onAddChild: (parentId: string | null) => void;
  onRename: (module: CourseModule) => void;
  onDelete: (moduleId: string) => void;
  onReorder: (moduleId: string, direction: 'up' | 'down') => void;
}

interface TreeNodeProps {
  module: CourseModule;
  depth: number;
  selectedModuleId: string | null;
  onSelectModule: (module: CourseModule) => void;
  onAddChild: (parentId: string) => void;
  onRename: (module: CourseModule) => void;
  onDelete: (moduleId: string) => void;
  onReorder: (moduleId: string, direction: 'up' | 'down') => void;
  isFirst: boolean;
  isLast: boolean;
}

function TreeNode({
  module,
  depth,
  selectedModuleId,
  onSelectModule,
  onAddChild,
  onRename,
  onDelete,
  onReorder,
  isFirst,
  isLast,
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = module.subModules && module.subModules.length > 0;
  const isSelected = selectedModuleId === module.id;

  return (
    <div className="select-none">
      <div
        className={cn(
          'group flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer transition-all',
          'hover:bg-muted/60',
          isSelected && 'bg-primary/10 text-primary border-l-2 border-primary'
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {/* Drag Handle */}
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 cursor-grab" />
        
        {/* Expand/Collapse */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className={cn(
            'p-0.5 rounded hover:bg-muted/80 transition-colors',
            !hasChildren && 'invisible'
          )}
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>

        {/* Icon */}
        {hasChildren ? (
          isExpanded ? (
            <FolderOpen className="h-4 w-4 text-amber-500 shrink-0" />
          ) : (
            <Folder className="h-4 w-4 text-amber-500 shrink-0" />
          )
        ) : (
          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
        )}

        {/* Title */}
        <span
          className={cn(
            'flex-1 text-sm truncate',
            isSelected ? 'font-medium' : 'font-normal'
          )}
          onClick={() => onSelectModule(module)}
        >
          {module.title}
        </span>

        {/* Duration Badge */}
        {module.durationInMinutes > 0 && (
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {formatDuration(module.durationInMinutes)}
          </span>
        )}

        {/* Context Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1 rounded hover:bg-muted/80 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onAddChild(module.id)}>
              <Plus className="h-4 w-4 mr-2" />
              Add {getDepthLabel(depth + 1)}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRename(module)}>
              <FileText className="h-4 w-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onReorder(module.id, 'up')}
              disabled={isFirst}
            >
              Move Up
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onReorder(module.id, 'down')}
              disabled={isLast}
            >
              Move Down
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(module.id)}
              className="text-destructive focus:text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="relative">
          <div
            className="absolute left-0 top-0 bottom-0 w-px bg-border"
            style={{ marginLeft: `${depth * 16 + 20}px` }}
          />
          {module.subModules.map((child, index) => (
            <TreeNode
              key={child.id}
              module={child}
              depth={depth + 1}
              selectedModuleId={selectedModuleId}
              onSelectModule={onSelectModule}
              onAddChild={onAddChild}
              onRename={onRename}
              onDelete={onDelete}
              onReorder={onReorder}
              isFirst={index === 0}
              isLast={index === module.subModules.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ModuleTree({
  modules,
  selectedModuleId,
  onSelectModule,
  onAddChild,
  onRename,
  onDelete,
  onReorder,
}: ModuleTreeProps) {
  return (
    <div className="flex flex-col h-full bg-card border-r">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-foreground">Course Structure</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddChild(null)}
            className="h-7 px-2 text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Module
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {modules.length} {modules.length === 1 ? 'module' : 'modules'}
        </p>
      </div>

      {/* Tree */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {modules.length === 0 ? (
            <div className="text-center py-8 px-4">
              <FolderOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">No modules yet</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddChild(null)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Module
              </Button>
            </div>
          ) : (
            modules.map((module, index) => (
              <TreeNode
                key={module.id}
                module={module}
                depth={0}
                selectedModuleId={selectedModuleId}
                onSelectModule={onSelectModule}
                onAddChild={onAddChild}
                onRename={onRename}
                onDelete={onDelete}
                onReorder={onReorder}
                isFirst={index === 0}
                isLast={index === modules.length - 1}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
