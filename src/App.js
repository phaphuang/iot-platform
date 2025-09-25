import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import './App.css';

// Import pages
import HomePage from './pages/HomePage';
import SmartFarming from './pages/SmartFarming';
import SmartHealthcare from './pages/SmartHealthcare';
import SmartManufacturing from './pages/SmartManufacturing';

// Import progress context provider
import { ProgressProvider } from './context/ProgressContext';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#4caf50',
    },
    success: {
      main: '#4caf50',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ProgressProvider>
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/smart-farming" element={<SmartFarming />} />
              <Route path="/smart-healthcare" element={<SmartHealthcare />} />
              <Route path="/smart-manufacturing" element={<SmartManufacturing />} />
            </Routes>
          </Box>
        </Router>
      </ProgressProvider>
    </ThemeProvider>
  );
}

export default App;
