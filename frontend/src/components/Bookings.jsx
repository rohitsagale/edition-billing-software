import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
 Box,
 Typography,
 Paper,
 Table,
 TableBody,
 TableCell,
 TableContainer,
 TableHead,
 TableRow,
 Button,
 Dialog,
 DialogTitle,
 DialogContent,
 DialogActions,
 TextField,
 IconButton,
 Chip,
 MenuItem,
 Autocomplete,
 Alert,
} from '@mui/material';
import { Add, Edit, Delete, Receipt } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import api from '../api';

function Bookings() {
 const navigate = useNavigate();
 const [bookings, setBookings] = useState([]);
 const [clients, setClients] = useState([]);
 const [eventTypes, setEventTypes] = useState([]);
 const [open, setOpen] = useState(false);
 const [editing, setEditing] = useState(null);
 const [form, setForm] = useState({
  client_id: '',
  event_type_id: '',
  event_date: dayjs(),
  status: 'confirmed',
  total_amount: 0,
  advance_paid: 0,
  notes: '',
 });
 const [error, setError] = useState('');

 const fetchBookings = async () => {
  const res = await api.get('/bookings');
  setBookings(res.data);
 };

 const fetchClients = async () => {
  const res = await api.get('/clients');
  setClients(res.data);
 };

 const fetchEventTypes = async () => {
  const res = await api.get('/event-types');
  setEventTypes(res.data);
 };

 useEffect(() => {
  fetchBookings();
  fetchClients();
  fetchEventTypes();
 }, []);

 const handleOpen = (booking = null) => {
  if (booking) {
   setEditing(booking.id);
   setForm({
    client_id: booking.client_id,
    event_type_id: booking.event_type_id || '',
    event_date: dayjs(booking.event_date),
    status: booking.status,
    total_amount: booking.total_amount,
    advance_paid: booking.advance_paid,
    notes: booking.notes || '',
   });
  } else {
   setEditing(null);
   setForm({
    client_id: '',
    event_type_id: '',
    event_date: dayjs(),
    status: 'confirmed',
    total_amount: 0,
    advance_paid: 0,
    notes: '',
   });
  }
  setError('');
  setOpen(true);
 };

 const handleSave = async () => {
  if (!form.client_id) {
   setError('Please select a client');
   return;
  }
  if (!form.event_date) {
   setError('Please select an event date');
   return;
  }

  const payload = {
   client_id: form.client_id,
   event_type_id: form.event_type_id || null,
   event_date: form.event_date.toISOString(),
   status: form.status,
   total_amount: parseFloat(form.total_amount) || 0,
   advance_paid: parseFloat(form.advance_paid) || 0,
   notes: form.notes,
  };

  try {
   if (editing) {
    await api.put(`/bookings/${editing}`, payload);
   } else {
    await api.post('/bookings', payload);
   }
   fetchBookings();
   setOpen(false);
  } catch (err) {
   setError(err.response?.data?.msg || 'Failed to save booking');
  }
 };

 const handleDelete = async (id) => {
  if (window.confirm('Delete this booking? This action cannot be undone.')) {
   try {
    await api.delete(`/bookings/${id}`);
    fetchBookings();
   } catch (err) {
    alert(err.response?.data?.msg || 'Cannot delete booking');
   }
  }
 };

 const getStatusColor = (status) => {
  switch (status) {
   case 'confirmed': return 'success';
   case 'pending': return 'warning';
   case 'cancelled': return 'error';
   case 'completed': return 'info';
   default: return 'default';
  }
 };

 return (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
   <Box>
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
     <Typography variant="h4">Bookings</Typography>
     <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
      New Booking
     </Button>
    </Box>

    <TableContainer component={Paper} elevation={3}>
     <Table>
      <TableHead sx={{ bgcolor: '#f5f5f5' }}>
       <TableRow>
        <TableCell><strong>ID</strong></TableCell>
        <TableCell><strong>Client</strong></TableCell>
        <TableCell><strong>Event Type</strong></TableCell>
        <TableCell><strong>Event Date</strong></TableCell>
        <TableCell><strong>Status</strong></TableCell>
        <TableCell align="right"><strong>Total (₹)</strong></TableCell>
        <TableCell align="right"><strong>Advance</strong></TableCell>
        <TableCell align="right"><strong>Balance</strong></TableCell>
        <TableCell align="center"><strong>Actions</strong></TableCell>
       </TableRow>
      </TableHead>
      <TableBody>
       {bookings.map((b) => (
        <TableRow key={b.id} hover>
         <TableCell>#{b.id}</TableCell>
         <TableCell>{b.client_name}</TableCell>
         <TableCell>{b.event_type_name || '—'}</TableCell>
         <TableCell>{dayjs(b.event_date).format('DD MMM YYYY')}</TableCell>
         <TableCell>
          <Chip label={b.status} color={getStatusColor(b.status)} size="small" />
         </TableCell>
         <TableCell align="right">₹{b.total_amount.toLocaleString()}</TableCell>
         <TableCell align="right">₹{b.advance_paid.toLocaleString()}</TableCell>
         <TableCell align="right">₹{b.balance_due.toLocaleString()}</TableCell>
         <TableCell align="center">
          <IconButton size="small" onClick={() => handleOpen(b)}>
           <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDelete(b.id)}>
           <Delete fontSize="small" />
          </IconButton>
          {/* ✅ Generate Bill Button */}
          <IconButton
           size="small"
           color="primary"
           onClick={() => navigate(`/billing?booking_id=${b.id}`)}
           title="Generate Bill from this booking"
          >
           <Receipt fontSize="small" />
          </IconButton>
         </TableCell>
        </TableRow>
       ))}
       {bookings.length === 0 && (
        <TableRow>
         <TableCell colSpan={9} align="center">No bookings found. Create one!</TableCell>
        </TableRow>
       )}
      </TableBody>
     </Table>
    </TableContainer>

    {/* Booking Form Dialog */}
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
     <DialogTitle>{editing ? 'Edit Booking' : 'New Booking'}</DialogTitle>
     <DialogContent>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Autocomplete
       options={clients}
       getOptionLabel={(option) => typeof option === 'object' ? option.name : option}
       value={clients.find(c => c.id === form.client_id) || null}
       onChange={(_, newValue) => setForm({ ...form, client_id: newValue ? newValue.id : '' })}
       renderInput={(params) => <TextField {...params} label="Client *" margin="dense" fullWidth required />}
       fullWidth
       sx={{ mt: 1 }}
      />
      <TextField
       select
       fullWidth
       margin="dense"
       label="Event Type"
       value={form.event_type_id}
       onChange={(e) => setForm({ ...form, event_type_id: e.target.value })}
      >
       <MenuItem value="">None</MenuItem>
       {eventTypes.map((type) => (
        <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
       ))}
      </TextField>
      <DatePicker
       label="Event Date *"
       value={form.event_date}
       onChange={(newDate) => setForm({ ...form, event_date: newDate })}
       slotProps={{ textField: { fullWidth: true, margin: 'dense', required: true } }}
      />
      <TextField
       select
       fullWidth
       margin="dense"
       label="Status"
       value={form.status}
       onChange={(e) => setForm({ ...form, status: e.target.value })}
      >
       <MenuItem value="confirmed">Confirmed</MenuItem>
       <MenuItem value="pending">Pending</MenuItem>
       <MenuItem value="completed">Completed</MenuItem>
       <MenuItem value="cancelled">Cancelled</MenuItem>
      </TextField>
      <TextField
       fullWidth
       margin="dense"
       label="Total Amount (₹)"
       type="number"
       value={form.total_amount}
       onChange={(e) => setForm({ ...form, total_amount: parseFloat(e.target.value) || 0 })}
      />
      <TextField
       fullWidth
       margin="dense"
       label="Advance Paid (₹)"
       type="number"
       value={form.advance_paid}
       onChange={(e) => setForm({ ...form, advance_paid: parseFloat(e.target.value) || 0 })}
      />
      <TextField
       fullWidth
       margin="dense"
       label="Notes"
       multiline
       rows={2}
       value={form.notes}
       onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />
     </DialogContent>
     <DialogActions>
      <Button onClick={() => setOpen(false)}>Cancel</Button>
      <Button onClick={handleSave} variant="contained">Save</Button>
     </DialogActions>
    </Dialog>
   </Box>
  </LocalizationProvider>
 );
}

export default Bookings;