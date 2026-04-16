import React, { useState, useEffect } from 'react';
import {
 Box,
 Grid,
 Card,
 CardContent,
 Typography,
 Button,
 Dialog,
 DialogTitle,
 DialogContent,
 Table,
 TableBody,
 TableCell,
 TableContainer,
 TableHead,
 TableRow,
 Paper,
 IconButton,
 CircularProgress,
 Alert,
 Chip,
} from '@mui/material';
import { Receipt, Print, Refresh, EventNote } from '@mui/icons-material';
import api from '../api';

function BillList() {
 const [bills, setBills] = useState([]);
 const [selectedBill, setSelectedBill] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');

 const fetchBills = async () => {
  setLoading(true);
  setError('');
  try {
   const res = await api.get('/bills');
   console.log('Bills fetched:', res.data);
   if (Array.isArray(res.data)) {
    setBills(res.data);
   } else {
    setBills([]);
    setError('Invalid data format from server');
   }
  } catch (err) {
   console.error('Fetch error:', err);
   setError(err.response?.data?.msg || 'Failed to load bills');
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => {
  fetchBills();
 }, []);

 const viewBillDetails = async (id) => {
  try {
   const res = await api.get(`/bills/${id}`);
   setSelectedBill(res.data);
  } catch (err) {
   alert('Could not load bill details');
  }
 };

 if (loading) {
  return (
   <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
    <CircularProgress />
   </Box>
  );
 }

 if (error) {
  return (
   <Box>
    <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
    <Button variant="contained" startIcon={<Refresh />} onClick={fetchBills}>
     Retry
    </Button>
   </Box>
  );
 }

 return (
  <Box>
   <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
    <Typography variant="h4">All Bills</Typography>
    <Button variant="outlined" startIcon={<Refresh />} onClick={fetchBills}>
     Refresh
    </Button>
   </Box>

   {bills.length === 0 ? (
    <Paper sx={{ p: 4, textAlign: 'center' }}>
     <Typography color="textSecondary">No bills found. Create a bill from the Billing page.</Typography>
    </Paper>
   ) : (
    <Grid container spacing={3}>
     {bills.map((bill) => (
      <Grid item xs={12} sm={6} md={4} key={bill.id}>
       <Card
        elevation={3}
        sx={{
         cursor: 'pointer',
         transition: '0.2s',
         '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
        }}
        onClick={() => viewBillDetails(bill.id)}
       >
        <CardContent>
         <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
           <Typography variant="body2" color="textSecondary">
            Bill #{bill.id}
           </Typography>
           <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>
            ₹{bill.grand_total?.toLocaleString()}
           </Typography>
           <Typography variant="body1" sx={{ mt: 1 }}>
            {bill.customer_name}
           </Typography>
           <Typography variant="caption" color="textSecondary">
            {bill.date ? new Date(bill.date).toLocaleString() : 'No date'}
           </Typography>
           {bill.booking_id && (
            <Chip
             label={`Booking #${bill.booking_id}`}
             size="small"
             icon={<EventNote fontSize="small" />}
             sx={{ mt: 1, fontSize: '0.7rem' }}
            />
           )}
          </Box>
          <Receipt color="primary" sx={{ fontSize: 40, opacity: 0.7 }} />
         </Box>
        </CardContent>
       </Card>
      </Grid>
     ))}
    </Grid>
   )}

   {/* Invoice Modal */}
   <Dialog open={!!selectedBill} onClose={() => setSelectedBill(null)} maxWidth="md" fullWidth>
    {selectedBill && (
     <>
      <DialogTitle>
       Invoice #{selectedBill.id}
       <IconButton onClick={() => window.print()} sx={{ float: 'right' }}>
        <Print />
       </IconButton>
      </DialogTitle>
      <DialogContent dividers>
       <Typography variant="body1">
        <strong>Customer:</strong> {selectedBill.customer_name} ({selectedBill.customer_phone || 'N/A'})
       </Typography>
       <Typography variant="body1" gutterBottom>
        <strong>Date:</strong> {new Date(selectedBill.date).toLocaleString()}
       </Typography>
       {selectedBill.booking_id && (
        <Typography variant="body1" gutterBottom>
         <strong>Booking ID:</strong> #{selectedBill.booking_id}
        </Typography>
       )}
       <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
        <Table size="small">
         <TableHead sx={{ bgcolor: '#f5f5f5' }}>
          <TableRow>
           <TableCell><strong>Item</strong></TableCell>
           <TableCell align="right"><strong>Qty</strong></TableCell>
           <TableCell align="right"><strong>Unit Price (₹)</strong></TableCell>
           <TableCell align="right"><strong>Total (₹)</strong></TableCell>
          </TableRow>
         </TableHead>
         <TableBody>
          {selectedBill.items?.map((item, idx) => (
           <TableRow key={idx}>
            <TableCell>{item.product_name}</TableCell>
            <TableCell align="right">{item.quantity}</TableCell>
            <TableCell align="right">{item.unit_price}</TableCell>
            <TableCell align="right">{item.total}</TableCell>
           </TableRow>
          ))}
         </TableBody>
        </Table>
       </TableContainer>
       <Box sx={{ mt: 2, textAlign: 'right' }}>
        <Typography variant="body2">Subtotal: ₹{selectedBill.total_amount}</Typography>
        <Typography variant="body2">Discount: ₹{selectedBill.discount}</Typography>
        <Typography variant="body2">Tax: ₹{selectedBill.tax}</Typography>
        <Typography variant="h6" sx={{ mt: 1 }}>
         Grand Total: ₹{selectedBill.grand_total}
        </Typography>
       </Box>
      </DialogContent>
     </>
    )}
   </Dialog>
  </Box>
 );
}

export default BillList;