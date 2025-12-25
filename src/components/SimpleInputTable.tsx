import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, Save, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Field {
  label: string;
  value: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  options?: { id: string; name: string; chipColor?: string; cellColor?: string }[];
  notRequired?: boolean;
  cellEditorParams?: (params: any) => any;
  valueFormatter?: (params: any) => string;
}

interface SimpleInputTableProps {
  fields: Field[];
  handlers?: Record<string, () => void>;
  setFetchedData?: (data: any) => void;
  saveId?: string;
  saveIdTitle?: string;
  getEndpoint?: string;
  postEndpoint?: string;
  putEndpoint?: string;
  deleteEndpoint?: string;
}

export default function SimpleInputTable({
  fields,
  handlers,
  setFetchedData,
  saveId,
  saveIdTitle,
  getEndpoint,
  postEndpoint,
  putEndpoint,
  deleteEndpoint,
}: SimpleInputTableProps) {
  const [rows, setRows] = useState<any[]>([]);
  const [editingRow, setEditingRow] = useState<number | null>(null);

  // Initialize with empty row
  useEffect(() => {
    if (rows.length === 0) {
      addNewRow();
    }
  }, []);

  const addNewRow = () => {
    const newRow: any = { id: `temp-${Date.now()}` };
    fields.forEach((field) => {
      newRow[field.value] = '';
    });
    setRows([...rows, newRow]);
    setEditingRow(rows.length);
  };

  const updateRow = (index: number, field: string, value: any) => {
    const updatedRows = [...rows];
    updatedRows[index] = { ...updatedRows[index], [field]: value };
    setRows(updatedRows);
    if (setFetchedData) {
      setFetchedData(updatedRows);
    }
  };

  const deleteRow = (index: number) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(updatedRows);
    if (setFetchedData) {
      setFetchedData(updatedRows);
    }
  };

  const renderCell = (row: any, field: Field, rowIndex: number) => {
    const isEditing = editingRow === rowIndex;
    const value = row[field.value];

    if (!isEditing) {
      if (field.type === 'select' && field.options) {
        const option = field.options.find((opt) => opt.id === value);
        return (
          <span
            className="px-2 py-1 rounded text-xs font-medium"
            style={{
              backgroundColor: option?.chipColor || option?.cellColor || 'transparent',
              color: option?.chipColor || option?.cellColor ? 'white' : 'inherit',
            }}
          >
            {option?.name || value || '-'}
          </span>
        );
      }
      return <span className="text-sm">{value || '-'}</span>;
    }

    switch (field.type) {
      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(v) => updateRow(rowIndex, field.value, v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => updateRow(rowIndex, field.value, e.target.value)}
            className="min-h-[60px] text-xs"
            placeholder={field.label}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => updateRow(rowIndex, field.value, e.target.value)}
            className="h-8 text-xs"
            placeholder={field.label}
          />
        );
      default:
        return (
          <Input
            value={value}
            onChange={(e) => updateRow(rowIndex, field.value, e.target.value)}
            className="h-8 text-xs"
            placeholder={field.label}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" onClick={addNewRow}>
          <Plus className="h-4 w-4 mr-1" />
          Add Row
        </Button>
        {handlers &&
          Object.entries(handlers).map(([label, handler]) => (
            <Button key={label} size="sm" variant="outline" onClick={handler}>
              {label}
            </Button>
          ))}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {fields.map((field) => (
                <TableHead key={field.value} className="text-xs font-medium">
                  {field.label}
                  {!field.notRequired && <span className="text-destructive ml-1">*</span>}
                </TableHead>
              ))}
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow
                key={row.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setEditingRow(rowIndex)}
              >
                {fields.map((field) => (
                  <TableCell key={field.value} className="py-2">
                    {renderCell(row, field, rowIndex)}
                  </TableCell>
                ))}
                <TableCell className="py-2">
                  <div className="flex items-center gap-1">
                    {editingRow === rowIndex && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingRow(null);
                        }}
                      >
                        <Save className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteRow(rowIndex);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={fields.length + 1} className="text-center py-8 text-muted-foreground">
                  No data yet. Click "Add Row" to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
