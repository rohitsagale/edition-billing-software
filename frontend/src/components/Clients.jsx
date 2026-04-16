import React, { useState, useEffect } from 'react';
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
 Alert,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import api from '../api';

function Clients() {
 const [clients, setClients] = useState([]);
 const [open, setOpen] = useState(false);
 const [editing, setEditing] = useState(null);
 const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });
 const [error, setError] = useState('');

 const fetchClients = async () => {
  const res = await api.get('/clients');
  setClients(res.data);
 };

 useEffect(() => {
  fetchClients();
 }, []);

 const handleOpen = (client = null) => {
  if (client) {
   setEditing(client.id);
   setForm({
    name: client.name,
    phone: client.phone,
    email: client.email || '',
    address: client.address || '',
   });
  } else {
   setEditing(null);
   setForm({ name: '', phone: '', email: '', address: '' });
  }
  setError('');
  setOpen(true);
 };

 const handleSave = async () => {
  if (!form.name || !form.phone) {
   setError('Name and phone are required');
   return;
  }
  try {
   if (editing) {
    await api.put(`/clients/${editing}`, form);
   } else {
    await api.post('/clients', form);
   }
   fetchClients();
   setOpen(false);
  } catch (err) {
   setError(err.response?.data?.msg || 'Failed to save client');
  }
 };

 const handleDelete = async (id) => {
  if (window.confirm('Delete this client? All linked bookings will be affected.')) {
   try {
    await api.delete(`/clients/${id}`);
    fetchClients();
   } catch (err) {
    alert(err.response?.data?.msg || 'Cannot delete client');
   }
  }
 };

 return (
  <Box>
   <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
    <Typography variant="h4">Clients</Typography>
    <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
     Add Client
    </Button>
   </Box>
   <TableContainer component={Paper} elevation={3}>
    <Table>
     <TableHead sx={{ bgcolor: '#f5f5f5' }}>
      <TableRow>
       <TableCell><strong>Name</strong></TableCell>
       <TableCell><strong>Phone</strong></TableCell>
       <TableCell><strong>Email</strong></TableCell>
       <TableCell><strong>Address</strong></TableCell>
       <TableCell><strong>Total Spent (₹)</strong></TableCell>
       <TableCell align="right"><strong>Actions</strong></TableCell>
      </TableRow>
     </TableHead>
     <TableBody>
      {clients.map((c) => (
       <TableRow key={c.id} hover>
        <TableCell>{c.name}</TableCell>
        <TableCell>{c.phone}</TableCell>
        <TableCell>{c.email || '—'}</TableCell>
        <TableCell>{c.address || '—'}</TableCell>
        <TableCell>₹{c.total_spent.toLocaleString()}</TableCell>
        <TableCell align="right">
         <IconButton onClick={() => handleOpen(c)}><Edit /></IconButton>
         <IconButton onClick={() => handleDelete(c.id)}><Delete /></IconButton>
        </TableCell>
       </TableRow>
      ))}
      {clients.length === 0 && (
       <TableRow>
        <TableCell colSpan={6} align="center">No clients found. Add one!</TableCell>
       </TableRow>
      )}
     </TableBody>
    </Table>
   </TableContainer>

   <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
    <DialogTitle>{editing ? 'Edit Client' : 'New Client'}</DialogTitle>
    <DialogContent>
     {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
     <TextField
      fullWidth
      margin="dense"
      label="Name *"
      value={form.name}
      onChange={(e) => setForm({ ...form, name: e.target.value })}
     />
     <TextField
      fullWidth
      margin="dense"
      label="Phone *"
      value={form.phone}
      onChange={(e) => setForm({ ...form, phone: e.target.value })}
     />
     <TextField
      fullWidth
      margin="dense"
      label="Email"
      value={form.email}
      onChange={(e) => setForm({ ...form, email: e.target.value })}
     />
     <TextField
      fullWidth
      margin="dense"
      label="Address"
      multiline
      rows={2}
      value={form.address}
      onChange={(e) => setForm({ ...form, address: e.target.value })}
     />
    </DialogContent>
    <DialogActions>
     <Button onClick={() => setOpen(false)}>Cancel</Button>
     <Button onClick={handleSave} variant="contained">Save</Button>
    </DialogActions>
   </Dialog>
  </Box>
 );
}

export default Clients;