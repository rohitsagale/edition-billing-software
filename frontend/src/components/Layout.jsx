import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
 Drawer,
 AppBar,
 Toolbar,
 List,
 ListItem,
 ListItemButton,
 ListItemIcon,
 ListItemText,
 IconButton,
 Typography,
 Box,
 Divider,
 Avatar,
 Badge,
 Tooltip,
} from '@mui/material';
import {
 Dashboard as DashboardIcon,
 ProductionQuantityLimits as ProductsIcon,
 ShoppingCart as BillingIcon,
 Receipt as BillsIcon,
 People as ClientsIcon,
 EventNote as BookingsIcon,
 Category as EventTypesIcon,
 Logout as LogoutIcon,
 Menu as MenuIcon,
 AdminPanelSettings as AdminIcon,
 AccessTime as TimeIcon,
 CalendarToday as DateIcon,
} from '@mui/icons-material';

const drawerWidth = 260;

const menuItems = [
 { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
 { path: '/clients', label: 'Clients', icon: ClientsIcon },
 { path: '/bookings', label: 'Bookings', icon: BookingsIcon },
 { path: '/billing', label: 'Billing', icon: BillingIcon },
 { path: '/bills', label: 'Bill List', icon: BillsIcon },
 { path: '/products', label: 'Products', icon: ProductsIcon },
 { path: '/event-types', label: 'Event Types', icon: EventTypesIcon },
];

function Layout({ children, setToken }) {
 const [mobileOpen, setMobileOpen] = useState(false);
 const [currentDateTime, setCurrentDateTime] = useState(new Date());
 const navigate = useNavigate();
 const location = useLocation();

 useEffect(() => {
  const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
  return () => clearInterval(timer);
 }, []);

 const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
 const handleLogout = () => {
  localStorage.removeItem('token');
  setToken(null);
  navigate('/login');
 };

 const username = localStorage.getItem('username') || 'Admin';

 const formattedDate = currentDateTime.toLocaleDateString('en-IN', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
 });
 const formattedTime = currentDateTime.toLocaleTimeString('en-IN', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
 });

 const drawer = (
  <div>
   <Toolbar sx={{ justifyContent: 'center', backgroundColor: '#1e3a8a', color: 'white', flexDirection: 'column', py: 2 }}>
    <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
     🎬 Edition Films
    </Typography>
    <Typography variant="caption" sx={{ opacity: 0.8 }}>& Photography</Typography>
   </Toolbar>
   <Divider />
   <List>
    {menuItems.map((item) => (
     <ListItem key={item.path} disablePadding>
      <ListItemButton
       onClick={() => {
        navigate(item.path);
        setMobileOpen(false);
       }}
       selected={location.pathname === item.path}
       sx={{
        '&.Mui-selected': { backgroundColor: '#f59e0b20', borderRight: '3px solid #f59e0b' },
        '&:hover': { backgroundColor: '#f59e0b10' },
       }}
      >
       <ListItemIcon>
        <item.icon sx={{ color: location.pathname === item.path ? '#f59e0b' : '#1e3a8a' }} />
       </ListItemIcon>
       <ListItemText primary={item.label} />
      </ListItemButton>
     </ListItem>
    ))}
   </List>
   <Divider />
   <List>
    <ListItem disablePadding>
     <ListItemButton onClick={handleLogout}>
      <ListItemIcon><LogoutIcon sx={{ color: '#d32f2f' }} /></ListItemIcon>
      <ListItemText primary="Logout" />
     </ListItemButton>
    </ListItem>
   </List>
  </div>
 );

 return (
  <Box sx={{ display: 'flex' }}>
   <AppBar
    position="fixed"
    sx={{
     width: { sm: `calc(100% - ${drawerWidth}px)` },
     ml: { sm: `${drawerWidth}px` },
     backgroundColor: 'white',
     color: '#1e3a8a',
     boxShadow: 1,
    }}
   >
    <Toolbar sx={{ minHeight: '48px !important', py: 0, px: 2 }}>
     {/* Single line flex container */}
     <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      {/* Left side: Welcome message */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
       <IconButton
        color="inherit"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{ mr: 1, display: { sm: 'none' } }}
       >
        <MenuIcon fontSize="small" />
       </IconButton>
       <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
        Welcome back, {username}
       </Typography>
      </Box>

      {/* Right side: Date, Time, Avatar in one row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
       <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <DateIcon fontSize="small" sx={{ color: '#f59e0b' }} />
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
         {formattedDate}
        </Typography>
       </Box>
       <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <TimeIcon fontSize="small" sx={{ color: '#f59e0b' }} />
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
         {formattedTime}
        </Typography>
       </Box>
       <Tooltip title="Admin Profile">
        <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot" color="success">
         <Avatar sx={{ bgcolor: '#f59e0b', width: 28, height: 28 }}>
          <AdminIcon fontSize="small" />
         </Avatar>
        </Badge>
       </Tooltip>
      </Box>
     </Box>
    </Toolbar>
   </AppBar>

   <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
    <Drawer
     variant="temporary"
     open={mobileOpen}
     onClose={handleDrawerToggle}
     ModalProps={{ keepMounted: true }}
     sx={{
      display: { xs: 'block', sm: 'none' },
      '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
     }}
    >
     {drawer}
    </Drawer>
    <Drawer
     variant="permanent"
     sx={{
      display: { xs: 'none', sm: 'block' },
      '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
     }}
     open
    >
     {drawer}
    </Drawer>
   </Box>

   <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: 6 }}>
    {children}
   </Box>
  </Box>
 );
}

export default Layout;