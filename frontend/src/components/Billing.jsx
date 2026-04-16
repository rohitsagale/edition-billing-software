import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
 Box, Grid, Paper, TextField, Button, Typography, List, ListItem, ListItemText,
 IconButton, Divider, InputAdornment, Alert, Autocomplete,
} from '@mui/material';
import { Add, Remove, Delete, ShoppingCart } from '@mui/icons-material';
import api from '../api';

function Billing() {
 const [searchParams] = useSearchParams();
 const bookingIdParam = searchParams.get('booking_id');

 const [products, setProducts] = useState([]);
 const [bookings, setBookings] = useState([]);
 const [selectedBooking, setSelectedBooking] = useState(null);
 const [cart, setCart] = useState([]);
 const [customerName, setCustomerName] = useState('');
 const [customerPhone, setCustomerPhone] = useState('');
 const [eventCategory, setEventCategory] = useState('');
 const [discount, setDiscount] = useState(0);
 const [tax, setTax] = useState(0);
 const [searchTerm, setSearchTerm] = useState('');

 useEffect(() => {
  fetchProducts();
  fetchBookings();
 }, []);

 useEffect(() => {
  if (bookingIdParam && bookings.length > 0) {
   const booking = bookings.find(b => b.id === parseInt(bookingIdParam));
   if (booking) {
    setSelectedBooking(booking);
    setCustomerName(booking.client_name);
    setCustomerPhone(booking.client_phone || '');
    setEventCategory(booking.event_type_name || '');
   }
  }
 }, [bookingIdParam, bookings]);

 const fetchProducts = async () => {
  const res = await api.get('/products');
  setProducts(res.data);
 };

 const fetchBookings = async () => {
  const res = await api.get('/bookings');
  setBookings(res.data);
 };

 const filteredProducts = products.filter(p =>
  p.name.toLowerCase().includes(searchTerm.toLowerCase())
 );

 const addToCart = (product) => {
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
   setCart(cart.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
  } else {
   setCart([...cart, { ...product, qty: 1 }]);
  }
 };

 const updateQty = (id, delta) => {
  const item = cart.find(i => i.id === id);
  const newQty = item.qty + delta;
  if (newQty <= 0) {
   setCart(cart.filter(i => i.id !== id));
  } else {
   setCart(cart.map(i => i.id === id ? { ...i, qty: newQty } : i));
  }
 };

 const removeItem = (id) => {
  setCart(cart.filter(i => i.id !== id));
 };

 const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
 const grandTotal = subtotal + tax - discount;

 const createBill = async () => {
  if (!customerName) return alert('Customer name required');
  if (cart.length === 0) return alert('Cart is empty');
  const items = cart.map(i => ({ product_id: i.id, quantity: i.qty }));
  const payload = {
   customer_name: customerName,
   customer_phone: customerPhone,
   items,
   discount,
   tax,
   booking_id: selectedBooking ? selectedBooking.id : null,
  };
  try {
   await api.post('/bills', payload);
   alert('Bill generated successfully!');
   setCart([]);
   setSelectedBooking(null);
   setCustomerName('');
   setCustomerPhone('');
   setEventCategory('');
   setDiscount(0);
   setTax(0);
   fetchBookings(); // refresh balances
  } catch (err) {
   alert('Error: ' + (err.response?.data?.msg || err.message));
  }
 };

 const handleBookingChange = (event, newValue) => {
  setSelectedBooking(newValue);
  if (newValue) {
   setCustomerName(newValue.client_name);
   setCustomerPhone(newValue.client_phone || '');
   setEventCategory(newValue.event_type_name || '');
  } else {
   setCustomerName('');
   setCustomerPhone('');
   setEventCategory('');
  }
 };

 return (
  <Box>
   <Typography variant="h4" gutterBottom>New Bill</Typography>
   <Grid container spacing={3}>
    <Grid item xs={12} md={7}>
     <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>Select Booking (Optional)</Typography>
      <Autocomplete
       options={bookings}
       getOptionLabel={(opt) => `${opt.client_name} - ${opt.event_type_name || 'No event'} (${new Date(opt.event_date).toLocaleDateString()})`}
       value={selectedBooking}
       onChange={handleBookingChange}
       renderInput={(params) => <TextField {...params} label="Select Booking" variant="outlined" size="small" fullWidth />}
      />
      {selectedBooking && (
       <Alert severity="info" sx={{ mt: 1 }}>
        <strong>Event:</strong> {eventCategory || '—'} &nbsp;|&nbsp;
        <strong>Client:</strong> {customerName} &nbsp;|&nbsp;
        <strong>Balance Due:</strong> ₹{selectedBooking.balance_due?.toLocaleString() || 0}
       </Alert>
      )}
     </Paper>
     <Paper elevation={3} sx={{ p: 2 }}>
      <TextField
       fullWidth label="Search products" size="small" value={searchTerm}
       onChange={e => setSearchTerm(e.target.value)} sx={{ mb: 2 }}
      />
      <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
       <List>
        {filteredProducts.map(p => (
         <ListItem key={p.id} secondaryAction={
          <Button variant="outlined" size="small" onClick={() => addToCart(p)}>Add</Button>
         }>
          <ListItemText primary={p.name} secondary={`₹${p.price}`} />
         </ListItem>
        ))}
       </List>
      </Box>
     </Paper>
    </Grid>
    <Grid item xs={12} md={5}>
     <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom><ShoppingCart sx={{ mr: 1 }} /> Cart</Typography>
      <TextField label="Customer Name" fullWidth size="small" value={customerName}
       onChange={e => setCustomerName(e.target.value)} sx={{ mb: 1 }} disabled={!!selectedBooking} />
      <TextField label="Phone" fullWidth size="small" value={customerPhone}
       onChange={e => setCustomerPhone(e.target.value)} sx={{ mb: 2 }} disabled={!!selectedBooking} />
      {eventCategory && (
       <TextField label="Event Category" fullWidth size="small" value={eventCategory} disabled sx={{ mb: 2 }} />
      )}
      <Divider />
      <Box sx={{ maxHeight: 300, overflow: 'auto', mt: 2 }}>
       {cart.map(item => (
        <Box key={item.id} display="flex" alignItems="center" justifyContent="space-between" mb={1}>
         <Box flex={1}><Typography variant="body2">{item.name}</Typography><Typography variant="caption">₹{item.price} x {item.qty}</Typography></Box>
         <Box>
          <IconButton size="small" onClick={() => updateQty(item.id, -1)}><Remove /></IconButton>
          <span>{item.qty}</span>
          <IconButton size="small" onClick={() => updateQty(item.id, 1)}><Add /></IconButton>
          <IconButton size="small" color="error" onClick={() => removeItem(item.id)}><Delete /></IconButton>
         </Box>
        </Box>
       ))}
       {cart.length === 0 && <Typography color="textSecondary" align="center">Cart empty</Typography>}
      </Box>
      <Divider sx={{ my: 2 }} />
      <Box display="flex" justifyContent="space-between" mb={1}><Typography>Subtotal:</Typography><Typography>₹{subtotal}</Typography></Box>
      <Box display="flex" justifyContent="space-between" mb={1}><Typography>Discount (₹):</Typography><TextField type="number" size="small" value={discount} onChange={e => setDiscount(Number(e.target.value))} sx={{ width: 100 }} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} /></Box>
      <Box display="flex" justifyContent="space-between" mb={1}><Typography>Tax (₹):</Typography><TextField type="number" size="small" value={tax} onChange={e => setTax(Number(e.target.value))} sx={{ width: 100 }} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} /></Box>
      <Divider />
      <Box display="flex" justifyContent="space-between" mt={2}><Typography variant="h6">Grand Total:</Typography><Typography variant="h6">₹{grandTotal}</Typography></Box>
      <Button fullWidth variant="contained" color="primary" onClick={createBill} sx={{ mt: 2 }}>Generate Bill</Button>
     </Paper>
    </Grid>
   </Grid>
  </Box>
 );
}

export default Billing;