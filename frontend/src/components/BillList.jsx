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
} from '@mui/material';
import { Receipt, Print } from '@mui/icons-material';
import api from '../api';

function BillList() {
 const [bills, setBills] = useState([]);
 const [selectedBill, setSelectedBill] = useState(null);

 useEffect(() => {
  api.get('/bills').then(res => setBills(res.data));
 }, []);

 const viewBillDetails = async (id) => {
  const res = await api.get(`/bills/${id}`);
  setSelectedBill(res.data);
 };

 return (
  <Box>
   <Typography variant="h4" gutterBottom>All Bills</Typography>
   <Grid container spacing={3}>
    {bills.map(bill => (
     <Grid item xs={12} sm={6} md={4} key={bill.id}>
      <Card elevation={3} sx={{ cursor: 'pointer' }} onClick={() => viewBillDetails(bill.id)}>
       <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
         <Box>
          <Typography variant="body2" color="textSecondary">Bill #{bill.id}</Typography>
          <Typography variant="h6">₹{bill.grand_total}</Typography>
          <Typography variant="body2">{bill.customer_name}</Typography>
          <Typography variant="caption" color="textSecondary">
           {new Date(bill.date).toLocaleString()}
          </Typography>
         </Box>
         <Receipt color="primary" />
        </Box>
       </CardContent>
      </Card>
     </Grid>
    ))}
   </Grid>

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
       <Typography variant="body2">Customer: {selectedBill.customer_name} ({selectedBill.customer_phone || 'N/A'})</Typography>
       <Typography variant="body2" gutterBottom>Date: {new Date(selectedBill.date).toLocaleString()}</Typography>
       <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
        <Table size="small">
         <TableHead>
          <TableRow>
           <TableCell>Item</TableCell>
           <TableCell align="right">Qty</TableCell>
           <TableCell align="right">Unit Price</TableCell>
           <TableCell align="right">Total</TableCell>
          </TableRow>
         </TableHead>
         <TableBody>
          {selectedBill.items.map((item, idx) => (
           <TableRow key={idx}>
            <TableCell>{item.product_name}</TableCell>
            <TableCell align="right">{item.quantity}</TableCell>
            <TableCell align="right">₹{item.unit_price}</TableCell>
            <TableCell align="right">₹{item.total}</TableCell>
           </TableRow>
          ))}
         </TableBody>
        </Table>
       </TableContainer>
       <Box sx={{ mt: 2, textAlign: 'right' }}>
        <Typography variant="body2">Subtotal: ₹{selectedBill.total_amount}</Typography>
        <Typography variant="body2">Discount: ₹{selectedBill.discount}</Typography>
        <Typography variant="body2">Tax: ₹{selectedBill.tax}</Typography>
        <Typography variant="h6">Grand Total: ₹{selectedBill.grand_total}</Typography>
       </Box>
      </DialogContent>
     </>
    )}
   </Dialog>
  </Box>
 );
}

export default BillList;