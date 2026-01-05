import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Chip,
  TextField,
  Button,
  CircularProgress,
  Divider,
  Avatar,
  Collapse,
  Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Comment as CommentIcon,
  Send as SendIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import { apiService, endpoints } from '@/lib/api';

interface FileMetadata {
  id: string;
  name: string;
  type?: string;
  contentType?: string;
  size?: string | number;
  lastModified?: string;
  uploadedDate?: string;
  filePath?: string;
  owner?: {
    name: string;
    avatar?: string;
  };
  status?: string;
  tags?: string[];
  views?: number;
  versions?: number;
  description?: string;
}

interface Comment {
  id: string;
  message: string;
  createdAt: string;
  author: string;
}

interface FilePreviewDialogProps {
  file: FileMetadata | null;
  open: boolean;
  onClose: () => void;
}

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'approved':
      return 'success';
    case 'pending':
      return 'warning';
    case 'draft':
      return 'info';
    case 'archived':
      return 'default';
    default:
      return 'default';
  }
};

const formatFileSize = (size?: string | number): string => {
  if (!size) return 'Unknown';
  if (typeof size === 'string') return size;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Unknown';
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return dateString;
  }
};

export default function FilePreviewDialog({
  file,
  open,
  onClose,
}: FilePreviewDialogProps) {
  const [expanded, setExpanded] = useState(false);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Fetch preview when file changes
  useEffect(() => {
    if (file && open) {
      fetchPreview();
      fetchComments();
    } else {
      setPreviewContent(null);
      setComments([]);
    }
  }, [file, open]);

  const fetchPreview = async () => {
    if (!file?.id) return;
    setLoading(true);
    try {
      const res = await apiService.get(endpoints.getDocumentPreview(file.id));
      if (res.status === 200) {
        setPreviewContent(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch preview:', error);
      setPreviewContent(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!file?.id) return;
    setCommentsLoading(true);
    try {
      const res = await apiService.get(`/documents/${file.id}/comments`);
      if (res.status === 200) {
        setComments(res.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!file?.id || !newComment.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await apiService.post(`/documents/${file.id}/comments`, {
        message: newComment.trim(),
        documentId: file.id,
      });
      if (res.status === 200 || res.status === 201) {
        setComments((prev) => [...prev, res.data]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDownload = () => {
    if (file?.filePath) {
      window.open(file.filePath, '_blank');
    }
  };

  const isPdf = file?.type === 'pdf' || file?.contentType?.includes('pdf');
  const isImage =
    file?.type === 'image' ||
    file?.contentType?.includes('image') ||
    file?.contentType?.includes('png') ||
    file?.contentType?.includes('jpg') ||
    file?.contentType?.includes('jpeg');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullScreen={expanded}
      PaperProps={{
        sx: {
          width: expanded ? '100%' : '90vw',
          maxWidth: expanded ? '100%' : '1400px',
          height: expanded ? '100%' : '85vh',
          maxHeight: expanded ? '100%' : '85vh',
          m: expanded ? 0 : 2,
          borderRadius: expanded ? 0 : 2,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <DialogTitle sx={{ p: 0, flex: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            noWrap
            sx={{ fontWeight: 600, maxWidth: '500px' }}
          >
            {file?.name || 'File Preview'}
          </Typography>
        </DialogTitle>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={() => setCommentsOpen(!commentsOpen)}
            title={commentsOpen ? 'Hide Comments' : 'Show Comments'}
            color={commentsOpen ? 'primary' : 'default'}
          >
            <CommentIcon />
          </IconButton>
          <IconButton onClick={handleDownload} title="Download">
            <DownloadIcon />
          </IconButton>
          <IconButton
            onClick={() => setExpanded(!expanded)}
            title={expanded ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {expanded ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
          <IconButton onClick={onClose} title="Close">
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <DialogContent sx={{ p: 0, display: 'flex', overflow: 'hidden' }}>
        {/* Main Preview Area */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.100',
              overflow: 'auto',
              p: 2,
            }}
          >
            {loading ? (
              <CircularProgress />
            ) : previewContent ? (
              isPdf ? (
                <iframe
                  src={previewContent}
                  title="PDF Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: 8,
                  }}
                />
              ) : isImage ? (
                <img
                  src={previewContent}
                  alt={file?.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: 8,
                  }}
                />
              ) : (
                <Box sx={{ textAlign: 'center', p: 4 }}>
                  <Typography variant="body1" color="text.secondary" mb={2}>
                    Preview not available for this file type
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownload}
                  >
                    Download File
                  </Button>
                </Box>
              )
            ) : (
              <Typography variant="body1" color="text.secondary">
                No preview available
              </Typography>
            )}
          </Box>

          {/* File Metadata Footer */}
          <Box
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 3,
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Type
              </Typography>
              <Typography variant="body2">
                {file?.contentType || file?.type || 'Unknown'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Size
              </Typography>
              <Typography variant="body2">
                {formatFileSize(file?.size)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Modified
              </Typography>
              <Typography variant="body2">
                {formatDate(file?.lastModified || file?.uploadedDate)}
              </Typography>
            </Box>
            {file?.owner && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Owner
                </Typography>
                <Typography variant="body2">{file.owner.name}</Typography>
              </Box>
            )}
            {file?.status && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Box mt={0.5}>
                  <Chip
                    label={file.status}
                    size="small"
                    color={getStatusColor(file.status) as any}
                  />
                </Box>
              </Box>
            )}
            {file?.tags && file.tags.length > 0 && (
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Typography variant="caption" color="text.secondary">
                  Tags
                </Typography>
                <Box
                  sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}
                >
                  {file.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* Comments Sidebar */}
        <Collapse in={commentsOpen} orientation="horizontal">
          <Box
            sx={{
              width: 350,
              height: '100%',
              borderLeft: 1,
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.paper',
            }}
          >
            {/* Comments Header */}
            <Box
              sx={{
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CommentIcon fontSize="small" color="primary" />
                <Typography variant="subtitle1" fontWeight={600}>
                  Comments
                </Typography>
                <Chip
                  label={comments.length}
                  size="small"
                  color="primary"
                  sx={{ minWidth: 24, height: 20 }}
                />
              </Box>
              <IconButton
                size="small"
                onClick={() => setCommentsOpen(false)}
                title="Hide Comments"
              >
                <ChevronRightIcon />
              </IconButton>
            </Box>

            {/* Comments List */}
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                p: 2,
              }}
            >
              {commentsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : comments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CommentIcon
                    sx={{ fontSize: 48, color: 'grey.300', mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    No comments yet
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Be the first to add a comment
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {comments.map((comment) => (
                    <Paper
                      key={comment.id}
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: 'grey.50',
                        borderRadius: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            fontSize: 12,
                            bgcolor: 'primary.main',
                          }}
                        >
                          {comment.author
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase() || 'U'}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {comment.author || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(comment.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                      >
                        {comment.message}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>

            {/* Add Comment */}
            <Box
              sx={{
                p: 2,
                borderTop: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <TextField
                fullWidth
                multiline
                minRows={2}
                maxRows={4}
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={submittingComment}
                size="small"
                sx={{ mb: 1 }}
              />
              <Button
                fullWidth
                variant="contained"
                startIcon={
                  submittingComment ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <SendIcon />
                  )
                }
                onClick={handleAddComment}
                disabled={!newComment.trim() || submittingComment}
              >
                {submittingComment ? 'Sending...' : 'Add Comment'}
              </Button>
            </Box>
          </Box>
        </Collapse>
      </DialogContent>
    </Dialog>
  );
}
