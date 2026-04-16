import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
 Drawer,
 AppBar,
 Toolbar,
 List,
 ListItem,
 ListItemIcon,
 ListItemText,
 IconButton,
 Typography,
 Box,
 Divider,
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
} from '@mui/icons-material';

const drawerWidth = 260;

// ✅ योग्य क्रमानुसार मेनू आयटम
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
 const [mobileOpen, setMobileOpen] = React.useState(false);
 const navigate = useNavigate();
 const location = useLocation();

 const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

 const handleLogout = () => {
  localStorage.removeItem('token');
  setToken(null);
  navigate('/login');
 };

 const drawer = (
  <div>
   <Toolbar sx={{ justifyContent: 'center', backgroundColor: '#1e3a8a', color: 'white' }}>
    <Typography variant="h6" noWrap component="div">
     🎬 Edition Films
    </Typography>
   </Toolbar>
   <Divider />
   <List>
    {menuItems.map((item) => (
     <ListItem
      button
      key={item.path}
      onClick={() => {
       navigate(item.path);
       setMobileOpen(false);
      }}
      selected={location.pathname === item.path}
      sx={{
       '&.Mui-selected': {
        backgroundColor: '#f59e0b20',
        borderRight: '3px solid #f59e0b',
       },
       '&:hover': { backgroundColor: '#f59e0b10' },
      }}
     >
      <ListItemIcon>
       <item.icon sx={{ color: location.pathname === item.path ? '#f59e0b' : '#1e3a8a' }} />
      </ListItemIcon>
      <ListItemText primary={item.label} />
     </ListItem>
    ))}
   </List>
   <Divider />
   <List>
    <ListItem button onClick={handleLogout}>
     <ListItemIcon>
      <LogoutIcon sx={{ color: '#d32f2f' }} />
     </ListItemIcon>
     <ListItemText primary="Logout" />
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
    <Toolbar>
     <IconButton
      color="inherit"
      edge="start"
      onClick={handleDrawerToggle}
      sx={{ mr: 2, display: { sm: 'none' } }}
     >
      <MenuIcon />
     </IconButton>
     <Typography variant="h6" noWrap component="div">
      Billing Dashboard
     </Typography>
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
   <Box
    component="main"
    sx={{
     flexGrow: 1,
     p: 3,
     width: { sm: `calc(100% - ${drawerWidth}px)` },
     mt: 8,
    }}
   >
    {children}
   </Box>
  </Box>
 );
}

export default Layout;