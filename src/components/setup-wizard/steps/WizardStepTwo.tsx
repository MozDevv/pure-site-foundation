import React, { useEffect, useImperativeHandle, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Kanban, ListChecks, Layers, Plus, Trash2 } from 'lucide-react';
import { WizardData } from '../TeamSetupWizard';
import SimpleInputTable from '../../SimpleInputTable';
import { API_BASE_URL, apiService, endpoints } from '@/services/api';
import { useIncompleteTeamIdStore } from '@/services/store';
import { Checkbox } from '@/components/ui/checkbox';
import GenerateBoardDialog from '../../GenerateBoardDialog';
import { useSelectedTeamStore, useTeamResourceStore } from '@/services/store';
import Tasks from '@/pages/Tasks';
import axios from 'axios';
import { ExcelDropzone } from '@/components/ui/ExcelDropzone';

interface WizardStepTwoProps {
  data: WizardData;
  onUpdate: (updates: Partial<WizardData>) => void;
}

// Dummy templates for requirements, epics, stories
const REQUIREMENT_TYPES = [
  { id: 'user-story', name: 'User Story' },
  { id: 'requirement', name: 'Requirement' },
  { id: 'backlog-item', name: 'Backlog Item' },
];

const EPIC_COLORS = [
  { id: '#7c3aed', name: 'Purple' },
  { id: '#2563eb', name: 'Blue' },
  { id: '#059669', name: 'Green' },
  { id: '#f59e42', name: 'Orange' },
];

const IMPORTANCE_ENUMS = [
  { id: 'CRITICAL', name: 'Critical', cellColor: '#ef4444' }, // Red
  { id: 'HIGH', name: 'High', cellColor: '#f59e42' }, // Orange
  { id: 'MEDIUM', name: 'Medium', cellColor: '#fbbf24' }, // Yellow
  { id: 'LOW', name: 'Low', cellColor: '#22c55e' }, // Green
];

const STATUS_ENUMS = [
  { id: 'REQUESTED', name: 'Requested' },
  { id: 'UNDER_REVIEW', name: 'Under Review' },
  { id: 'REJECTED', name: 'Rejected' },
  { id: 'ACCEPTED', name: 'Accepted' },
  { id: 'PLANNED', name: 'Planned' },
  { id: 'IN_PROGRESS', name: 'In Progress' },
  { id: 'DEVELOPED', name: 'Developed' },
  { id: 'TESTED', name: 'Tested' },
  { id: 'COMPLETED', name: 'Completed' },
  { id: 'OBSOLETE', name: 'Obsolete' },
  { id: 'READY_FOR_REVIEW', name: 'Ready for Review' },
  { id: 'READY_FOR_TEST', name: 'Ready for Test' },
  { id: 'RELEASED', name: 'Released' },
  { id: 'DESIGN_IN_PROCESS', name: 'Design in Process' },
  { id: 'DESIGN_APPROVAL', name: 'Design Approval' },
  { id: 'DOCUMENTED', name: 'Documented' },
];

export const REQUIREMENT_TYPE_ENUMS = [
  { id: 'DESIGN_ELEMENT', name: 'Design Element', chipColor: '#6366F1' }, // Indigo
  { id: 'EPIC', name: 'Epic', chipColor: '#EF4444' }, // Red
  { id: 'FEATURE', name: 'Feature', chipColor: '#F59E0B' }, // Amber
  { id: 'NEED', name: 'Need', chipColor: '#10B981' }, // Emerald
  { id: 'QUALITY', name: 'Quality', chipColor: '#06B6D4' }, // Cyan
  { id: 'USE_CASE', name: 'Use Case', chipColor: '#8B5CF6' }, // Violet
  { id: 'USER_STORY', name: 'User Story', chipColor: '#3B82F6' }, // Blue
  { id: 'TASK', name: 'Task', chipColor: '#22C55E' }, // Green
];

export interface WizardStepOneHandle {
  saveData: () => Promise<boolean>;
}
export const WizardStepTwo = React.forwardRef<
  WizardStepOneHandle,
  WizardStepTwoProps
>(({ data, onUpdate }, ref) => {
  // Requirement Dialog
  const [openRequirementDialog, setOpenRequirementDialog] = useState(false);
  const [requirementForm, setRequirementForm] = useState({
    title: '',
    description: '',
    type: 'user-story',
    priority: 'Medium',
  });

  useImperativeHandle(ref, () => ({
    saveData: async () => {
      return await handleSave();
    },
  }));
  const [isSaving, setIsSaving] = useState(false);
  const { incompleteTeamId, setIncompleteTeamId } = useIncompleteTeamIdStore();

  const handleSave = async (): Promise<boolean> => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    return true;
  };

  // Story Dialog

  const [openTasks, setOpenTasks] = useState(false);
  const [fetchedData, setFetchedData] = useState(null);
  const handleImportExcel = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };
  const [openBoardDialog, setOpenBoardDialog] = useState(false);
  const [openExcelDialog, setOpenExcelDialog] = useState(false);
  const handlers = {
    'Generate Boards': () => {
      setOpenBoardDialog(true);
    },
    'Generate Excel Template': () => {
      generateMembersTemplate();
    },
    'Import from Excel': () => {
      setOpenExcelDialog(true);
    },
    'Export to Excel': () => {},

    'Print Table': () => {},
    'Reset Table': () => {},
  };
  const [loading, setLoading] = useState(false);
  const handleGeneratingBoard = async (data) => {
    setLoading(true);
    try {
      const res = await apiService.post(
        endpoints.generateBoardFromRequirements,
        data
      );
      if (res.status === 200) {
        useTeamResourceStore.getState().setSelectedTeam(incompleteTeamId);
        useTeamResourceStore.getState().setResourceType('boards');
        useTeamResourceStore.getState().setResources([res.data]);

        //add a timeout
        setTimeout(() => {
          setOpenTasks(true);
        }, 2500);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const loaderMessages = [
    'Initializing board generation engine...',
    'Parsing requirements dataset...',
    'Configuring workflow columns...',
    'Allocating tasks to board structure...',
    'Finalizing board schema and relationships...',
    'Syncing data and preparing your workspace...',
    'Board successfully generated. Launching interface...',
  ];
  const [loaderStep, setLoaderStep] = useState(0);

  useEffect(() => {
    if (!loading) return;
    setLoaderStep(0);
    const interval = setInterval(() => {
      setLoaderStep((step) => (step + 1) % loaderMessages.length);
    }, 900);
    return () => clearInterval(interval);
  }, [loading]);

  const generateMembersTemplate = async () => {
    const token = localStorage.getItem('token'); // Replace 'token' with the actual key used in your app

    try {
      // Fetch the file as a blob
      const response = await axios.get(
        `${API_BASE_URL}/requirements/api/excel/requirement-template`,
        {
          responseType: 'blob', // Specify that the response is a binary Blob
          headers: {
            Authorization: `Bearer ${token}`, // Add the token to the Authorization header
          },
        }
      );

      const blob = new Blob([response.data], {
        type: response.headers['content-type'],
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Requirement Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove(); // Clean up
      window.URL.revokeObjectURL(url); // Release memory
    } catch (error) {
      console.error('Error downloading te file:', error);
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const handleExcelFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('token'); // or however you get your auth token

        const response = await axios.post(
          `${API_BASE_URL}/requirements/import-requirements-excel`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        // Handle the response (response.data should be your List<RequirementDto>)
        console.log('Imported requirements:', response.data);
        // Optionally update your state with the imported requirements
        // setFetchedData(response.data);
      } catch (error) {
        console.error('Error uploading Excel file:', error);
        // Optionally show a toast or error message
      }
    }
  };
  return (
    <div className="space-y-8">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary border-4 mb-6"></div>
            <div className="text-lg font-semibold text-primary mb-2">
              {loaderMessages[loaderStep]}
            </div>
            <div className="text-muted-foreground text-sm text-center">
              Creating your board, columns, and tasks...
              <br />
              This usually takes 3–6 seconds. Grab a ☕!
            </div>
          </div>
        </div>
      )}
      <Dialog open={openExcelDialog} onOpenChange={setOpenExcelDialog}>
        <DialogContent className="w-[700px] h-[30vh] ">
          <DialogHeader>
            <DialogTitle>Upload Excel File</DialogTitle>
          </DialogHeader>
          <ExcelDropzone onFileAccepted={handleExcelFileChange} />
          <div className="flex  gap-4 justify-end mt-4">
            <Button variant="outline" onClick={() => setOpenExcelDialog(false)}>
              Close
            </Button>
            <Button
              variant="default"
              onClick={() => {
                fileInputRef.current?.click();
              }}
            >
              Proceed
            </Button>
          </div>
        </DialogContent>
        <DialogFooter></DialogFooter>
      </Dialog>
      <Dialog open={openTasks} onOpenChange={setOpenTasks}>
        <DialogContent className="w-[98vw] max-w-[1800px] h-[90vh] p-6 flex flex-col">
          <div className="flex-1 min-h-0">
            <Tasks isGeneratedFromRequirement={true} isSprint={false} />
          </div>
        </DialogContent>
      </Dialog>

      <GenerateBoardDialog
        open={openBoardDialog}
        onOpenChange={setOpenBoardDialog}
        fetchedData={fetchedData}
        REQUIREMENT_TYPE_ENUMS={REQUIREMENT_TYPE_ENUMS}
        STATUS_ENUMS={STATUS_ENUMS}
        onSave={(boardSettings) => {
          handleGeneratingBoard(boardSettings);
        }}
      />
      {/* Requirements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <ListChecks className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Requirements</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Capture user stories, requirements, or backlog items
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <SimpleInputTable
            fields={[
              {
                label: 'Description',
                value: 'description',
                type: 'textarea',
              },
              {
                label: 'Type',
                value: 'type',
                type: 'select',
                options: REQUIREMENT_TYPE_ENUMS,
              },
              {
                label: 'Importance',
                value: 'importance',
                type: 'select',
                options: IMPORTANCE_ENUMS,
              },
              {
                label: 'Status',
                value: 'status',
                type: 'select',
                options: STATUS_ENUMS,
              },

              {
                label: 'Parent Requirement',
                value: 'parentId',
                type: 'select',
                notRequired: true,
                options: fetchedData && fetchedData,
                cellEditorParams: (params) => ({
                  values: (fetchedData || [])
                    .filter((opt) => opt.id !== params.data.id) // Exclude self
                    .map((opt) => opt.id),
                }),
                valueFormatter: (params) => {
                  const opt = (fetchedData || []).find(
                    (o) => o.id === params.value
                  );
                  return opt ? opt.name : '';
                },
              },
            ]}
            handlers={handlers}
            setFetchedData={setFetchedData}
            saveId={incompleteTeamId}
            saveIdTitle="teamId"
            getEndpoint={endpoints.getTeamRequirements(incompleteTeamId)}
            postEndpoint={endpoints.createRequirement}
            putEndpoint={endpoints.updateRequirement}
            deleteEndpoint={endpoints.deleteRequirement}
          />
        </CardContent>
      </Card>
    </div>
  );
});
