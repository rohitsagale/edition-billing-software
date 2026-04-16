import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Billing from './components/Billing';
import BillList from './components/BillList';
import Clients from './components/Clients';
import Bookings from './components/Bookings';
import EventTypes from './components/EventTypes';
import Layout from './components/Layout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1e3a8a', // deep blue
    },
    secondary: {
      main: '#f59e0b', // amber/gold
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        {!token ? (
          <Login setToken={setToken} />
        ) : (
          <Layout setToken={setToken}>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/bills" element={<BillList />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/event-types" element={<EventTypes />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Layout>
        )}
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;