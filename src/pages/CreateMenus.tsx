import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  Typography,
  Paper,
  Divider,
  Chip,
} from '@mui/material';
import { apiService, endpoints } from '@/lib/api';
import { navigationSections } from '@/components/layout/admin-sidebar';

const CreateMenus = () => {
  const [roles, setRoles] = useState([]);
  const [menus, setMenus] = useState([]); // all menus in DB
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleMenus, setRoleMenus] = useState([]);
  const [loading, setLoading] = useState(false);

  const populateMenusFromNavigation = async (navigationSections) => {
    const menuNames = new Set();

    const extractItems = (items = []) => {
      items.forEach((item) => {
        if (item.title) {
          menuNames.add(item.title);
        }

        if (Array.isArray(item.children)) {
          extractItems(item.children);
        }
      });
    };

    navigationSections.forEach((section) => {
      extractItems(section.items);
    });

    const payload = Array.from(menuNames).map((name) => ({ name }));

    return apiService.post(endpoints.populateMenus, payload);
  };
  useEffect(() => {
    populateMenusFromNavigation(navigationSections);
    fetchRoles();
    fetchMenus();
  }, []);

  const fetchRoles = async () => {
    const res = await apiService.get(endpoints.getAllRoles);
    setRoles(res.data.data || []);
  };

  const fetchMenus = async () => {
    const res = await apiService.get(endpoints.getAllMenus);
    setMenus(res.data || []);
  };

  const fetchRoleMenus = async (roleId) => {
    if (!roleId) return;
    setLoading(true);
    const res = await apiService.get(endpoints.getMenusByRole(roleId));
    setRoleMenus(res.data || []);
    setLoading(false);
  };

  const handleRoleClick = (role) => {
    setSelectedRole(role);
    fetchRoleMenus(role.id);
  };

  const toggleMenu = async (menuId) => {
    if (!selectedRole) return;
    await apiService.post(endpoints.toggleMenuRole(menuId, selectedRole.id));
    fetchRoleMenus(selectedRole.id);
  };

  const isAssigned = (menuName) => roleMenus.some((m) => m.name === menuName);

  const findMenuId = (name) => menus.find((m) => m.name === name)?.id;

  return (
    <Grid container spacing={3}>
      {/* Roles - Left Side */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Roles
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List disablePadding>
            {roles.map((role) => (
              <ListItemButton
                key={role.id}
                selected={selectedRole?.id === role.id}
                onClick={() => handleRoleClick(role)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&.Mui-selected': { bgcolor: 'primary.main', color: 'white' },
                }}
              >
                <ListItemText
                  primary={role.name}
                  secondary={role.description || null}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      </Grid>

      {/* Menus - Right Side */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3, borderRadius: 2, minHeight: 400 }}>
          {selectedRole ? (
            <>
              <Box
                sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}
              >
                <Typography variant="h6">
                  Permissions for <strong>{selectedRole.name}</strong>
                </Typography>
                {loading && (
                  <Chip label="Loading..." size="small" color="primary" />
                )}
              </Box>

              {navigationSections.map((section) => (
                <Box key={section.label} sx={{ mb: 4 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    color="primary"
                    gutterBottom
                  >
                    {section.label}
                  </Typography>

                  <List disablePadding>
                    {section.items.map((item) => (
                      <React.Fragment key={item.title}>
                        {/* Main item */}
                        <MenuRow
                          title={item.title}
                          checked={isAssigned(item.title)}
                          menuId={findMenuId(item.title)}
                          onToggle={toggleMenu}
                          level={0}
                        />

                        {/* Sub-items */}
                        {item.children?.map((child) => (
                          <MenuRow
                            key={child.title}
                            title={child.title}
                            checked={isAssigned(child.title)}
                            menuId={findMenuId(child.title)}
                            onToggle={toggleMenu}
                            level={1}
                          />
                        ))}
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              ))}
            </>
          ) : (
            <Box sx={{ py: 10, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body1">
                Select a role to manage its menu access
              </Typography>
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

// Reusable row component
function MenuRow({ title, checked, menuId, onToggle, level }) {
  if (!menuId) {
    return (
      <ListItem sx={{ pl: level * 4 + 2, py: 0.8, opacity: 0.5 }}>
        <ListItemText
          primary={title}
          primaryTypographyProps={{ fontSize: '0.95rem' }}
        />
        <Chip label="Not in DB" size="small" color="default" />
      </ListItem>
    );
  }

  return (
    <ListItem disablePadding sx={{ pl: level * 4 + 2 }}>
      <ListItemButton
        onClick={() => onToggle(menuId)}
        sx={{ borderRadius: 1, py: 0.9 }}
      >
        <Checkbox
          edge="start"
          checked={checked}
          tabIndex={-1}
          disableRipple
          size="small"
        />
        <ListItemText
          primary={title}
          primaryTypographyProps={{
            fontSize: level === 0 ? '0.98rem' : '0.92rem',
            fontWeight: level === 0 ? 500 : 400,
            color: level === 0 ? 'text.primary' : 'text.secondary',
          }}
        />
      </ListItemButton>
    </ListItem>
  );
}

export default CreateMenus;
