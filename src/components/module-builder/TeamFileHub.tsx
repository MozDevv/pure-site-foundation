import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Filter,
  Upload,
  Grid,
  List,
  Pin,
  Star,
  MoreHorizontal,
  Download,
  Share,
  Eye,
  Edit,
  Trash2,
  FileText,
  File,
  FileImage,
  FileVideo,
  FileCode,
  Folder,
  Tag,
  Clock,
  User,
  Users,
  ArrowUpDown,
  Calendar,
  Hash,
} from 'lucide-react';
import { apiService, endpoints } from '@/lib/api';

interface TeamFile {
  id: string;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  owner: {
    name: string;
    avatar?: string;
  };
  collaborators: Array<{
    name: string;
    avatar?: string;
  }>;
  tags: string[];
  isPinned: boolean;
  isStarred: boolean;
  views: number;
  versions: number;
  status: 'approved' | 'pending' | 'draft' | 'archived';
}

// Mock data
const mockFiles: TeamFile[] = [
  {
    id: '1',
    name: 'FRD_v2.1.pdf',
    type: 'pdf',
    size: '2.4 MB',
    lastModified: '3h ago',
    owner: { name: 'Alice Chen', avatar: '' },
    collaborators: [
      { name: 'Bob Smith', avatar: '' },
      { name: 'Carol Wang', avatar: '' },
    ],
    tags: ['#Approved', '#Frontend', '#Sprint15'],
    isPinned: true,
    isStarred: false,
    views: 24,
    versions: 3,
    status: 'approved',
  },
  {
    id: '2',
    name: 'Meeting_Minutes_Q3.md',
    type: 'markdown',
    size: '45 KB',
    lastModified: '2h ago',
    owner: { name: 'Bob Smith', avatar: '' },
    collaborators: [{ name: 'Alice Chen', avatar: '' }],
    tags: ['#Meeting', '#Q3', '#Planning'],
    isPinned: false,
    isStarred: true,
    views: 12,
    versions: 1,
    status: 'draft',
  },
  {
    id: '3',
    name: 'API_RFC_v1.2.docx',
    type: 'document',
    size: '856 KB',
    lastModified: '1d ago',
    owner: { name: 'Carol Wang', avatar: '' },
    collaborators: [
      { name: 'Alice Chen', avatar: '' },
      { name: 'David Lee', avatar: '' },
    ],
    tags: ['#RFC', '#Backend', '#Architecture'],
    isPinned: false,
    isStarred: false,
    views: 8,
    versions: 2,
    status: 'pending',
  },
  {
    id: '4',
    name: 'test_scripts.zip',
    type: 'archive',
    size: '12.8 MB',
    lastModified: '3d ago',
    owner: { name: 'David Lee', avatar: '' },
    collaborators: [],
    tags: ['#Testing', '#Automation'],
    isPinned: false,
    isStarred: false,
    views: 5,
    versions: 1,
    status: 'approved',
  },
];

const popularTags = [
  '#Approved',
  '#Frontend',
  '#Backend',
  '#Meeting',
  '#RFC',
  '#Testing',
  '#Sprint15',
  '#Q3',
  '#Architecture',
];

export function TeamFileHub({
  files,
  currentTeam,
}: {
  files: any;
  currentTeam: any;
}) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('modified');
  const [filterType, setFilterType] = useState('all');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const { toast } = useToast();

  const [base64Preview, setBase64Preview] = useState('');

  function mapBackendFileToTeamFile(file: any): TeamFile {
    return {
      id: file.id,
      name: file.name,
      type: file.contentType?.includes('pdf')
        ? 'pdf'
        : file.contentType?.includes('doc')
        ? 'document'
        : file.contentType?.includes('md')
        ? 'markdown'
        : file.contentType?.includes('zip')
        ? 'archive'
        : 'document',
      size: file.size
        ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
        : 'Unknown',
      lastModified: file.uploadedDate
        ? new Date(file.uploadedDate).toLocaleString()
        : 'Unknown',
      owner: { name: 'Alice Chen', avatar: '' }, // Hardcoded
      collaborators: [
        { name: 'Bob Smith', avatar: '' },
        { name: 'Carol Wang', avatar: '' },
      ], // Hardcoded
      tags: ['#Approved', '#Frontend', '#Sprint15'], // Hardcoded
      isPinned: false, // Hardcoded
      isStarred: false, // Hardcoded
      views: 24, // Hardcoded
      versions: 3, // Hardcoded
      status: 'approved', // Hardcoded
    };
  }
  const mappedFiles = files.map(mapBackendFileToTeamFile);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [clickedFile, setClickedFile] = useState(null);
  const getDocumentPreview = async (file) => {
    setClickedFile(file);
    try {
      const res = await apiService.get(endpoints.getDocumentPreview(file.id));
      if (res.status === 200) {
        setBase64Preview(res.data); // base64 string
        console.log('Preview data:', res.data);
        setPreviewFile(file);
        setPreviewOpen(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-500" />;
      case 'markdown':
        return <FileText className="w-8 h-8 text-blue-500" />;
      case 'document':
        return <File className="w-8 h-8 text-blue-600" />;
      case 'image':
        return <FileImage className="w-8 h-8 text-green-500" />;
      case 'video':
        return <FileVideo className="w-8 h-8 text-purple-500" />;
      case 'code':
        return <FileCode className="w-8 h-8 text-orange-500" />;
      case 'archive':
        return <Folder className="w-8 h-8 text-yellow-500" />;
      default:
        return <File className="w-8 h-8 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'draft':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'archived':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredFiles = mappedFiles.filter((file) => {
    const matchesSearch = file.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTag =
      !selectedTag || (file.tags && file.tags.includes(selectedTag));
    const matchesType =
      filterType === 'all' || file.contentType?.includes(filterType);
    return matchesSearch && matchesTag && matchesType;
  });

  const pinnedFiles = mappedFiles.filter((file) => file.isPinned);
  const regularFiles = mappedFiles.filter((file) => !file.isPinned);

  const handleFileAction = (action: string, fileId: string) => {
    toast({
      title: `File ${action}`,
      description: `Action "${action}" performed on file.`,
    });
  };

  const handleUpload = () => {
    toast({
      title: 'Upload started',
      description: 'Your files are being uploaded...',
    });
  };
  const [expanded, setExpanded] = useState(false);
  // Add these states at the top of your component
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Upload handler
  const handleUploadSubmit = async () => {
    console.log('Current Team ID:', currentTeam);
    if (!uploadFile || !uploadName) {
      setUploadError('File and name are required');
      return;
    }
    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('name', uploadName);
      formData.append('description', uploadDescription);

      // Replace with your actual API endpoint
      const res = await apiService.post(
        endpoints.uploadFileTeam(
          uploadName,
          uploadDescription,
          currentTeam?.id
        ),
        formData
      );
      if (res.status === 200) {
        toast({
          title: 'File uploaded',
          description: `${uploadName} uploaded successfully.`,
          variant: 'success',
        });
        // Map backend file to TeamFile and add to files
        const newTeamFile = mapBackendFileToTeamFile(res.data);
        // If files is state, update it; if prop, update parent
        if (Array.isArray(files)) {
          files.unshift(newTeamFile); // Add to start of array
        }
        setUploadDialogOpen(false);
        setUploadFile(null);
        setUploadName('');
        setUploadDescription('');
      } else {
        setUploadError('Upload failed');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Team File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <label
                htmlFor="team-file-upload"
                className="text-sm font-medium text-muted-foreground"
              >
                Select File
              </label>
              <Input
                id="team-file-upload"
                type="file"
                accept=".pdf,.doc,.docx,.md,.zip"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                disabled={uploading}
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="team-file-name"
                className="text-sm font-medium text-muted-foreground"
              >
                File Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="team-file-name"
                type="text"
                placeholder="File Name (required)"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                disabled={uploading}
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="team-file-description"
                className="text-sm font-medium text-muted-foreground"
              >
                Description
              </label>
              <Input
                id="team-file-description"
                type="text"
                placeholder="Description (optional)"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                disabled={uploading}
              />
            </div>
            {uploadError && (
              <div className="text-destructive text-sm">{uploadError}</div>
            )}
            <Button
              onClick={handleUploadSubmit}
              disabled={uploading || !uploadFile || !uploadName}
              className="w-full"
            >
              {uploading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] p-0 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Preview Area */}
            <div className="flex-1 bg-background p-6 flex flex-col items-center justify-center">
              <div className="flex items-center justify-between w-full mb-4">
                <DialogHeader>
                  <DialogTitle className="truncate">
                    {previewFile?.name}
                  </DialogTitle>
                </DialogHeader>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewOpen(false)}
                    title="Close"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpanded((prev) => !prev)}
                    title={expanded ? 'Contract' : 'Expand'}
                  >
                    {expanded ? (
                      <ArrowUpDown className="w-4 h-4" />
                    ) : (
                      <ArrowUpDown className="w-4 h-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" asChild title="Download">
                    <a
                      href={previewFile?.filePath || '#'}
                      download={previewFile?.name || true}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
              <div
                className={`w-full ${
                  expanded ? 'h-[80vh]' : 'h-[500px]'
                } flex items-center justify-center border rounded bg-muted`}
              >
                {base64Preview ? (
                  clickedFile?.type === 'pdf' ? (
                    <iframe
                      src={base64Preview}
                      title="PDF Preview"
                      className="w-full h-full border-none rounded"
                    />
                  ) : (
                    <img
                      src={base64Preview}
                      alt={previewFile?.name}
                      className="max-w-full max-h-full mx-auto"
                    />
                  )
                ) : (
                  <div className="text-center text-muted-foreground w-full h-full flex items-center justify-center">
                    No preview available
                  </div>
                )}
              </div>
            </div>
            {/* Metadata Sidebar */}
            <div className="w-full md:w-80 bg-muted/40 p-6 border-l flex flex-col gap-4">
              <div>
                <span className="font-semibold text-sm text-muted-foreground">
                  Type:
                </span>
                <span className="ml-2">{previewFile?.type}</span>
              </div>
              <div>
                <span className="font-semibold text-sm text-muted-foreground">
                  Size:
                </span>
                <span className="ml-2">{previewFile?.size}</span>
              </div>
              <div>
                <span className="font-semibold text-sm text-muted-foreground">
                  Modified:
                </span>
                <span className="ml-2">{previewFile?.lastModified}</span>
              </div>
              <div>
                <span className="font-semibold text-sm text-muted-foreground">
                  Owner:
                </span>
                <span className="ml-2">{previewFile?.owner?.name}</span>
              </div>
              <div>
                <span className="font-semibold text-sm text-muted-foreground">
                  Status:
                </span>
                <Badge
                  className={`ml-2 text-xs ${getStatusColor(
                    previewFile?.status
                  )}`}
                >
                  {previewFile?.status}
                </Badge>
              </div>
              <div>
                <span className="font-semibold text-sm text-muted-foreground">
                  Tags:
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {previewFile?.tags?.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs px-2 py-0"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-semibold text-sm text-muted-foreground">
                  Views:
                </span>
                <span className="ml-2">{previewFile?.views}</span>
              </div>
              <div>
                <span className="font-semibold text-sm text-muted-foreground">
                  Versions:
                </span>
                <span className="ml-2">{previewFile?.versions}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Smart Header Bar */}
      <div className="space-y-4">
        {/* Pinned Files */}
        {pinnedFiles.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Pin className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                Pinned Files
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {pinnedFiles.map((file) => (
                <Badge
                  key={file.id}
                  variant="outline"
                  className="flex items-center gap-1.5 py-1.5 px-3 hover-scale cursor-pointer"
                >
                  {getFileIcon(file.type)}
                  <span className="text-xs">{file.name}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-1 gap-2 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search files... (type:doc owner:@me)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="pdf">PDFs</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="markdown">Markdown</SelectItem>
                <SelectItem value="archive">Archives</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modified">Last Modified</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="size">Size</SelectItem>
                <SelectItem value="views">Most Viewed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <div className="flex border border-border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            <Button
              onClick={() => setUploadDialogOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        {/* Tag Cloud */}
        <div className="space-y-2">
          <span className="text-sm font-medium text-muted-foreground">
            Popular Tags
          </span>
          <div className="flex flex-wrap gap-1">
            <Badge
              variant={selectedTag === '' ? 'default' : 'outline'}
              className="cursor-pointer hover-scale"
              onClick={() => setSelectedTag('')}
            >
              All
            </Badge>
            {popularTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? 'default' : 'outline'}
                className="cursor-pointer hover-scale"
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* File Grid/List */}
      <div className="space-y-4">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {regularFiles.map((file) => (
              <Card
                onClick={() => getDocumentPreview(file)}
                key={file.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-200 animate-fade-in"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {file.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {file.size}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => getDocumentPreview(file)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleFileAction('edit', file.id)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleFileAction('download', file.id)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleFileAction('share', file.id)}
                        >
                          <Share className="w-4 h-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleFileAction('delete', file.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {/* Collaborators */}
                  {/* Last Modified */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>Edited {file.lastModified}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {file.tags.slice(0, 2).map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs px-2 py-0"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {file.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs px-2 py-0">
                        +{file.tags.length - 2}
                      </Badge>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between">
                    {/* <Badge className={`text-xs ${getStatusColor(file.status)}`}>
                      {file.status}
                    </Badge> */}
                    <div className=""></div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Eye className="w-3 h-3" />
                      <span>{file.views}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr className="text-left">
                      <th className="p-4 font-medium text-sm">Name</th>
                      <th className="p-4 font-medium text-sm">Modified</th>
                      <th className="p-4 font-medium text-sm">Owner</th>
                      <th className="p-4 font-medium text-sm">Tags</th>
                      <th className="p-4 font-medium text-sm">Status</th>
                      <th className="p-4 font-medium text-sm">Views</th>
                      <th className="p-4 font-medium text-sm"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {regularFiles.map((file) => (
                      <tr
                        key={file.id}
                        className="border-b border-border hover:bg-secondary/50 transition-colors animate-fade-in"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {getFileIcon(file.type)}
                            <div>
                              <p className="font-medium text-sm">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {file.size}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {file.lastModified}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">
                                {file.owner.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{file.owner.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {file.tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs px-2 py-0"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            className={`text-xs ${getStatusColor(file.status)}`}
                          >
                            {file.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {file.views}
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleFileAction('view', file.id)
                                }
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleFileAction('edit', file.id)
                                }
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleFileAction('download', file.id)
                                }
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleFileAction('share', file.id)
                                }
                              >
                                <Share className="w-4 h-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleFileAction('delete', file.id)
                                }
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <Folder className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No files found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedTag
              ? 'Try adjusting your search or filter criteria.'
              : 'Upload your first team file to get started.'}
          </p>
          <Button onClick={handleUpload}>
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </Button>
        </div>
      )}
    </div>
  );
}
