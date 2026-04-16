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
 Chip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import api from '../api';

function EventTypes() {
 const [eventTypes, setEventTypes] = useState([]);
 const [open, setOpen] = useState(false);
 const [editing, setEditing] = useState(null);
 const [form, setForm] = useState({ name: '', description: '' });
 const [error, setError] = useState('');

 const fetchEventTypes = async () => {
  const res = await api.get('/event-types');
  setEventTypes(res.data);
 };

 useEffect(() => {
  fetchEventTypes();
 }, []);

 const handleOpen = (type = null) => {
  if (type) {
   setEditing(type.id);
   setForm({ name: type.name, description: type.description || '' });
  } else {
   setEditing(null);
   setForm({ name: '', description: '' });
  }
  setError('');
  setOpen(true);
 };

 const handleSave = async () => {
  if (!form.name) {
   setError('Event type name is required');
   return;
  }
  try {
   if (editing) {
    await api.put(`/event-types/${editing}`, form);
   } else {
    await api.post('/event-types', form);
   }
   fetchEventTypes();
   setOpen(false);
  } catch (err) {
   setError(err.response?.data?.msg || 'Failed to save event type');
  }
 };

 const handleDelete = async (id) => {
  if (window.confirm('Delete this event type? It may affect existing bookings.')) {
   try {
    await api.delete(`/event-types/${id}`);
    fetchEventTypes();
   } catch (err) {
    alert(err.response?.data?.msg || 'Cannot delete event type');
   }
  }
 };

 return (
  <Box>
   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
    <Typography variant="h4">Event Types</Typography>
    <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
     Add Event Type
    </Button>
   </Box>
   <TableContainer component={Paper} elevation={3}>
    <Table>
     <TableHead sx={{ bgcolor: '#f5f5f5' }}>
      <TableRow>
       <TableCell><strong>Name</strong></TableCell>
       <TableCell><strong>Description</strong></TableCell>
       <TableCell><strong>Status</strong></TableCell>
       <TableCell align="right"><strong>Actions</strong></TableCell>
      </TableRow>
     </TableHead>
     <TableBody>
      {eventTypes.map((type) => (
       <TableRow key={type.id} hover>
        <TableCell>{type.name}</TableCell>
        <TableCell>{type.description || '—'}</TableCell>
        <TableCell>
         <Chip label="Active" color="success" size="small" />
        </TableCell>
        <TableCell align="right">
         <IconButton onClick={() => handleOpen(type)}><Edit /></IconButton>
         <IconButton onClick={() => handleDelete(type.id)}><Delete /></IconButton>
        </TableCell>
       </TableRow>
      ))}
      {eventTypes.length === 0 && (
       <TableRow>
        <TableCell colSpan={4} align="center">No event types defined. Add wedding, engagement, etc.</TableCell>
       </TableRow>
      )}
     </TableBody>
    </Table>
   </TableContainer>

   <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
    <DialogTitle>{editing ? 'Edit Event Type' : 'New Event Type'}</DialogTitle>
    <DialogContent>
     {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
     <TextField
      fullWidth
      margin="dense"
      label="Event Type Name *"
      value={form.name}
      onChange={(e) => setForm({ ...form, name: e.target.value })}
     />
     <TextField
      fullWidth
      margin="dense"
      label="Description"
      multiline
      rows={2}
      value={form.description}
      onChange={(e) => setForm({ ...form, description: e.target.value })}
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

export default EventTypes;