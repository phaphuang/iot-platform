import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  Button,
  AppBar,
  Toolbar,
  Paper,
  LinearProgress,
  Chip,
  Stack,
  Tooltip,
  IconButton
} from '@mui/material';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import FactoryIcon from '@mui/icons-material/Factory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useProgress } from '../context/ProgressContext';

const HomePage = () => {
  const { progress, resetProgress } = useProgress();
  
  const systems = [
    {
      id: 'smart-farming',
      title: 'Smart Farming',
      description: 'Connect IoT components to create an efficient agricultural monitoring and control system.',
      icon: <AgricultureIcon sx={{ fontSize: 60 }} />,
      path: '/smart-farming',
      color: '#4caf50' // green
    },
    {
      id: 'smart-healthcare',
      title: 'Smart Healthcare',
      description: 'Build a patient monitoring system with connected health devices and alerts.',
      icon: <HealthAndSafetyIcon sx={{ fontSize: 60 }} />,
      path: '/smart-healthcare',
      color: '#2196f3' // blue
    },
    {
      id: 'smart-manufacturing',
      title: 'Smart Manufacturing',
      description: 'Create an industrial IoT system for monitoring production and quality control.',
      icon: <FactoryIcon sx={{ fontSize: 60 }} />,
      path: '/smart-manufacturing',
      color: '#ff9800' // orange
    }
  ];

  // Calculate the total score based on completed systems
  const completedSystems = Object.values(progress.completedSystems).filter(Boolean).length;
  const totalScore = Math.round((completedSystems / progress.totalSystems) * 100);
  
  // Handle reset progress button click
  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset your progress? This action cannot be undone.')) {
      resetProgress();
    }
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            IoT Platform Learning Lab
          </Typography>
          <Tooltip title="Reset Progress">
            <IconButton color="inherit" onClick={handleResetProgress}>
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Welcome to the IoT Platform Lab
          </Typography>
          <Typography variant="body1" paragraph align="center">
            This interactive lab helps you learn IoT concepts by building smart systems with drag-and-drop components.
            Complete all three challenges to earn your score!
          </Typography>
          
          <Box sx={{ mt: 3, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1">Your Progress</Typography>
              <Typography variant="subtitle1">{totalScore}%</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={totalScore} 
              sx={{ height: 10, borderRadius: 5 }}
            />
            
            <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'center' }}>
              {systems.map(system => (
                <Tooltip 
                  key={system.id}
                  title={progress.completedSystems[system.id] ? 'Completed!' : 'Not completed yet'}
                >
                  <Chip 
                    icon={progress.completedSystems[system.id] ? <CheckCircleIcon /> : null}
                    label={system.title}
                    color={progress.completedSystems[system.id] ? 'success' : 'default'}
                    variant={progress.completedSystems[system.id] ? 'filled' : 'outlined'}
                  />
                </Tooltip>
              ))}
            </Stack>
            
            {totalScore === 100 && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                <Typography align="center" variant="h6" color="success.contrastText">
                  Congratulations! You've completed all the challenges! 🎉
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        <Grid container spacing={4}>
          {systems.map((system) => {
            const isCompleted = progress.completedSystems[system.id];
            
            return (
              <Grid item xs={12} md={4} key={system.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: '0.3s',
                    position: 'relative',
                    border: isCompleted ? `2px solid ${system.color}` : 'none',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6
                    }
                  }}
                >
                  {isCompleted && (
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: -10, 
                        right: -10,
                        bgcolor: 'success.main',
                        color: 'white',
                        borderRadius: '50%',
                        width: 35,
                        height: 35,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid white',
                        zIndex: 1
                      }}
                    >
                      <CheckCircleIcon />
                    </Box>
                  )}
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      backgroundColor: system.color, 
                      p: 2,
                      color: 'white',
                      opacity: isCompleted ? 1 : 0.9
                    }}
                  >
                    {system.icon}
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {system.title}
                    </Typography>
                    <Typography>
                      {system.description}
                    </Typography>
                  </CardContent>
                  <Box p={2}>
                    <Button 
                      component={Link} 
                      to={system.path} 
                      variant="contained" 
                      fullWidth
                      sx={{ 
                        backgroundColor: system.color,
                        '&:hover': {
                          backgroundColor: system.color,
                          filter: 'brightness(0.9)'
                        }
                      }}
                    >
                      {isCompleted ? 'Review System' : 'Start Challenge'}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
      
      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: 'primary.main', color: 'white' }}>
        <Container maxWidth="sm">
          <Typography variant="body1" align="center">
            IoT Platform Learning Lab &copy; {new Date().getFullYear()}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
