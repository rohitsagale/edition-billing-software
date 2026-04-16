import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
 Container,
 Paper,
 TextField,
 Button,
 Typography,
 Box,
 Alert,
 Avatar,
 InputAdornment,
 IconButton,
} from '@mui/material';
import { Camera, Visibility, VisibilityOff, Lock, Person } from '@mui/icons-material';
import api from '../api';

function Login({ setToken }) {
 const [username, setUsername] = useState('');
 const [password, setPassword] = useState('');
 const [error, setError] = useState('');
 const [showPassword, setShowPassword] = useState(false);
 const navigate = useNavigate();

 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
   const res = await api.post('/login', { username, password });
   localStorage.setItem('token', res.data.access_token);
   localStorage.setItem('username', username);
   setToken(res.data.access_token);
   navigate('/dashboard');
  } catch (err) {
   setError('Invalid username or password');
  }
 };

 return (
  <Box
   sx={{
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: 2,
   }}
  >
   <Container maxWidth="sm">
    <Paper
     elevation={24}
     sx={{
      p: 4,
      borderRadius: 4,
      backdropFilter: 'blur(10px)',
      backgroundColor: 'rgba(255,255,255,0.95)',
      textAlign: 'center',
     }}
    >
     <Avatar sx={{ width: 80, height: 80, bgcolor: '#f59e0b', margin: '0 auto 16px auto' }}>
      <Camera sx={{ fontSize: 48 }} />
     </Avatar>
     <Typography variant="h5" fontWeight="bold" gutterBottom>
      Edition Films & Photography
     </Typography>
     <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
      Billing System Login
     </Typography>

     <form onSubmit={handleSubmit}>
      <TextField
       fullWidth
       margin="normal"
       label="Username"
       variant="outlined"
       value={username}
       onChange={(e) => setUsername(e.target.value)}
       InputProps={{ startAdornment: <InputAdornment position="start"><Person color="secondary" /></InputAdornment> }}
       required
      />
      <TextField
       fullWidth
       margin="normal"
       label="Password"
       type={showPassword ? 'text' : 'password'}
       variant="outlined"
       value={password}
       onChange={(e) => setPassword(e.target.value)}
       InputProps={{
        startAdornment: <InputAdornment position="start"><Lock color="secondary" /></InputAdornment>,
        endAdornment: (
         <InputAdornment position="end">
          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
           {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
         </InputAdornment>
        ),
       }}
       required
      />
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      <Button
       type="submit"
       fullWidth
       variant="contained"
       sx={{
        mt: 3,
        mb: 2,
        bgcolor: '#f59e0b',
        '&:hover': { bgcolor: '#d97706' },
        py: 1.5,
        fontSize: '1rem',
       }}
      >
       Sign In
      </Button>
     </form>
     <Typography variant="caption" color="textSecondary">
      © {new Date().getFullYear()} Edition Films – All rights reserved
     </Typography>
    </Paper>
   </Container>
  </Box>
 );
}

export default Login;