import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Paper, Typography, Snackbar, Alert, Button, Grid, Card, CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Fade, Zoom, Tooltip, LinearProgress, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Link, useNavigate } from 'react-router-dom';
import { useProgress } from '../../context/ProgressContext';

// This will be our custom node components
import ComponentNode from './ComponentNode';

// Node types for reactflow
const nodeTypes = {
  componentNode: ComponentNode,
};

const IoTFlowEditor = ({ systemName, systemDescription, componentTypes, validationRules }) => {
  // Get the system ID from the system name
  const systemId = systemName.toLowerCase().replace('system', '').trim().replace(/\s+/g, '-');
  const { progress, completeSystem } = useProgress();
  const navigate = useNavigate();
  // State for nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  // The state for tracking if dragging is happening
  const [, setIsDragging] = useState(false);
  const [isSystemValid, setIsSystemValid] = useState(false);
  const [congratsOpen, setCongratsOpen] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');
  const [connectionProgress, setConnectionProgress] = useState(0); // Track progress percentage
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  
  // Handle connection between nodes
  const onConnect = useCallback((params) => {
    // Check if the connection is valid based on source and target types
    const sourceNode = nodes.find(node => node.id === params.source);
    const targetNode = nodes.find(node => node.id === params.target);
    
    if (sourceNode && targetNode) {
      const isValidConnection = checkConnectionValidity(sourceNode.data.type, targetNode.data.type);
      
      // Always add the connection but with different styling based on validity
      setEdges((eds) => addEdge({
        ...params,
        animated: true,
        data: { valid: isValidConnection },
        style: { 
          stroke: isValidConnection ? '#4caf50' : '#f44336', // Green for valid, Red for invalid
          strokeWidth: isValidConnection ? 3 : 2,
          strokeDasharray: isValidConnection ? 'none' : '5,5', // Solid for valid, dashed for invalid
        },
        labelStyle: { fill: isValidConnection ? '#4caf50' : '#f44336', fontWeight: 'bold' },
        label: isValidConnection ? 'Connected' : 'Invalid',
        markerEnd: {
          type: 'arrowclosed',
          color: isValidConnection ? '#4caf50' : '#f44336',
          width: 20,
          height: 20,
        }
      }, eds));
      
      if (isValidConnection) {
        // Check if the overall system is valid after adding the connection
        setTimeout(() => validateSystem(), 100);
      } else {
        showAlert(`Invalid connection: ${sourceNode.data.label} cannot connect to ${targetNode.data.label}`, 'error');
      }
    }
  }, [nodes, edges]);

  // Function to check if a connection between two component types is valid
  const checkConnectionValidity = (sourceType, targetType) => {
    // Find the validation rule for the source component type
    const rule = validationRules.connections.find(r => r.source === sourceType);
    if (!rule) return false;
    
    // Check if the target type is in the allowed targets list
    return rule.targets.includes(targetType);
  };

  // Function to validate the entire system based on the required connections
  const validateSystem = () => {
    // Check if all required component types are present
    const componentTypesInSystem = nodes.map(node => node.data.type);
    const requiredTypes = validationRules.requiredComponents;
    const missingTypes = requiredTypes.filter(type => !componentTypesInSystem.includes(type));
    
    // Calculate component placement progress
    const componentProgress = Math.min(
      100, 
      Math.round((componentTypesInSystem.filter(type => requiredTypes.includes(type)).length / requiredTypes.length) * 100)
    );
    
    if (missingTypes.length > 0) {
      setIsSystemValid(false);
      if (componentProgress > 0 && componentProgress % 25 === 0) {
        // Give hints about what components are still needed
        const missingTypeNames = missingTypes.map(type => {
          // Convert type to a more readable format
          return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }).join(', ');
        showAlert(`Making progress! You still need to add: ${missingTypeNames}`, 'info');
      }
      setConnectionProgress(componentProgress / 2); // Components are half the battle
      return;
    }
    
    // Check if all required connections exist
    const requiredConnections = validationRules.requiredConnections;
    let allRequiredConnectionsExist = true;
    let validConnectionsCount = 0;
    
    requiredConnections.forEach(connection => {
      // Check if at least one connection exists between a source and target of required types
      const connectionExists = edges.some(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        return sourceNode && 
               targetNode && 
               sourceNode.data.type === connection.source && 
               targetNode.data.type === connection.target;
      });
      
      if (connectionExists) {
        validConnectionsCount++;
      } else {
        allRequiredConnectionsExist = false;
      }
    });
    
    // Calculate connection progress (50% for components + 50% for connections)
    const connectionsProgress = Math.round((validConnectionsCount / requiredConnections.length) * 50);
    const totalProgress = 50 + connectionsProgress; // 50% for components + progress on connections
    setConnectionProgress(totalProgress);
    
    // Show progress hint if we've made significant progress but aren't done yet
    if (!allRequiredConnectionsExist && validConnectionsCount > 0 && 
        (connectionsProgress % 10 === 0 || validConnectionsCount === requiredConnections.length - 1)) {
      showAlert(`You've connected ${validConnectionsCount} of ${requiredConnections.length} required components. Keep going!`, 'info');
    }
    
    const wasAlreadyValid = isSystemValid;
    setIsSystemValid(allRequiredConnectionsExist);
    
    // Show notification only when the system transitions from invalid to valid
    if (allRequiredConnectionsExist && !wasAlreadyValid && !alreadyCompleted) {
      setConnectionProgress(100);
      showAlert('Great job! All components are correctly connected! The system is now fully functional!', 'success');
      
      // Mark this system as completed in the progress context
      completeSystem(systemId);
      
      // Show congratulations dialog
      setCongratsOpen(true);
      
      // Update local state
      setAlreadyCompleted(true);
    }
  };

  // Handle dragging a component from the sidebar to the canvas
  const onDragStart = useCallback((event, nodeType, componentType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('componentType', componentType);
    event.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  }, []);
  
  const onDragEnd = () => {
    setIsDragging(false);
  };

  // Handle dropping a component onto the canvas
  const onDrop = (event) => {
    event.preventDefault();
    
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const nodeType = event.dataTransfer.getData('application/reactflow');
    const componentType = event.dataTransfer.getData('componentType');
    
    // Find the component details from our available types
    const componentDetails = componentTypes.find(comp => comp.type === componentType);
    
    if (!nodeType || !componentType || !componentDetails) {
      return;
    }
    
    // Calculate the position where the node was dropped
    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });
    
    // Create the new node
    const newNode = {
      id: `${componentType}-${Date.now()}`,
      type: nodeType,
      position,
      data: {
        type: componentType,
        label: componentDetails.label,
        icon: componentDetails.icon,
        description: componentDetails.description
      },
    };
    
    setNodes((nds) => nds.concat(newNode));
  };

  // Handle drop event on the canvas
  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  // Check if this system was already completed on mount
  useEffect(() => {
    if (progress.completedSystems[systemId]) {
      setIsSystemValid(true);
      setAlreadyCompleted(true);
    }
  }, [progress, systemId]);

  // Show alert message
  const showAlert = (message, severity) => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
    
    // For success alerts, make them more prominent with a special animation
    if (severity === 'success' && message.includes('correctly connected')) {
      // If we're already showing a success alert, wait for it to close
      setTimeout(() => {
        setCongratsOpen(true);
      }, 1500);
    }
  };

  // Handle alert close
  const handleAlertClose = () => {
    setAlertOpen(false);
  };
  
  // Handle congratulations dialog close
  const handleCongratsClose = () => {
    setCongratsOpen(false);
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', backgroundColor: 'primary.main', color: 'white' }}>
        <Grid container alignItems="center">
          <Grid item>
            <Button 
              component={Link} 
              to="/" 
              variant="contained" 
              color="inherit" 
              startIcon={<ArrowBackIcon />}
              sx={{ mr: 2, color: 'primary.main' }}
            >
              Back
            </Button>
          </Grid>
          <Grid item>
            <Typography variant="h6">{systemName}</Typography>
          </Grid>
          <Grid item marginLeft="auto">
            <Fade in={isSystemValid}>
              <Box display="flex" alignItems="center" sx={{
                bgcolor: 'success.main',
                color: 'white',
                px: 2,
                py: 1,
                borderRadius: 2,
                boxShadow: 3,
                animation: isSystemValid ? 'pulse 1.5s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)' },
                  '70%': { boxShadow: '0 0 0 10px rgba(76, 175, 80, 0)' },
                  '100%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)' },
                },
              }}>
                <Zoom in={isSystemValid}>
                  <CheckCircleIcon sx={{ mr: 1 }} />
                </Zoom>
                <Typography fontWeight="bold">System Correctly Configured!</Typography>
              </Box>
            </Fade>
          </Grid>
        </Grid>
      </Box>
      
      {/* Progress Indicator */}
      <Box sx={{ px: 2, py: 1, backgroundColor: '#f5f5f5', borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">System Completion</Typography>
          <Typography variant="subtitle2" fontWeight="bold" color={connectionProgress === 100 ? 'success.main' : 'primary.main'}>
            {connectionProgress}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={connectionProgress} 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: 'grey.300',
            '& .MuiLinearProgress-bar': {
              backgroundColor: connectionProgress === 100 ? 'success.main' : 'primary.main',
              transition: 'transform 0.5s ease-out'
            }
          }} 
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {connectionProgress < 50 ? 'Add all required components first' : 
           connectionProgress < 100 ? 'Connect the components correctly' : 
           'System completed!'}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {/* Component Palette */}
        <Box 
          sx={{ 
            width: 250, 
            p: 2, 
            borderRight: 1, 
            borderColor: 'divider',
            overflowY: 'auto',
            backgroundColor: '#f5f5f5'
          }}
        >
          <Typography variant="h6" gutterBottom>Components</Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Drag and drop components to the canvas and connect them to create your IoT system.
          </Typography>
          
          {componentTypes.map((component) => (
            <Paper
              key={component.type}
              sx={{
                p: 1,
                mb: 1,
                cursor: 'move',
                '&:hover': { backgroundColor: 'action.hover' },
              }}
              onDragStart={(event) => onDragStart(event, 'componentNode', component.type)}
              onDragEnd={onDragEnd}
              draggable
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {component.icon && (
                  <Box sx={{ mr: 1, color: 'primary.main' }}>
                    {component.icon}
                  </Box>
                )}
                <Box>
                  <Typography variant="subtitle2">{component.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {component.description}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
        
        {/* Flow Canvas */}
        <Box
          ref={reactFlowWrapper}
          sx={{ flexGrow: 1, height: '100%' }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
            <Panel position="bottom-center">
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{systemName}</Typography>
                  <Typography variant="body2">{systemDescription}</Typography>
                </CardContent>
              </Card>
            </Panel>
          </ReactFlow>
        </Box>
      </Box>
      
      <Snackbar 
        open={alertOpen} 
        autoHideDuration={alertSeverity === 'success' ? 10000 : 6000} 
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            fontSize: alertSeverity === 'success' ? '1.1rem' : '1rem',
          }
        }}
      >
        <Alert 
          onClose={handleAlertClose} 
          severity={alertSeverity} 
          variant="filled"
          elevation={6}
          sx={{ 
            width: '100%', 
            fontSize: alertSeverity === 'success' ? '1.1rem' : '1rem',
            '& .MuiAlert-icon': {
              fontSize: alertSeverity === 'success' ? '2rem' : '1.5rem',
            }
          }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>

      {/* Congratulations Dialog */}
      <Dialog
        open={congratsOpen}
        onClose={handleCongratsClose}
        aria-labelledby="congrats-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="congrats-dialog-title" sx={{ textAlign: 'center', bgcolor: 'success.main', color: 'white' }}>
          Congratulations! 🎉
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ 
              position: 'relative',
              animation: 'successPulse 2s infinite',
              '@keyframes successPulse': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.1)' },
                '100%': { transform: 'scale(1)' },
              }
            }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 100, mb: 2 }} />
            </Box>
            
            <Typography variant="h5" color="success.main" fontWeight="bold" sx={{ mb: 2 }}>
              Congratulations!
            </Typography>
            
            <DialogContentText sx={{ textAlign: 'center', mb: 2, fontSize: '1.1rem' }}>
              You've successfully configured the {systemName}!
            </DialogContentText>
            
            <Box sx={{ 
              bgcolor: 'success.light', 
              p: 2, 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'success.main',
              mb: 2
            }}>
              <DialogContentText sx={{ textAlign: 'center', color: 'success.dark' }}>
                Your progress has been saved. Return to the home screen to see your updated progress or try another challenge.
              </DialogContentText>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            onClick={handleCongratsClose} 
            variant="contained" 
            color="primary"
            size="large"
          >
            Back to Home
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IoTFlowEditor;
