import React, { useEffect, useState } from 'react';
import {
 Grid,
 Card,
 CardContent,
 Typography,
 Box,
 Paper,
 List,
 ListItem,
 ListItemText,
 Divider,
 CircularProgress,
} from '@mui/material';
import {
 People as ClientsIcon,
 EventNote as BookingsIcon,
 Receipt as RevenueIcon,
 PendingActions as PendingIcon,
 TrendingUp,
} from '@mui/icons-material';
import {
 BarChart,
 Bar,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 Legend,
 ResponsiveContainer,
} from 'recharts';
import api from '../api';

function Dashboard() {
 const [summary, setSummary] = useState(null);
 const [monthlyRevenue, setMonthlyRevenue] = useState([]);
 const [topClients, setTopClients] = useState([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  const fetchAll = async () => {
   try {
    const [summaryRes, revenueRes, topClientsRes] = await Promise.all([
     api.get('/analytics/dashboard-summary'),
     api.get('/analytics/monthly-revenue'),
     api.get('/analytics/top-clients'),
    ]);
    setSummary(summaryRes.data);
    setMonthlyRevenue(revenueRes.data);
    setTopClients(topClientsRes.data);
   } catch (error) {
    console.error('Dashboard fetch error:', error);
   } finally {
    setLoading(false);
   }
  };
  fetchAll();
 }, []);

 if (loading) {
  return (
   <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
    <CircularProgress />
   </Box>
  );
 }

 const summaryCards = [
  { title: 'Total Clients', value: summary?.total_clients || 0, icon: ClientsIcon, color: '#3b82f6' },
  { title: 'Total Bookings', value: summary?.total_bookings || 0, icon: BookingsIcon, color: '#10b981' },
  { title: 'Total Revenue', value: `₹${(summary?.total_revenue || 0).toLocaleString()}`, icon: RevenueIcon, color: '#f59e0b' },
  { title: 'Pending Bookings', value: summary?.pending_bookings || 0, icon: PendingIcon, color: '#ef4444' },
  { title: 'This Month Revenue', value: `₹${(summary?.month_revenue || 0).toLocaleString()}`, icon: TrendingUp, color: '#8b5cf6' },
 ];

 return (
  <Box>
   <Typography variant="h4" gutterBottom>
    Dashboard Analytics
   </Typography>

   {/* Summary Cards */}
   <Grid container spacing={3} sx={{ mb: 4 }}>
    {summaryCards.map((card, idx) => (
     <Grid item xs={12} sm={6} md={2.4} key={idx}>
      <Card elevation={3} sx={{ height: '100%' }}>
       <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
         <Box>
          <Typography color="textSecondary" variant="body2">
           {card.title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
           {card.value}
          </Typography>
         </Box>
         <Box sx={{ backgroundColor: `${card.color}20`, borderRadius: '50%', p: 1 }}>
          <card.icon sx={{ color: card.color, fontSize: 32 }} />
         </Box>
        </Box>
       </CardContent>
      </Card>
     </Grid>
    ))}
   </Grid>

   {/* Monthly Revenue Chart */}
   <Grid container spacing={3}>
    <Grid item xs={12} md={8}>
     <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
       Monthly Revenue ({new Date().getFullYear()})
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
       <BarChart data={monthlyRevenue}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value) => `₹${value}`} />
        <Legend />
        <Bar dataKey="revenue" fill="#f59e0b" name="Revenue (₹)" />
       </BarChart>
      </ResponsiveContainer>
     </Paper>
    </Grid>

    {/* Top Clients */}
    <Grid item xs={12} md={4}>
     <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
       Top 5 Clients by Spending
      </Typography>
      <List>
       {topClients.length === 0 ? (
        <Typography color="textSecondary" align="center">
         No data yet
        </Typography>
       ) : (
        topClients.map((client, idx) => (
         <React.Fragment key={idx}>
          <ListItem>
           <ListItemText
            primary={client.name}
            secondary={`${client.bookings_count} bookings`}
           />
           <Typography variant="body2" fontWeight="bold">
            ₹{client.total_spent?.toLocaleString()}
           </Typography>
          </ListItem>
          {idx < topClients.length - 1 && <Divider />}
         </React.Fragment>
        ))
       )}
      </List>
     </Paper>
    </Grid>
   </Grid>
  </Box>
 );
}

export default Dashboard;