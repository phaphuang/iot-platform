import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
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
import { Box, Paper, Typography, Snackbar, Alert, Button, Grid, Card, CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Fade, Zoom, Tooltip, LinearProgress, useMediaQuery, IconButton, SwipeableDrawer, useTheme, Divider, ButtonGroup, Fab, Switch, FormControlLabel } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MenuIcon from '@mui/icons-material/Menu';
import PaletteIcon from '@mui/icons-material/Palette';
import CloseIcon from '@mui/icons-material/Close';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Link, useNavigate } from 'react-router-dom';
import { useProgress } from '../../context/ProgressContext';

// This will be our custom node components
import ComponentNode from './ComponentNode';

// Node types for reactflow
const nodeTypes = {
  componentNode: ComponentNode,
};

const IoTFlowEditor = ({ systemName, systemDescription, componentTypes, validationRules, systemId }) => {
  // Get the theme and media queries for responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const { progress, completeSystem } = useProgress();
  const navigate = useNavigate();
  // State for nodes and edges
  const [nodes, setNodes, originalOnNodesChange] = useNodesState([]);
  const [edges, setEdges, originalOnEdgesChange] = useEdgesState([]);
  
  // Reference for validateSystem to avoid circular dependencies
  const validateSystemRef = useRef(null);
  
  // Custom handlers for nodes and edges changes that trigger validation
  const onNodesChange = useCallback((changes) => {
    // First apply the original changes
    originalOnNodesChange(changes);
    
    // Then trigger validation after a small delay to ensure state is updated
    setTimeout(() => {
      if (validateSystemRef.current) validateSystemRef.current();
    }, 50);
  }, [originalOnNodesChange]);
  
  const onEdgesChange = useCallback((changes) => {
    // First apply the original changes
    originalOnEdgesChange(changes);
    
    // Then trigger validation after a small delay to ensure state is updated
    setTimeout(() => {
      if (validateSystemRef.current) validateSystemRef.current();
    }, 50);
  }, [originalOnEdgesChange]);
  
  // State for system persistence
  const [hasLoadedState, setHasLoadedState] = useState(false);
  const [hasSavedState, setHasSavedState] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  // The state for tracking if dragging is happening
  const [, setIsDragging] = useState(false);
  const [isSystemValid, setIsSystemValid] = useState(false);
  const [congratsOpen, setCongratsOpen] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');
  const [connectionProgress, setConnectionProgress] = useState(0);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [touchHelpOpen, setTouchHelpOpen] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false); // Track progress percentage
  const [descriptionVisible, setDescriptionVisible] = useState(true); // Toggle for system description visibility
  const [connectionTipsVisible, setConnectionTipsVisible] = useState(() => {
    // Check if the tips have been dismissed before
    const tipsState = localStorage.getItem('connection_tips_visible');
    return tipsState === null ? true : tipsState === 'true';
  }); // Toggle for connection tips visibility
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  
  // Show alert message function - defined before it's used in callbacks
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
  
  // Handle connection between nodes with improved cursor alignment
  const onConnect = useCallback((params) => {
    console.log('Connection event triggered');
    // Check if the connection is valid based on source and target types
    const sourceNode = nodes.find(node => node.id === params.source);
    const targetNode = nodes.find(node => node.id === params.target);
    
    // Get the exact connection point positions for source and target
    // This helps with cursor alignment issues
    const sourcePosition = params.sourceHandle ? params.sourceHandle.split('-')[0] : 'bottom';
    const targetPosition = params.targetHandle ? params.targetHandle.split('-')[0] : 'top';
    
    if (sourceNode && targetNode) {
      // Check if connection is valid
      const isValidConnection = checkConnectionValidity(sourceNode.data.type, targetNode.data.type);
      
      // Always add the connection but with different styling based on validity
      // Add the new connection
      setEdges((eds) => {
        const newEdges = addEdge({
          ...params,
          animated: true,
          data: { valid: isValidConnection },
          style: { 
            stroke: isValidConnection ? '#4caf50' : '#f44336', // Green for valid, Red for invalid
            strokeWidth: isValidConnection ? (isTouchDevice ? 5 : 4) : (isTouchDevice ? 4 : 3),
          strokeDasharray: isValidConnection ? 'none' : '5,5', // Solid for valid, dashed for invalid
          transition: 'stroke-width 0.3s ease',
        },
        labelStyle: { 
          fill: isValidConnection ? '#4caf50' : '#f44336', 
          fontWeight: 'bold',
          fontSize: isMobile ? 12 : 14,
          textShadow: '0px 0px 2px white',
        },
        label: isValidConnection ? 'Connected' : 'Invalid',
        markerEnd: {
          type: 'arrowclosed',
          color: isValidConnection ? '#4caf50' : '#f44336',
          width: isTouchDevice ? 25 : 20,
          height: isTouchDevice ? 25 : 20,
        },
        // Add animated particles for valid connections to make them more noticeable
        // This is only visible in the UI as a special React Flow effect
        pathOptions: isValidConnection ? {
          borderRadius: 20,
        } : undefined,
        }, eds);
        
        // Run validation immediately after adding the edge
        // Using a minimal timeout to ensure the edge state is updated
        setTimeout(() => {
          console.log('Validating after new connection');
          validateSystem();
        }, 10);
        
        return newEdges;
      });
      
      if (isValidConnection) {
        // Show a success message to provide immediate feedback
        showAlert(`Successfully connected ${sourceNode.data.label} to ${targetNode.data.label}`, 'success');
        
        // Vibrate the device for tactile feedback on mobile
        if (isTouchDevice && 'vibrate' in navigator) {
          try {
            navigator.vibrate(100);
          } catch (e) {
            // Ignore if vibration is not supported or permitted
          }
        }
        
        // Check if the overall system is valid after adding the connection
        setTimeout(() => validateSystem(), 300);
      } else {
        // Show error message for invalid connection
        showAlert(`Invalid connection: ${sourceNode.data.label} cannot connect to ${targetNode.data.label}`, 'error');
        
        // Vibrate the device with a different pattern for error feedback
        if (isTouchDevice && 'vibrate' in navigator) {
          try {
            navigator.vibrate([50, 100, 50]);
          } catch (e) {
            // Ignore if vibration is not supported or permitted
          }
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes]);

  // Function to check if a connection between two component types is valid
  const checkConnectionValidity = (sourceType, targetType) => {
    // Find the validation rule for the source component type
    const rule = validationRules.connections.find(r => r.source === sourceType);
    if (!rule) return false;
    
    // Check if the target type is in the allowed targets list
    return rule.targets.includes(targetType);
  };

  // Function to validate the entire system based on the required connections
  const validateSystem = useCallback(() => {
    // Check if all required component types are present
    const componentTypesInSystem = nodes.map(node => node.data.type);
    const requiredTypes = validationRules.requiredComponents;
    const missingTypes = requiredTypes.filter(type => !componentTypesInSystem.includes(type));
    
    // Calculate component placement progress
    const componentProgress = Math.min(
      100, 
      Math.round((componentTypesInSystem.filter(type => requiredTypes.includes(type)).length / requiredTypes.length) * 100)
    );
    
    console.log('Validating system: Component types =', componentTypesInSystem);
    console.log('Required types =', requiredTypes);
    console.log('Component progress =', componentProgress + '%');
    
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
    const connectionsProgress = Math.ceil((validConnectionsCount / requiredConnections.length) * 50);
    const totalProgress = 50 + connectionsProgress; // 50% for components + progress on connections
    
    console.log('Valid connections =', validConnectionsCount, '/', requiredConnections.length);
    console.log('Connections progress =', connectionsProgress + '%');
    console.log('Total progress =', totalProgress + '%');
    
    // Only show visual feedback if progress actually changed
    if (totalProgress !== connectionProgress) {
      // Update progress
      setConnectionProgress(totalProgress);
      
      // Flash the progress indicator (subtle visual feedback)
      const progressBar = document.querySelector('.MuiLinearProgress-root');
      if (progressBar) {
        // Add a temporary highlight class
        progressBar.classList.add('progress-updated');
        
        // Remove the highlight class after animation completes
        setTimeout(() => {
          progressBar.classList.remove('progress-updated');
        }, 1000);
      }
    } else {
      setConnectionProgress(totalProgress); // Still set it even if unchanged
    }
    
    // Show progress hint if we've made significant progress but aren't done yet
    if (!allRequiredConnectionsExist && validConnectionsCount > 0 && 
        (connectionsProgress % 5 === 0 || validConnectionsCount === requiredConnections.length - 1)) {
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
  }, [nodes, edges, validationRules, setConnectionProgress, setIsSystemValid, showAlert, completeSystem, systemId, alreadyCompleted, isSystemValid]);
  
  // Store the validateSystem in the ref so it can be used from other callbacks
  useEffect(() => {
    validateSystemRef.current = validateSystem;
  }, [validateSystem]);

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
  
  // Handle double-click on edge to remove connection
  const onEdgeDoubleClick = useCallback((event, edge) => {
    event.preventDefault();
    
    // Find the source and target nodes for this edge
    const sourceNode = nodes.find(node => node.id === edge.source);
    const targetNode = nodes.find(node => node.id === edge.target);
    
    if (sourceNode && targetNode) {
      // Get descriptive names for log and alert
      const sourceName = sourceNode.data.label;
      const targetName = targetNode.data.label;
      
      console.log(`Removing connection: ${sourceName} to ${targetName}`);
      
      // Remove the edge
      setEdges((eds) => eds.filter(e => e.id !== edge.id));
      
      // Show feedback
      showAlert(`Removed connection from ${sourceName} to ${targetName}`, 'info');
      
      // Vibrate device for tactile feedback on mobile
      if (isTouchDevice && 'vibrate' in navigator) {
        try {
          navigator.vibrate([40, 60, 40]);
        } catch (e) {
          // Ignore if vibration is not supported
        }
      }
    }
  }, [nodes, setEdges, showAlert, isTouchDevice]);

  // Save the current system state to localStorage
  const saveSystemState = (silent = false) => {
    if (nodes.length === 0) return;
    
    try {
      const now = new Date();
      const timestamp = now.toISOString();
      
      const systemState = {
        nodes,
        edges,
        timestamp,
        progress: connectionProgress,
        isValid: isSystemValid,
      };
      
      localStorage.setItem(`iot_system_${systemId}`, JSON.stringify(systemState));
      setHasSavedState(true);
      setLastSavedTime(now);
      
      // Show success message (only if not silent)
      if (!silent) {
        showAlert('System state saved successfully', 'success');
      }
      return true;
    } catch (error) {
      console.error('Error saving system state:', error);
      if (!silent) {
        showAlert('Failed to save system state', 'error');
      }
      return false;
    }
  };
  
  // Load the saved system state from localStorage
  const loadSystemState = () => {
    try {
      const savedState = localStorage.getItem(`iot_system_${systemId}`);
      
      if (savedState) {
        const { 
          nodes: savedNodes, 
          edges: savedEdges, 
          timestamp,
          progress: savedProgress,
          isValid: savedIsValid 
        } = JSON.parse(savedState);
        
        if (savedNodes && savedNodes.length > 0) {
          setNodes(savedNodes);
          setEdges(savedEdges || []);
          setHasSavedState(true);
          
          // Restore progress and validation status
          if (typeof savedProgress === 'number') {
            setConnectionProgress(savedProgress);
          }
          
          if (typeof savedIsValid === 'boolean') {
            setIsSystemValid(savedIsValid);
          }
          
          // Set the last saved time if available
          if (timestamp) {
            setLastSavedTime(new Date(timestamp));
          }
          
          // Show success message
          showAlert('Previous system state restored', 'info');
          
          // Validate system immediately to update progress
          // Note: we need a very short timeout to ensure the UI has updated first
          setTimeout(() => {
            console.log('Forcing progress update after loading state');
            validateSystem();
          }, 50);
          return true;
        }
      }
    } catch (error) {
      console.error('Error loading system state:', error);
    }
    
    return false;
  };
  
  // Clear the saved system state
  const clearSystemState = () => {
    try {
      localStorage.removeItem(`iot_system_${systemId}`);
      setHasSavedState(false);
      setLastSavedTime(null);
      showAlert('Saved state cleared', 'info');
      
      // Reset the current nodes/edges (optional)
      if (window.confirm('Do you want to clear the current diagram as well?')) {
        setNodes([]);
        setEdges([]);
      }
    } catch (error) {
      console.error('Error clearing system state:', error);
    }
  };

  // Toggle auto-save functionality
  const handleAutoSaveToggle = (event) => {
    const newValue = event.target.checked;
    setAutoSaveEnabled(newValue);
    
    // Save this preference to localStorage
    try {
      localStorage.setItem('iot_autosave_enabled', JSON.stringify(newValue));
      showAlert(`Auto-save ${newValue ? 'enabled' : 'disabled'}`, 'info');
    } catch (error) {
      console.error('Failed to save auto-save preference:', error);
    }
  };

  // Navigation handler with auto-save
  const handleBack = () => {
    // Save state before navigating away if auto-save is enabled
    if (autoSaveEnabled && nodes.length > 0) {
      saveSystemState();
    }
    navigate('/');
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
    
    setNodes((nds) => {
      const updatedNodes = nds.concat(newNode);
      
      // Validate immediately after adding the node
      setTimeout(() => {
        console.log('Validating after node drop');
        validateSystem();
      }, 10);
      
      return updatedNodes;
    });
  };

  // Handle drop event on the canvas
  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  // Check if this system was already completed on mount and detect touch devices
  useEffect(() => {
    if (progress.completedSystems[systemId]) {
      setIsSystemValid(true);
      setAlreadyCompleted(true);
    }

    // Check if user is on a touch device
    const isTouchEnabled = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    setIsTouchDevice(isTouchEnabled);
    
    // Show touch help dialog for touch devices on first render
    if (isTouchEnabled && !sessionStorage.getItem('touchHelpShown')) {
      setTouchHelpOpen(true);
      sessionStorage.setItem('touchHelpShown', 'true');
    }
    
    // Check if there's a saved state and load it
    if (!hasLoadedState) {
      const loaded = loadSystemState();
      setHasLoadedState(true);
      
      // Check if there's a saved state in localStorage even if loading failed
      if (!loaded) {
        const savedState = localStorage.getItem(`iot_system_${systemId}`);
        setHasSavedState(!!savedState);
      }
    }
    
    // Load auto-save preference
    try {
      const savedAutoSavePreference = localStorage.getItem('iot_autosave_enabled');
      if (savedAutoSavePreference !== null) {
        setAutoSaveEnabled(JSON.parse(savedAutoSavePreference));
      }
    } catch (e) {
      // If preference can't be loaded, keep default (true)
      console.error('Failed to load auto-save preference:', e);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.completedSystems, systemId]);
  
  // Auto-save system state when nodes or edges change (if enabled)
  useEffect(() => {
    if (autoSaveEnabled && hasLoadedState && nodes.length > 0) {
      // Use debounce to avoid saving too frequently
      const timer = setTimeout(() => {
        // Save silently to avoid too many notifications
        if (saveSystemState(true)) {
          // Show a non-intrusive auto-save indicator
          const smallToast = document.getElementById('auto-save-toast');
          if (smallToast) {
            smallToast.style.opacity = '1';
            setTimeout(() => {
              smallToast.style.opacity = '0';
            }, 2000);
          }
        }
      }, 3000); // Save 3 seconds after the last change
      
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, autoSaveEnabled, hasLoadedState]);

  // Recalculate progress when nodes or edges change
  useEffect(() => {
    if (hasLoadedState && nodes.length > 0) {
      // Only validate after initial load to avoid extra validation during initialization
      const timer = setTimeout(() => {
        console.log('Validating system after nodes/edges change');
        validateSystem();
      }, 50);
      
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length, edges.length, hasLoadedState]);

  // Alert and dialog handling functions are moved to the top (defined earlier)
  
  // Handle Congratulations dialog close
  const handleCongratsClose = () => {
    setCongratsOpen(false);
    navigate('/');
  };

  // Handle mobile drawer toggle
  const toggleMobileDrawer = (open) => () => {
    setMobileDrawerOpen(open);
  };
  
  // Handle touch help dialog close
  const handleTouchHelpClose = () => {
    setTouchHelpOpen(false);
  };

  // Create flow options with touch device adjustments and precise cursor alignment
  const defaultEdgeOptions = useMemo(() => ({
    style: { 
      strokeWidth: isTouchDevice ? 4 : 3,
      stroke: '#1976d2',
    },
    markerEnd: { 
      type: 'arrowclosed',
      width: isTouchDevice ? 25 : 20,
      height: isTouchDevice ? 25 : 20,
      color: '#1976d2'
    },
    animated: true,
    zIndex: 5, // Keep edges on top
    // These settings help with alignment of the connection lines
    type: 'smoothstep', // Use smoothstep for better visual connections
    pathOptions: {
      offset: 8, // Offset to align better with the center of connection points
      borderRadius: 8,
    },
  }), [isTouchDevice]);

  // Component drawer content for mobile
  const ComponentDrawerContent = () => (
    <Box sx={{ width: isMobile ? '100vw' : 300, p: 2, overflowY: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Components</Typography>
        <IconButton edge="end" onClick={toggleMobileDrawer(false)}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Typography variant="body2" color="text.secondary" paragraph>
        {isTouchDevice ? 
          'Tap a component to add it to the canvas. Tap and hold on components to connect them.' :
          'Drag and drop components to the canvas and connect them to create your IoT system.'}
      </Typography>
      
      {componentTypes.map((component) => (
        <Paper
          key={component.type}
          sx={{
            p: 2,
            mb: 2,
            cursor: 'pointer',
            '&:hover': { backgroundColor: 'action.hover' },
            display: 'flex',
            alignItems: 'center',
            borderRadius: 2,
            boxShadow: 2
          }}
          onDragStart={(event) => onDragStart(event, 'componentNode', component.type)}
          onDragEnd={onDragEnd}
          onClick={isTouchDevice ? () => {
            // For touch devices, clicking adds the component to the center of the visible area
            if (reactFlowInstance) {
              const position = reactFlowInstance.project({
                x: reactFlowWrapper.current.clientWidth / 2,
                y: reactFlowWrapper.current.clientHeight / 2,
              });
              const newNode = {
                id: `${component.type}-${Date.now()}`,
                type: 'componentNode',
                position,
                data: {
                  type: component.type,
                  label: component.label,
                  icon: component.icon,
                  description: component.description
                },
              };
              setNodes((nds) => {
                const updatedNodes = nds.concat(newNode);
                
                // Validate immediately after adding the node
                setTimeout(() => {
                  console.log('Validating after mobile node add');
                  validateSystem();
                }, 10);
                
                return updatedNodes;
              });
              setMobileDrawerOpen(false);
            }
          } : undefined}
          draggable={!isTouchDevice}
        >
          {component.icon && (
            <Box sx={{ mr: 2, color: 'primary.main', fontSize: 30 }}>
              {component.icon ? React.isValidElement(component.icon) ? 
                React.cloneElement(component.icon, { fontSize: "inherit" }) : null : null}
            </Box>
          )}
          <Box>
            <Typography variant="subtitle1" fontWeight="medium">{component.label}</Typography>
            <Typography variant="body2" color="text.secondary">
              {component.description}
            </Typography>
          </Box>
        </Paper>
      ))}
    </Box>
  );

  // CSS animation for connection lines - globally defined
  React.useEffect(() => {
    // Create and inject a style element for the flowDash animation
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      @keyframes flowDash {
        to {
          stroke-dashoffset: -10;
        }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
      }
      
      @keyframes flashProgress {
        0% { filter: brightness(1); }
        30% { filter: brightness(1.5); }
        100% { filter: brightness(1); }
      }
      
      .progress-updated {
        animation: flashProgress 1s ease-out;
      }
      
      .react-flow__edge-path {
        transition: stroke 0.3s, stroke-width 0.3s;
      }
      
      /* Edge hover effect to indicate it can be double-clicked */
      .react-flow__edge:hover .react-flow__edge-path {
        stroke-width: 6px !important;
        cursor: pointer;
        filter: drop-shadow(0 0 2px rgba(33, 150, 243, 0.5));
      }
      
      .react-flow__handle {
        transition: all 0.2s ease;
        cursor: crosshair !important;
      }
      
      .react-flow__handle:hover {
        transform: scale(1.5);
        box-shadow: 0 0 8px 2px rgba(25, 118, 210, 0.7);
      }
      
      /* Fix cursor offset for connection interactions */
      .react-flow__pane {
        cursor: default;
      }
      
      .react-flow__edge.connecting {
        pointer-events: none;
      }
      
      .react-flow__connection-line path {
        stroke-dasharray: 5, 5;
        animation: flowDash 0.5s linear infinite;
        stroke-linecap: round;
      }
      
      /* Make selected nodes more visible */
      .react-flow__node.selected {
        box-shadow: 0 0 0 2px #ff9800 !important;
      }
      
      /* Improve connection experience */
      .react-flow__handle.connecting {
        animation: bounce 0.8s infinite;
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header bar */}
      <Box sx={{
        p: isMobile ? 1 : 2,
        borderBottom: 1, 
        borderColor: 'divider',
        backgroundColor: 'primary.main', 
        color: 'white'
      }}>
        <Grid container alignItems="center" spacing={1}>
          <Grid item>
            <Button 
              onClick={handleBack}
              variant="contained" 
              color="inherit" 
              startIcon={<ArrowBackIcon />}
              size={isMobile ? "small" : "medium"}
              sx={{ color: 'primary.main' }}
            >
              {isMobile ? '' : 'Back'}
            </Button>
          </Grid>
          <Grid item sx={{ flex: 1 }}>
            <Typography 
              variant={isMobile ? "subtitle1" : "h6"} 
              noWrap 
              sx={{ ml: isMobile ? 1 : 2 }}
            >
              {systemName}
            </Typography>
          </Grid>
          {isMobile && (
            <Grid item>
              <Tooltip title="Show Components">
                <IconButton 
                  color="inherit" 
                  onClick={toggleMobileDrawer(true)}
                  edge="end"
                  size="large"
                  sx={{ mr: 0.5 }}
                >
                  <PaletteIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          )}
          <Grid item>
            {isSystemValid ? (
              <Fade in={isSystemValid}>
                <Box display="flex" alignItems="center" sx={{
                  bgcolor: 'success.main',
                  color: 'white',
                  px: isMobile ? 1 : 2,
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
                    <CheckCircleIcon sx={{ mr: isMobile ? 0.5 : 1 }} />
                  </Zoom>
                  {!isMobile && <Typography fontWeight="bold">System Configured!</Typography>}
                </Box>
              </Fade>
            ) : isTouchDevice && (
              <Tooltip title="Touch Help">
                <IconButton color="inherit" onClick={() => setTouchHelpOpen(true)}>
                  <TouchAppIcon />
                </IconButton>
              </Tooltip>
            )}
          </Grid>
        </Grid>
      </Box>
      
      {/* Progress Indicator */}
      <Box sx={{ 
        px: isMobile ? 1 : 2, 
        py: 1, 
        backgroundColor: '#f5f5f5', 
        borderBottom: 1, 
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant={isMobile ? "caption" : "subtitle2"} color="text.secondary">System Completion</Typography>
          <Typography 
            variant={isMobile ? "caption" : "subtitle2"} 
            fontWeight="bold" 
            color={connectionProgress === 100 ? 'success.main' : 'primary.main'}
            sx={{
              transition: 'all 0.3s ease',
              animation: 'pulse 0.8s ease-in-out',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)', opacity: 0.8 },
                '50%': { transform: 'scale(1.2)', opacity: 1 },
                '100%': { transform: 'scale(1)', opacity: 0.8 },
              },
            }}
          >
            {connectionProgress}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={connectionProgress} 
          sx={{ 
            height: isMobile ? 6 : 8, 
            borderRadius: 4,
            backgroundColor: 'grey.300',
            transition: 'all 0.5s ease',
            '& .MuiLinearProgress-bar': {
              backgroundColor: connectionProgress === 100 ? 'success.main' : 'primary.main',
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: 'progressGlow 2s infinite',
            },
            '@keyframes progressGlow': {
              '0%': { boxShadow: '0 0 3px rgba(33, 150, 243, 0.1)' },
              '50%': { boxShadow: '0 0 8px rgba(33, 150, 243, 0.6)' },
              '100%': { boxShadow: '0 0 3px rgba(33, 150, 243, 0.1)' },
            }
          }} 
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
          {connectionProgress < 50 ? 'Add all required components first' : 
           connectionProgress < 100 ? 'Connect the components correctly' : 
           'System completed!'}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexGrow: 1, position: 'relative' }}>
        {/* Desktop Component Palette */}
        {!isMobile && (
          <Box 
            sx={{ 
              width: isTablet ? 200 : 250, 
              p: 2, 
              borderRight: 1, 
              borderColor: 'divider',
              overflowY: 'auto',
              backgroundColor: '#f5f5f5',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            <Typography variant="h6" gutterBottom>Components</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Drag and drop components to the canvas and connect them to create your IoT system.
              Double-click on any connection line to remove it.
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
                      {React.isValidElement(component.icon) ? 
                        React.cloneElement(component.icon, { fontSize: "medium" }) : null}
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
        )}
        
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
            onEdgeDoubleClick={onEdgeDoubleClick}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            // Connection-friendly settings
            minZoom={0.2}
            maxZoom={4}
            fitView
            attributionPosition="bottom-left"
            // Touch-specific props
            elementsSelectable={true}
            nodesDraggable={true}
            nodesConnectable={true}
            zoomOnScroll={!isTouchDevice}
            zoomOnPinch={true}
            panOnScroll={!isTouchDevice}
            panOnDrag={!isMobile}
            selectNodesOnDrag={false}
            // Connection line options with improved alignment
            connectionLineType="smoothstep" // Use smoothstep for better visual connections
            connectionLineStyle={{
              stroke: '#2196f3', // Blue connection line
              strokeWidth: isTouchDevice ? 5 : 3, // Thicker for touch
              strokeOpacity: 0.8,
              strokeDasharray: '5,5', // Dashed connection line
            }}
            // Custom connection pointer settings to improve alignment
            connectionMode="loose" // More forgiving connection mode
            connectionRadius={isTouchDevice ? 40 : 25} // Larger connection radius
            // Make the connection process smoother
            snapToGrid={false} // Disable snap to grid for smoother connections
            deleteKeyCode={['Backspace', 'Delete']} // Allow both backspace and delete to remove edges
          >
            {/* Auto-save indicator */}
            <Box 
              id="auto-save-toast" 
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                backgroundColor: 'rgba(46, 125, 50, 0.9)',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '5px',
                fontSize: '12px',
                fontWeight: 'bold',
                opacity: 0,
                transition: 'opacity 0.5s ease',
                zIndex: 1000,
                boxShadow: 1,
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              <SaveIcon fontSize="small" sx={{ mr: 0.5, fontSize: '14px' }} /> Auto-saved
            </Box>
            
          {/* Save/Load Controls */}
            <Panel position="top-right" style={{ padding: 0, margin: 10 }}>
              <ButtonGroup 
                orientation={isMobile ? "horizontal" : "vertical"}
                size="small" 
                variant="contained" 
                sx={{ 
                  boxShadow: 2,
                  backgroundColor: 'background.paper',
                  borderRadius: 1,
                  opacity: 0.9,
                  '&:hover': {
                    opacity: 1,
                    boxShadow: 3,
                  },
                  '& .MuiButton-root': {
                    py: 1,
                    minWidth: isMobile ? '40px' : '50px',
                  }
                }}
              >
                <Tooltip title="Save current state" placement="left">
                  <Button 
                    onClick={saveSystemState} 
                    color="primary"
                    disabled={nodes.length === 0}
                    sx={{ borderRadius: isMobile ? '4px 0 0 4px' : '4px 4px 0 0' }}
                  >
                    <SaveIcon fontSize="small" />
                    {!isMobile && <Box component="span" sx={{ ml: 1 }}>Save</Box>}
                  </Button>
                </Tooltip>
                <Tooltip title="Restore saved state" placement="left">
                  <Button 
                    onClick={loadSystemState}
                    color="secondary"
                    disabled={!hasSavedState}
                    sx={{ borderRadius: 0 }}
                  >
                    <RestoreIcon fontSize="small" />
                    {!isMobile && <Box component="span" sx={{ ml: 1 }}>Load</Box>}
                  </Button>
                </Tooltip>
                <Tooltip title="Clear saved state" placement="left">
                  <Button 
                    onClick={clearSystemState}
                    color="error"
                    disabled={!hasSavedState}
                    sx={{ borderRadius: isMobile ? '0 4px 4px 0' : '0 0 4px 4px' }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                    {!isMobile && <Box component="span" sx={{ ml: 1 }}>Reset</Box>}
                  </Button>
                </Tooltip>
              </ButtonGroup>
              
              {/* Auto-save toggle */}
              <Box 
                sx={{ 
                  mt: 1, 
                  bgcolor: 'background.paper', 
                  p: 1, 
                  borderRadius: 1, 
                  boxShadow: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.9,
                  '&:hover': { opacity: 1 }
                }}
              >
                <FormControlLabel
                  control={
                    <Switch 
                      size="small" 
                      checked={autoSaveEnabled} 
                      onChange={handleAutoSaveToggle}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="caption" sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
                      Auto-save
                    </Typography>
                  }
                  sx={{ m: 0 }}
                />
              </Box>
              
              {/* Last saved timestamp */}
              {lastSavedTime && (
                <Box sx={{
                  mt: 1,
                  textAlign: 'center',
                  fontSize: '0.7rem',
                  color: 'text.secondary',
                  bgcolor: 'background.paper',
                  p: 0.5,
                  borderRadius: 1,
                  boxShadow: 1,
                  opacity: 0.7,
                  '&:hover': { opacity: 0.9 }
                }}>
                  <Typography variant="caption" sx={{ display: 'block', fontSize: '0.65rem' }}>
                    Last saved:
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                    {lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              )}
            </Panel>
            
            <Controls 
              showInteractive={!isMobile}
              position={isMobile ? "bottom-right" : "bottom-left"}
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'row' : 'column',
                gap: '5px',
                padding: isMobile ? '5px' : '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '8px',
                margin: isMobile ? '5px' : '10px',
              }}
            />
            
            {/* Show Connection Tips button */}
            {isTouchDevice && !connectionTipsVisible && (
              <Panel position="bottom-right">
                <Tooltip title="Show connection tips" placement="left">
                  <IconButton 
                    size="small" 
                    color="primary" 
                    onClick={() => {
                      setConnectionTipsVisible(true);
                      localStorage.setItem('connection_tips_visible', 'true');
                    }}
                    sx={{ 
                      bgcolor: 'white',
                      boxShadow: 1,
                      '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.1)' }
                    }}
                  >
                    <TouchAppIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Panel>
            )}
            {!isMobile && <MiniMap zoomable pannable />}
            <Background
              variant="dots" 
              gap={isMobile ? 15 : 12} 
              size={isMobile ? 0.8 : 1} 
              color="#aaaaaa"
            />
            
            {/* Connection Help Panel for touch devices */}
            {isTouchDevice && connectionTipsVisible && (
              <Panel position="top-center">
                <Card 
                  sx={{ 
                    mt: 1,
                    mb: 1, 
                    maxWidth: '90%',
                    opacity: 0.9,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      opacity: 1,
                      transform: 'translateY(5px)'
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      p: 1, 
                      bgcolor: 'primary.main', 
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TouchAppIcon sx={{ mr: 1, fontSize: '1rem' }} />
                      <Typography variant="caption" fontWeight="medium">
                        Connection Tips
                      </Typography>
                    </Box>
                    <IconButton 
                      size="small" 
                      sx={{ color: 'white', p: 0.2, ml: 1 }}
                      onClick={() => {
                        setConnectionTipsVisible(false);
                        localStorage.setItem('connection_tips_visible', 'false');
                      }}
                      aria-label="close connection tips"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box sx={{ p: 1 }}>
                    <Typography variant="caption" display="block">
                      • Tap on the <b>large blue dots</b> to start a connection
                    </Typography>
                    <Typography variant="caption" display="block">
                      • Drag to another component's connection point
                    </Typography>
                    <Typography variant="caption" display="block">
                      • <b>Double-tap</b> on any line to remove a connection
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ color: 'success.main', fontWeight: 'medium' }}>
                      • Green connections are valid, red are invalid
                    </Typography>
                  </Box>
                </Card>
              </Panel>
            )}
            
            <Panel position="bottom-center">
              <Card 
                sx={{ 
                  mb: 2,
                  width: isMobile ? '95%' : '100%',
                  maxWidth: isMobile ? 'none' : '1200px', 
                  opacity: 0.95,
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              >
                <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                  <Typography 
                    variant={isMobile ? "subtitle1" : "h6"} 
                    gutterBottom
                    onDoubleClick={() => setDescriptionVisible(!descriptionVisible)}
                    sx={{ cursor: 'pointer' }}
                  >
                    {systemName} {!descriptionVisible && 
                      <Typography 
                        component="span" 
                        variant="caption" 
                        color="primary.main"
                        sx={{ ml: 1, fontStyle: 'italic' }}
                      >
                        (double-click to show details)
                      </Typography>
                    }
                  </Typography>
                  {descriptionVisible && (
                    <Box 
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setDescriptionVisible(false);
                      }}
                      sx={{ 
                        cursor: 'pointer',
                        position: 'relative',
                        '&:hover::after': {
                          content: '"Double-click to hide"',
                          position: 'absolute',
                          right: 0,
                          bottom: -16,
                          fontSize: '10px',
                          color: 'primary.main',
                          fontStyle: 'italic',
                        }
                      }}
                    >
                      <Typography 
                        variant={isMobile ? "body2" : "body1"} 
                        sx={{ 
                          fontSize: isMobile ? '0.85rem' : '1rem',
                          lineHeight: 1.6,
                          textAlign: 'justify',
                          maxWidth: '100%',
                          mx: 'auto',
                          px: { xs: 1, sm: 3, md: 4 },
                          py: 1
                        }}
                      >
                        {systemDescription}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Panel>
          </ReactFlow>
        </Box>

        {/* Mobile Component Drawer */}
        <SwipeableDrawer
          anchor="left"
          open={mobileDrawerOpen}
          onClose={toggleMobileDrawer(false)}
          onOpen={toggleMobileDrawer(true)}
          disableBackdropTransition={!isMobile}
          disableDiscovery={isMobile}
          sx={{ 
            '& .MuiDrawer-paper': {
              width: isMobile ? '100%' : 300,
              boxSizing: 'border-box',
            },
          }}
        >
          <ComponentDrawerContent />
        </SwipeableDrawer>

        {/* Touch Help Dialog */}
        <Dialog
          open={touchHelpOpen}
          onClose={handleTouchHelpClose}
          aria-labelledby="touch-help-title"
          maxWidth="sm"
          fullWidth={true}
        >
          <DialogTitle id="touch-help-title" sx={{ bgcolor: 'primary.main', color: 'white' }}>
            Touch Device Instructions
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <TouchAppIcon sx={{ fontSize: 50, color: 'primary.main', mb: 1 }} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  How to use on touch devices:
                </Typography>
                <Typography variant="body1" paragraph>
                  1. Tap the palette icon <PaletteIcon fontSize="small" sx={{ verticalAlign: 'text-bottom' }} /> to show components
                </Typography>
                <Typography variant="body1" paragraph>
                  2. Tap a component to add it to the canvas
                </Typography>
                <Typography variant="body1" paragraph>
                  3. Drag components to position them on the canvas
                </Typography>
                <Typography variant="body1" paragraph>
                  4. To connect components:
                </Typography>
                <Typography variant="body1" paragraph sx={{ pl: 3 }}>
                  • Tap on a component to select it
                </Typography>
                <Typography variant="body1" paragraph sx={{ pl: 3 }}>
                  • Drag from its connection point to another component
                </Typography>
                <Typography variant="body1" paragraph>
                  5. To remove a connection, double-tap on the connection line
                </Typography>
                <Typography variant="body1">
                  6. Use two fingers to pinch and zoom the canvas
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleTouchHelpClose} variant="contained" color="primary">
              Got it
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      
      {/* Alerts & Notifications */}
      <Snackbar 
        open={alertOpen} 
        autoHideDuration={alertSeverity === 'success' ? 10000 : 6000} 
        onClose={handleAlertClose}
        anchorOrigin={{ 
          vertical: isMobile ? 'bottom' : 'top', 
          horizontal: 'center' 
        }}
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
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 3 : 4,
            width: isMobile ? '95%' : 'auto',
            m: isMobile ? 1 : 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle 
          id="congrats-dialog-title" 
          sx={{ 
            textAlign: 'center', 
            bgcolor: 'success.main', 
            color: 'white',
            p: isMobile ? 2 : 3,
            fontSize: isMobile ? '1.5rem' : '1.75rem',
            fontWeight: 'bold'
          }}
        >
          Congratulations! 🎉
        </DialogTitle>
        <DialogContent sx={{ pt: isMobile ? 3 : 4, px: isMobile ? 2 : 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            maxWidth: '100%' 
          }}>
            <Box sx={{ 
              position: 'relative',
              animation: 'successPulse 1.8s infinite',
              '@keyframes successPulse': {
                '0%': { transform: 'scale(1)', opacity: 0.9 },
                '50%': { transform: 'scale(1.15)', opacity: 1 },
                '100%': { transform: 'scale(1)', opacity: 0.9 },
              },
              display: 'flex',
              justifyContent: 'center'
            }}>
              <CheckCircleIcon 
                color="success" 
                sx={{ 
                  fontSize: isMobile ? 80 : 120, 
                  mb: 2,
                  filter: 'drop-shadow(0px 4px 8px rgba(76, 175, 80, 0.5))'
                }} 
              />
            </Box>
            
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              color="success.main" 
              fontWeight="bold" 
              sx={{ mb: 2, textAlign: 'center' }}
            >
              Great Job!
            </Typography>
            
            <DialogContentText 
              sx={{ 
                textAlign: 'center', 
                mb: 3, 
                fontSize: isMobile ? '1rem' : '1.1rem',
                px: isMobile ? 1 : 2 
              }}
            >
              You've successfully configured the {systemName}!
            </DialogContentText>
            
            <Box sx={{ 
              bgcolor: 'success.light', 
              p: isMobile ? 1.5 : 2.5, 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'success.main',
              mb: 2,
              width: '100%',
              maxWidth: '100%'
            }}>
              <DialogContentText 
                sx={{ 
                  textAlign: 'center', 
                  color: 'success.dark',
                  fontSize: isMobile ? '0.875rem' : '1rem',
                }}
              >
                Your progress has been saved. Return to the home screen to see your updated progress 
                {!isMobile && ' or try another challenge'}.
              </DialogContentText>
            </Box>
            
            {/* Confetti animation effect */}
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              pointerEvents: 'none',
              opacity: 0.7,
              height: '100%',
              overflow: 'hidden',
              zIndex: 0
            }}>
              <Box sx={{
                position: 'absolute',
                top: '-5%',
                left: '10%',
                animation: 'confetti1 4s ease-in-out infinite',
                '@keyframes confetti1': {
                  '0%': { transform: 'translateY(0) rotate(0)' },
                  '100%': { transform: 'translateY(650px) rotate(360deg)' },
                },
                fontSize: '1.5rem'
              }}>🌟</Box>
              <Box sx={{
                position: 'absolute',
                top: '-5%',
                left: '30%',
                animation: 'confetti2 5s ease-in-out infinite',
                '@keyframes confetti2': {
                  '0%': { transform: 'translateY(0) rotate(0)' },
                  '100%': { transform: 'translateY(650px) rotate(-180deg)' },
                },
                fontSize: '1.2rem'
              }}>✨</Box>
              <Box sx={{
                position: 'absolute',
                top: '-10%',
                left: '70%',
                animation: 'confetti3 6s ease-in-out infinite',
                '@keyframes confetti3': {
                  '0%': { transform: 'translateY(0) rotate(0)' },
                  '100%': { transform: 'translateY(650px) rotate(720deg)' },
                },
                fontSize: '1.8rem'
              }}>🎉</Box>
              <Box sx={{
                position: 'absolute',
                top: '-15%',
                left: '85%',
                animation: 'confetti4 7s ease-in-out infinite',
                '@keyframes confetti4': {
                  '0%': { transform: 'translateY(0) rotate(0)' },
                  '100%': { transform: 'translateY(650px) rotate(-360deg)' },
                },
                fontSize: '1.4rem'
              }}>✨</Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 2 }}>
          <Button 
            onClick={handleCongratsClose} 
            variant="contained" 
            color="success"
            size={isMobile ? "large" : "large"}
            fullWidth={isMobile}
            sx={{ 
              py: isMobile ? 1.5 : 1.2,
              borderRadius: 3,
              fontWeight: 'bold',
              fontSize: isMobile ? '1rem' : '1.1rem',
            }}
            disableElevation
          >
            Back to Home
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IoTFlowEditor;
