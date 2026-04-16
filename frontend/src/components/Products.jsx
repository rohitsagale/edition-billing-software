import React, { useState, useEffect } from 'react';
import {
 Box,
 Button,
 Table,
 TableBody,
 TableCell,
 TableContainer,
 TableHead,
 TableRow,
 Paper,
 Dialog,
 DialogTitle,
 DialogContent,
 DialogActions,
 TextField,
 IconButton,
 Typography,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import api from '../api';

function Products() {
 const [products, setProducts] = useState([]);
 const [open, setOpen] = useState(false);
 const [editing, setEditing] = useState(null);
 const [formData, setFormData] = useState({ name: '', price: '', description: '' });

 const fetchProducts = async () => {
  const res = await api.get('/products');
  setProducts(res.data);
 };

 useEffect(() => {
  fetchProducts();
 }, []);

 const handleOpen = (product = null) => {
  if (product) {
   setEditing(product.id);
   setFormData({ name: product.name, price: product.price, description: product.description || '' });
  } else {
   setEditing(null);
   setFormData({ name: '', price: '', description: '' });
  }
  setOpen(true);
 };

 const handleClose = () => {
  setOpen(false);
  setEditing(null);
  setFormData({ name: '', price: '', description: '' });
 };

 const handleSave = async () => {
  if (!formData.name || !formData.price) return;
  const payload = { name: formData.name, price: parseFloat(formData.price), description: formData.description };
  if (editing) {
   await api.put(`/products/${editing}`, payload);
  } else {
   await api.post('/products', payload);
  }
  fetchProducts();
  handleClose();
 };

 const handleDelete = async (id) => {
  if (window.confirm('Delete this product?')) {
   try {
    await api.delete(`/products/${id}`);
    fetchProducts();
   } catch (error) {
    console.error('Product delete failed:', error);
    alert(error.response?.data?.msg || error.message || 'Product delete failed');
   }
  }
 };

 return (
  <Box>
   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
    <Typography variant="h4">Products</Typography>
    <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
     Add Product
    </Button>
   </Box>
   <TableContainer component={Paper} elevation={3}>
    <Table>
     <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
      <TableRow>
       <TableCell><strong>Name</strong></TableCell>
       <TableCell><strong>Price (₹)</strong></TableCell>
       <TableCell><strong>Description</strong></TableCell>
       <TableCell align="right"><strong>Actions</strong></TableCell>
      </TableRow>
     </TableHead>
     <TableBody>
      {products.map((p) => (
       <TableRow key={p.id}>
        <TableCell>{p.name}</TableCell>
        <TableCell>₹{p.price}</TableCell>
        <TableCell>{p.description || '—'}</TableCell>
        <TableCell align="right">
         <IconButton color="primary" onClick={() => handleOpen(p)}><Edit /></IconButton>
         <IconButton color="error" onClick={() => handleDelete(p.id)}><Delete /></IconButton>
        </TableCell>
       </TableRow>
      ))}
     </TableBody>
    </Table>
   </TableContainer>

   <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
    <DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle>
    <DialogContent>
     <TextField
      autoFocus
      margin="dense"
      label="Product Name"
      fullWidth
      value={formData.name}
      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
     />
     <TextField
      margin="dense"
      label="Price (₹)"
      type="number"
      fullWidth
      value={formData.price}
      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
     />
     <TextField
      margin="dense"
      label="Description"
      fullWidth
      multiline
      rows={2}
      value={formData.description}
      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
     />
    </DialogContent>
    <DialogActions>
     <Button onClick={handleClose}>Cancel</Button>
     <Button onClick={handleSave} variant="contained">Save</Button>
    </DialogActions>
   </Dialog>
  </Box>
 );
}

export default Products;