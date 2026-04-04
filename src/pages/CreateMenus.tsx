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
import { getNavigationSections } from '@/components/layout/admin-sidebar';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const CreateMenus = () => {
  const [roles, setRoles] = useState([]);
  const [menus, setMenus] = useState([]); // all menus in DB
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleMenus, setRoleMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');
  
  // Get full navigation structure (using Admin role to get all menus)
  const navigationSections = getNavigationSections('Admin');

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
    const init = async () => {
      try {
        await populateMenusFromNavigation(navigationSections);
      } catch (e) {
        // ignore populate errors
      }
      await fetchMenus();
      await fetchRoles();
    };
    init();
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

  // Filter sections and items by search term
  const filteredSections = menuSearch.trim()
    ? navigationSections
        .map((section) => ({
          ...section,
          items: section.items
            .map((item) => {
              const parentMatch = item.title.toLowerCase().includes(menuSearch.toLowerCase());
              const matchedChildren = item.children?.filter((c) =>
                c.title.toLowerCase().includes(menuSearch.toLowerCase())
              );
              if (parentMatch) return item;
              if (matchedChildren && matchedChildren.length > 0)
                return { ...item, children: matchedChildren };
              return null;
            })
            .filter(Boolean),
        }))
        .filter((section) => section.items.length > 0)
    : navigationSections;

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
        <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, minHeight: { xs: 'auto', md: 400 } }}>
          {selectedRole ? (
            <>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="h6">
                    Permissions for <strong>{selectedRole.name}</strong>
                  </Typography>
                  {loading && (
                    <Chip label="Loading..." size="small" color="primary" />
                  )}
                </Box>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search menus..."
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </Box>

              {filteredSections.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                  <Typography variant="body2">No menus match "{menuSearch}"</Typography>
                </Box>
              ) : (
                filteredSections.map((section) => (
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
              )))}
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
