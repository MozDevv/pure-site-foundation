import KanbanBoard from '@/components/KanbanBoard';

interface TasksProps {
  isGeneratedFromRequirement?: boolean;
  isSprint?: boolean;
  teamId?: string;
}

export default function Tasks({ teamId }: TasksProps) {
  return <KanbanBoard teamId={teamId} />;
}
