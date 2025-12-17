import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  LinearProgress,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Autocomplete,
  Tooltip,
  Alert,
  Snackbar,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';

import { apiService, endpoints } from '@/lib/api';
import { Badge } from '@mui/material';

export const UserAvatar = ({
  user = {},
  height,
  width,
  fontSize,
  fontWeight = 600,
}) => {
  const initials =
    `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() ||
    '?';

  const getColorScheme = (key) => {
    const hash = Array.from(key).reduce(
      (acc, char) => acc + char.charCodeAt(0),
      0
    );

    const palettes = [
      { bg: 'linear-gradient(135deg,#4f46e5,#6d28d9)', color: '#fff' }, // indigo gradient
      { bg: 'linear-gradient(135deg,#06b6d4,#0891b2)', color: '#fff' }, // teal gradient
      { bg: 'linear-gradient(135deg,#ef4444,#f97316)', color: '#fff' }, // warm red->orange
      { bg: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff' }, // green gradient
      { bg: 'linear-gradient(135deg,#f472b6,#fb7185)', color: '#111' }, // pink -> light red (dark text)
      { bg: 'linear-gradient(135deg,#f59e0b,#f97316)', color: '#111' }, // amber -> orange
      { bg: 'linear-gradient(135deg,#60a5fa,#3b82f6)', color: '#fff' }, // light -> blue
      { bg: 'linear-gradient(135deg,#a78bfa,#7c3aed)', color: '#fff' }, // purple gradient
      { bg: 'linear-gradient(135deg,#34d399,#10b981)', color: '#fff' }, // mint green
      { bg: 'linear-gradient(135deg,#fbbf24,#f59e0b)', color: '#111' }, // gold tones
      { bg: 'linear-gradient(135deg,#e879f9,#a78bfa)', color: '#111' }, // lilac
      { bg: 'linear-gradient(135deg,#38bdf8,#0ea5e9)', color: '#fff' }, // sky blue
    ];

    return palettes[hash % palettes.length];
  };

  const colorScheme = getColorScheme(initials);

  return (
    <Badge
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      badgeContent={user.status === 'verified' ? null : null}
    >
      <Avatar
        sx={{
          bgcolor: 'transparent',
          backgroundImage: colorScheme.bg,
          color: colorScheme.color,
          width: width || 45,
          height: height || 45,
          fontWeight: 500,
          fontSize: fontSize || 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        }}
      >
        {initials}
      </Avatar>
    </Badge>
  );
};

function ProjectMembers({ projectId, users, members, isStudents }) {
  const [projectMembers, setProjectMembers] = useState(members || []);
  const [loading, setLoading] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    member: null,
  });
  const refreshCourse = async () => {
    if (!projectId) return;
    try {
      const res = await apiService.get(endpoints.getAllCourses);
      if (res.status === 200) {
        const updatedCourse = res.data.find((c) => c.id === projectId);
        if (isStudents) {
          setProjectMembers(updatedCourse.enrolledStudents);
        } else {
          setProjectMembers(updatedCourse.tutors);
        }
      }
    } catch (error) {
      console.log('Error refreshing course:', error);
    }
  };
  useEffect(() => {
    refreshCourse();
  }, [projectId]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchProjectMembers = async () => {};
  const handleAddMembers = async () => {
    const userIds = selectedUsers.map((user) => user.id);
    const endpoint = isStudents
      ? endpoints.addMembersToCourse(projectId)
      : endpoints.addTutorsToCourse(projectId);
    try {
      setLoading(true);
      const promises = selectedUsers.map((user) =>
        apiService.post(endpoint, userIds)
      );
      await Promise.all(promises);
      showSnackbar(
        `Successfully added ${selectedUsers.length} member(s)`,
        'success'
      );
      setAddDialogOpen(false);
      setSelectedUsers([]);
      fetchProjectMembers();
      refreshCourse();
    } catch (error) {
      console.error('Error adding members:', error);
      showSnackbar('Error adding members', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async () => {
    try {
      setLoading(true);

      await apiService.post(endpoints.removeMemberFromCourse(projectId), [
        deleteDialog.member.id,
      ]);
      showSnackbar('Member removed successfully', 'success');
      setDeleteDialog({ open: false, member: null });
      fetchProjectMembers();
      refreshCourse();
    } catch (error) {
      console.error('Error deleting member:', error);
      showSnackbar('Error removing member', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusColor = (status) => {
    if (!status) return 'default';
    const statusLower = status.toLowerCase();
    if (statusLower === 'available') return 'success';
    if (statusLower === 'busy') return 'warning';
    if (statusLower === 'offline') return 'default';
    return 'info';
  };

  const getWorkloadColor = (workload) => {
    if (workload >= 90) return 'error';
    if (workload >= 70) return 'warning';
    return 'success';
  };

  const availableUsers = users.filter(
    (user) => !projectMembers.find((member) => member.id === user.id)
  );

  // if (selectedMember) {
  //   return (
  //     <MemberProfile
  //       member={selectedMember}
  //       onBack={() => setSelectedMember(null)}
  //       projectId={projectId}
  //     />
  //   );
  // }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={() => setAddDialogOpen(true)}
          disabled={availableUsers.length === 0}
        >
          Add Members
        </Button>
      </Box>

      <Box>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && projectMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography>Loading members...</Typography>
                </TableCell>
              </TableRow>
            ) : projectMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="textSecondary">
                    No team members added yet
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              projectMembers.map((member) => (
                <TableRow key={member.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <UserAvatar user={member} />
                      <Box>
                        <Typography variant="body1" fontWeight="500">
                          {member.firstName} {member.lastName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          @{member.username}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {member.role || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{member.age ?? '-'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {member.location || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{member.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        member.status === 'ACTIVE'
                          ? 'Active'
                          : member.status || '-'
                      }
                      color={member.status === 'ACTIVE' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Profile">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => setSelectedMember(member)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove Member">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteDialog({ open: true, member })}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Add Members Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Team Members</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Autocomplete
              multiple
              options={availableUsers}
              getOptionLabel={(option) =>
                `${option.firstName} ${option.lastName} (${option.email})`
              }
              value={selectedUsers}
              onChange={(event, newValue) => setSelectedUsers(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select users to add"
                  variant="outlined"
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <UserAvatar
                      user={option}
                      width={40}
                      height={40}
                      fontWeight={400}
                    />
                    <div className="flex justify-between items-center w-full">
                      <Box>
                        <Typography variant="body2">
                          {option.firstName} {option.lastName} ({option.role})
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {option.email}
                        </Typography>
                      </Box>
                    </div>
                  </Box>
                </li>
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddMembers}
            variant="contained"
            disabled={selectedUsers.length === 0 || loading}
          >
            Add {selectedUsers.length > 0 && `(${selectedUsers.length})`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, member: null })}
      >
        <DialogTitle>Remove Team Member</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove{' '}
            <strong>
              {deleteDialog.member?.firstName} {deleteDialog.member?.lastName}
            </strong>{' '}
            from this project?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, member: null })}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteMember}
            color="error"
            variant="contained"
            disabled={loading}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ProjectMembers;
