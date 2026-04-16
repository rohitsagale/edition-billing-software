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
} from '@mui/material';
import { Camera as CameraIcon } from '@mui/icons-material';
import api from '../api';

function Login({ setToken }) {
 const [username, setUsername] = useState('');
 const [password, setPassword] = useState('');
 const [error, setError] = useState('');
 const navigate = useNavigate();

 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
   const res = await api.post('/login', { username, password });
   localStorage.setItem('token', res.data.access_token);
   setToken(res.data.access_token);
   navigate('/dashboard');
  } catch (err) {
   setError('Invalid username or password');
  }
 };

 return (
  <Container component="main" maxWidth="xs">
   <Box
    sx={{
     marginTop: 8,
     display: 'flex',
     flexDirection: 'column',
     alignItems: 'center',
    }}
   >
    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
     <CameraIcon />
    </Avatar>
    <Typography component="h1" variant="h5">
     Edition Films – Billing
    </Typography>
    <Paper elevation={3} sx={{ p: 4, mt: 3, width: '100%' }}>
     <form onSubmit={handleSubmit}>
      <TextField
       margin="normal"
       required
       fullWidth
       label="Username"
       autoComplete="username"
       autoFocus
       value={username}
       onChange={(e) => setUsername(e.target.value)}
      />
      <TextField
       margin="normal"
       required
       fullWidth
       label="Password"
       type="password"
       autoComplete="current-password"
       value={password}
       onChange={(e) => setPassword(e.target.value)}
      />
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      <Button
       type="submit"
       fullWidth
       variant="contained"
       sx={{ mt: 3, mb: 2 }}
      >
       Sign In
      </Button>
     </form>
    </Paper>
   </Box>
  </Container>
 );
}

export default Login;