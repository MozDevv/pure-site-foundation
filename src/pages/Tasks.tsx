import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Kanban, ListTodo } from 'lucide-react';

interface TasksProps {
  isGeneratedFromRequirement?: boolean;
  isSprint?: boolean;
}

export default function Tasks({ isGeneratedFromRequirement, isSprint }: TasksProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Kanban className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">
            {isGeneratedFromRequirement ? 'Generated Board' : 'Tasks'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isSprint ? 'Sprint Tasks' : 'Manage your project tasks'}
          </p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-4 gap-4">
        {['To Do', 'In Progress', 'Review', 'Done'].map((column) => (
          <Card key={column} className="flex flex-col">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                {column}
                <span className="text-xs bg-muted px-2 py-0.5 rounded">0</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-2">
              <div className="h-full border-2 border-dashed border-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                <ListTodo className="h-4 w-4 mr-2" />
                Drop tasks here
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
