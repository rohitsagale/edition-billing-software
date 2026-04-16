import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api';

function Dashboard() {
 const [summary, setSummary] = useState({});
 const [monthlyRevenue, setMonthlyRevenue] = useState([]);

 useEffect(() => {
  const fetchData = async () => {
   const summaryRes = await api.get('/analytics/dashboard-summary');
   setSummary(summaryRes.data);
   const revenueRes = await api.get('/analytics/monthly-revenue');
   setMonthlyRevenue(revenueRes.data);
  };
  fetchData();
 }, []);

 const summaryCards = [
  { title: 'Total Clients', value: summary.total_clients || 0 },
  { title: 'Total Bookings', value: summary.total_bookings || 0 },
  { title: 'Pending Bookings', value: summary.pending_bookings || 0 },
  { title: 'Total Revenue', value: `₹${(summary.total_revenue || 0).toLocaleString()}` },
  { title: 'This Month', value: `₹${(summary.month_revenue || 0).toLocaleString()}` },
 ];

 return (
  <Box>
   <Typography variant="h4" gutterBottom>Dashboard Analytics</Typography>
   <Grid container spacing={3}>
    {summaryCards.map((card, idx) => (
     <Grid item xs={12} sm={6} md={2.4} key={idx}>
      <Card elevation={3}>
       <CardContent>
        <Typography color="textSecondary">{card.title}</Typography>
        <Typography variant="h5">{card.value}</Typography>
       </CardContent>
      </Card>
     </Grid>
    ))}
   </Grid>
   <Card sx={{ mt: 4, p: 2 }}>
    <Typography variant="h6" gutterBottom>Monthly Revenue ({new Date().getFullYear()})</Typography>
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
   </Card>
  </Box>
 );
}

export default Dashboard;