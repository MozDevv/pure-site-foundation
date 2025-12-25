import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface GenerateBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fetchedData: any;
  REQUIREMENT_TYPE_ENUMS: { id: string; name: string; chipColor?: string }[];
  STATUS_ENUMS: { id: string; name: string }[];
  onSave: (settings: any) => void;
}

export default function GenerateBoardDialog({
  open,
  onOpenChange,
  fetchedData,
  REQUIREMENT_TYPE_ENUMS,
  STATUS_ENUMS,
  onSave,
}: GenerateBoardDialogProps) {
  const [boardName, setBoardName] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const handleSave = () => {
    onSave({
      boardName,
      types: selectedTypes,
      statuses: selectedStatuses,
      requirements: fetchedData,
    });
    onOpenChange(false);
  };

  const toggleType = (typeId: string) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId]
    );
  };

  const toggleStatus = (statusId: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(statusId) ? prev.filter((s) => s !== statusId) : [...prev, statusId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Board from Requirements</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Board Name</Label>
            <Input
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              placeholder="Enter board name..."
            />
          </div>

          <div className="space-y-2">
            <Label>Requirement Types to Include</Label>
            <div className="grid grid-cols-2 gap-2">
              {REQUIREMENT_TYPE_ENUMS.map((type) => (
                <div key={type.id} className="flex items-center gap-2">
                  <Checkbox
                    id={type.id}
                    checked={selectedTypes.includes(type.id)}
                    onCheckedChange={() => toggleType(type.id)}
                  />
                  <label htmlFor={type.id} className="text-sm cursor-pointer">
                    {type.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Statuses for Columns</Label>
            <div className="grid grid-cols-3 gap-2">
              {STATUS_ENUMS.map((status) => (
                <div key={status.id} className="flex items-center gap-2">
                  <Checkbox
                    id={status.id}
                    checked={selectedStatuses.includes(status.id)}
                    onCheckedChange={() => toggleStatus(status.id)}
                  />
                  <label htmlFor={status.id} className="text-sm cursor-pointer">
                    {status.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Generate Board</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
