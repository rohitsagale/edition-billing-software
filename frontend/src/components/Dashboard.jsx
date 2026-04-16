import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { Camera, Inventory2, Receipt, TrendingUp } from '@mui/icons-material';
import api from '../api';

function Dashboard() {
 const [stats, setStats] = useState({ products: 0, bills: 0, revenue: 0, todayBills: 0 });

 useEffect(() => {
  const fetchStats = async () => {
   const products = await api.get('/products');
   const bills = await api.get('/bills');
   const totalRevenue = bills.data.reduce((sum, b) => sum + b.grand_total, 0);
   const today = new Date().toISOString().slice(0, 10);
   const todayBills = bills.data.filter(b => b.date.startsWith(today)).length;
   setStats({
    products: products.data.length,
    bills: bills.data.length,
    revenue: totalRevenue,
    todayBills,
   });
  };
  fetchStats();
 }, []);

 const cards = [
  { title: 'Total Products', value: stats.products, icon: Inventory2, color: '#3b82f6' },
  { title: 'Total Bills', value: stats.bills, icon: Receipt, color: '#10b981' },
  { title: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: '#f59e0b' },
  { title: "Today's Bills", value: stats.todayBills, icon: Camera, color: '#8b5cf6' },
 ];

 return (
  <Box>
   <Typography variant="h4" gutterBottom sx={{ fontWeight: 500, mb: 3 }}>
    Dashboard
   </Typography>
   <Grid container spacing={3}>
    {cards.map((card, idx) => (
     <Grid item xs={12} sm={6} md={3} key={idx}>
      <Card elevation={3} sx={{ height: '100%' }}>
       <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
         <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
           {card.title}
          </Typography>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
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
   <Card sx={{ mt: 4, p: 3 }}>
    <Typography variant="h6" gutterBottom>Recent Activity</Typography>
    <Typography color="textSecondary">Welcome back, Admin. Manage your billing efficiently.</Typography>
   </Card>
  </Box>
 );
}

export default Dashboard;