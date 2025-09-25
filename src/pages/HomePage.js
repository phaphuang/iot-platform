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
  IconButton,
  useMediaQuery,
  useTheme,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Slide
} from '@mui/material';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import FactoryIcon from '@mui/icons-material/Factory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import { useProgress } from '../context/ProgressContext';

// Transition for dialogs
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const HomePage = () => {
  const { progress, resetProgress } = useProgress();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isTouchDevice = React.useMemo(
    () => 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    []
  );
  const [resetDialogOpen, setResetDialogOpen] = React.useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = React.useState(false);
  
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
    setResetDialogOpen(true);
  };
  
  // Handle reset confirmation
  const handleResetConfirm = () => {
    resetProgress();
    setResetDialogOpen(false);
  };
  
  // Handle dialog close
  const handleDialogClose = () => {
    setResetDialogOpen(false);
  };
  
  // Handle help dialog
  const handleHelpOpen = () => {
    setHelpDialogOpen(true);
  };
  
  const handleHelpClose = () => {
    setHelpDialogOpen(false);
  };

  return (
    <Box>
      <AppBar position="static" elevation={isMobile ? 0 : 3}>
        <Toolbar sx={{ minHeight: isMobile ? 56 : 64 }}>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 'bold',
              fontSize: isMobile ? '1.15rem' : '1.5rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            IoT Platform Lab
          </Typography>
          {isMobile ? (
            <Box>
              <Tooltip title="Help">
                <IconButton color="inherit" onClick={handleHelpOpen} sx={{ mr: 1 }}>
                  <HelpOutlineIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reset Progress">
                <IconButton color="inherit" onClick={handleResetProgress} edge="end">
                  <RestartAltIcon />
                </IconButton>
              </Tooltip>
            </Box>
          ) : (
            <Box>
              <Button 
                color="inherit" 
                startIcon={<HelpOutlineIcon />} 
                onClick={handleHelpOpen}
                sx={{ mr: 2 }}
              >
                Help
              </Button>
              <Button 
                color="inherit" 
                startIcon={<RestartAltIcon />} 
                onClick={handleResetProgress}
              >
                Reset Progress
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: isMobile ? 2 : 4, px: isMobile ? 1 : 2 }}>
        <Paper 
          elevation={isMobile ? 1 : 3} 
          sx={{ 
            p: isMobile ? 2 : 4, 
            mb: isMobile ? 2 : 4,
            borderRadius: isMobile ? 2 : 3 
          }}
        >
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h1" 
            gutterBottom 
            align="center"
            sx={{ fontWeight: 'bold' }}
          >
            Welcome to IoT Platform Lab
          </Typography>
          <Typography 
            variant={isMobile ? "body2" : "body1"} 
            paragraph 
            align="center"
          >
            This interactive lab helps you learn IoT concepts by building smart systems with {isMobile ? '' : 'drag-and-drop '}
            components. Complete all challenges to earn your score!
          </Typography>
          
          <Box sx={{ mt: isMobile ? 2 : 3, mb: isMobile ? 1 : 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant={isMobile ? "subtitle2" : "subtitle1"} fontWeight="medium">Your Progress</Typography>
              <Typography 
                variant={isMobile ? "subtitle2" : "subtitle1"} 
                fontWeight="bold" 
                color={totalScore === 100 ? 'success.main' : 'primary.main'}
              >
                {totalScore}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={totalScore} 
              sx={{ 
                height: isMobile ? 8 : 10, 
                borderRadius: 5,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  bgcolor: totalScore === 100 ? 'success.main' : 'primary.main',
                },
              }}
            />
            
            <Stack 
              direction={isMobile ? "column" : "row"} 
              spacing={isMobile ? 1 : 2} 
              sx={{ 
                mt: isMobile ? 1.5 : 2, 
                justifyContent: 'center',
                alignItems: isMobile ? 'stretch' : 'center',
              }}
            >
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
                    sx={{
                      width: isMobile ? '100%' : 'auto',
                      py: isMobile ? 0.5 : 0,
                      '& .MuiChip-label': {
                        fontSize: isMobile ? '0.85rem' : 'inherit',
                      }
                    }}
                  />
                </Tooltip>
              ))}
            </Stack>
            
            {totalScore === 100 && (
              <Box 
                sx={{ 
                  mt: 2, 
                  p: isMobile ? 1.5 : 2, 
                  bgcolor: 'success.light', 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'success.main',
                }}
              >
                <Typography 
                  align="center" 
                  variant={isMobile ? "body1" : "h6"} 
                  color="success.dark"
                  fontWeight="bold"
                >
                  Congratulations! You've completed all the challenges! 🎉
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        <Grid container spacing={isMobile ? 2 : 4}>
          {systems.map((system) => {
            const isCompleted = progress.completedSystems[system.id];
            
            return (
              <Grid item xs={12} sm={6} md={4} key={system.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    borderRadius: isMobile ? 3 : 4,
                    overflow: 'hidden',
                    border: isCompleted ? `2px solid ${system.color}` : 'none',
                    boxShadow: isCompleted ? 3 : 2,
                    '&:active': isTouchDevice ? {
                      transform: 'scale(0.98)',
                    } : {},
                    '&:hover': !isTouchDevice ? {
                      transform: 'translateY(-8px)',
                      boxShadow: 6
                    } : {}
                  }}
                >
                  {isCompleted && (
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: isMobile ? -8 : -10, 
                        right: isMobile ? -8 : -10,
                        bgcolor: 'success.main',
                        color: 'white',
                        borderRadius: '50%',
                        width: isMobile ? 30 : 35,
                        height: isMobile ? 30 : 35,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid white',
                        zIndex: 1
                      }}
                    >
                      <CheckCircleIcon fontSize={isMobile ? "small" : "medium"} />
                    </Box>
                  )}
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      backgroundColor: system.color, 
                      py: isMobile ? 1.5 : 2,
                      px: 2,
                      color: 'white',
                      opacity: isCompleted ? 1 : 0.9
                    }}
                  >
                    {React.cloneElement(system.icon, { 
                      sx: { fontSize: isMobile ? 50 : 60 } 
                    })}
                  </Box>
                  <CardContent sx={{ flexGrow: 1, py: isMobile ? 1.5 : 2 }}>
                    <Typography 
                      gutterBottom 
                      variant={isMobile ? "h6" : "h5"} 
                      component="h2"
                      sx={{ fontWeight: 'bold' }}
                    >
                      {system.title}
                    </Typography>
                    <Typography variant={isMobile ? "body2" : "body1"}>
                      {system.description}
                    </Typography>
                  </CardContent>
                  <Box p={isMobile ? 1.5 : 2}>
                    <Button 
                      component={Link} 
                      to={system.path} 
                      variant="contained" 
                      fullWidth
                      size={isMobile ? "large" : "large"}
                      sx={{ 
                        backgroundColor: system.color,
                        py: isMobile ? 1.2 : 1.5,
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        fontWeight: 'bold',
                        borderRadius: isMobile ? 3 : 4,
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
      
      <Box 
        component="footer" 
        sx={{ 
          py: isMobile ? 2 : 3, 
          px: 2, 
          mt: 'auto', 
          backgroundColor: 'primary.main', 
          color: 'white'
        }}
      >
        <Container maxWidth="sm">
          <Typography variant={isMobile ? "body2" : "body1"} align="center">
            IoT Platform Learning Lab &copy; {new Date().getFullYear()}
          </Typography>
          {isMobile && (
            <Typography variant="caption" align="center" sx={{ display: 'block', mt: 0.5, opacity: 0.8 }}>
              Optimized for mobile and tablet devices
            </Typography>
          )}
        </Container>
      </Box>

      {/* Reset Progress Dialog */}
      <Dialog
        open={resetDialogOpen}
        onClose={handleDialogClose}
        TransitionComponent={Transition}
        aria-labelledby="reset-dialog-title"
        fullWidth
        maxWidth="xs"
        PaperProps={{
          elevation: 3,
          sx: { borderRadius: isMobile ? 2 : 3 }
        }}
      >
        <DialogTitle id="reset-dialog-title" sx={{
          bgcolor: 'error.main',
          color: 'white',
          fontSize: isMobile ? '1.1rem' : '1.25rem',
        }}>
          Reset Progress
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 1 }}>
          <DialogContentText>
            Are you sure you want to reset all your progress? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, display: 'flex', gap: 1 }}>
          <Button 
            onClick={handleDialogClose} 
            variant="outlined" 
            fullWidth={isMobile}
            color="primary"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleResetConfirm} 
            variant="contained" 
            fullWidth={isMobile}
            color="error"
          >
            Reset
          </Button>
        </DialogActions>
      </Dialog>

      {/* Help Dialog */}
      <Dialog
        open={helpDialogOpen}
        onClose={handleHelpClose}
        TransitionComponent={Transition}
        aria-labelledby="help-dialog-title"
        fullWidth
        maxWidth="sm"
        PaperProps={{
          elevation: 3,
          sx: { borderRadius: isMobile ? 2 : 3 }
        }}
      >
        <DialogTitle id="help-dialog-title" sx={{
          bgcolor: 'primary.main',
          color: 'white',
          fontSize: isMobile ? '1.1rem' : '1.25rem',
        }}>
          IoT Platform Help
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            {isTouchDevice && (
              <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TouchAppIcon color="primary" sx={{ fontSize: 30, mr: 1 }} />
                <Typography variant="h6" color="primary.main">
                  Touch Device Instructions
                </Typography>
              </Grid>
            )}

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                How to use the IoT Platform:
              </Typography>
              
              <Typography variant="body1" paragraph>
                1. Select one of the three systems to start (Smart Farming, Healthcare, or Manufacturing)
              </Typography>
              
              <Typography variant="body1" paragraph>
                2. {isTouchDevice 
                  ? 'Tap on components in the palette to add them to the canvas' 
                  : 'Drag components from the left panel onto the canvas'}
              </Typography>
              
              <Typography variant="body1" paragraph>
                3. {isTouchDevice 
                  ? 'Connect components by tapping on a connection point and dragging to another component' 
                  : 'Connect components by dragging from one connection point to another'}
              </Typography>
              
              <Typography variant="body1" paragraph>
                4. Build the complete system according to the instructions
              </Typography>
              
              <Typography variant="body1">
                5. When correctly connected, the system will show a success message
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Completing Systems:
              </Typography>
              
              <Typography variant="body1" paragraph>
                • Each system has specific components that must be connected correctly
              </Typography>
              
              <Typography variant="body1" paragraph>
                • Green connections indicate correct connections, red indicates incorrect ones
              </Typography>
              
              <Typography variant="body1" paragraph>
                • You must complete all three systems to achieve a 100% score
              </Typography>
              
              <Typography variant="body1">
                • Your progress is automatically saved between sessions
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleHelpClose} 
            variant="contained" 
            color="primary"
            fullWidth={isMobile}
          >
            Got it
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HomePage;
