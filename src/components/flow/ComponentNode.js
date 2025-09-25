import React, { useState, useEffect } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Card, CardContent, Typography, Box, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, useMediaQuery, useTheme } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import TouchRipple from '@mui/material/ButtonBase/TouchRipple';

const ComponentNode = ({ data, isConnectable, selected }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const rippleRef = React.useRef(null);
  const [infoOpen, setInfoOpen] = useState(false);

  const handleInfoOpen = () => {
    setInfoOpen(true);
  };

  const handleInfoClose = () => {
    setInfoOpen(false);
  };

  // Create ripple effect on mobile touch
  const onTouchStart = () => {
    if (rippleRef.current && isTouchDevice) {
      rippleRef.current.start({ clientX: 0, clientY: 0 });
      setTimeout(() => rippleRef.current && rippleRef.current.stop({}), 300);
    }
  };

  return (
    <>
      <Card 
        sx={{ 
          width: isMobile ? 120 : 180,
          border: selected ? 2 : 1,
          borderColor: selected ? 'secondary.main' : 'primary.main',
          borderRadius: 2,
          boxShadow: selected ? 4 : 2,
          transform: selected ? 'scale(1.05)' : 'scale(1)',
          transition: 'all 0.2s ease',
          position: 'relative',
          touchAction: 'none', // Improves touch handling
        }}
        onTouchStart={onTouchStart}
      >
        {/* Single visible handle for targets with precise positioning */}
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
          style={{
            background: selected ? '#ff9800' : '#1976d2',
            width: isMobile ? 20 : 16,
            height: isMobile ? 20 : 16,
            top: -10,
            border: '3px solid white',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
            zIndex: 2,
            cursor: 'crosshair',
            animation: selected ? 'pulseConnection 2s infinite' : 'none',
            '@keyframes pulseConnection': {
              '0%': { boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.7)' },
              '70%': { boxShadow: '0 0 0 10px rgba(25, 118, 210, 0)' },
              '100%': { boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)' },
            },
            // Make the connection area larger but keep it centered correctly
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: isMobile || isTouchDevice ? 40 : 30,
              height: isMobile || isTouchDevice ? 40 : 30,
              backgroundColor: 'transparent',
              borderRadius: '50%',
            }
          }}
        />
        
        {/* Connection indicator */}
        <Box 
          sx={{
            position: 'absolute',
            top: -35,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'background.paper',
            color: 'primary.main',
            fontSize: isMobile ? '0.6rem' : '0.7rem',
            fontWeight: 'bold',
            padding: '2px 8px',
            borderRadius: 10,
            opacity: selected ? 1 : 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
            boxShadow: 1,
            border: '1px solid',
            borderColor: 'primary.main',
          }}
        >
          Connect
        </Box>
        
        <Box 
          sx={{ 
            p: isMobile ? 0.8 : 1, 
            backgroundColor: selected ? 'secondary.main' : 'primary.main',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTopLeftRadius: 6,
            borderTopRightRadius: 6,
          }}
        >
          <Typography 
            variant={isMobile ? "caption" : "subtitle2"}
            sx={{ 
              fontWeight: 'medium', 
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: isMobile ? 70 : 120
            }}
          >
            {data.label}
          </Typography>
          <Tooltip title="Component Info">
            <IconButton 
              size="small" 
              sx={{ color: 'white', p: isMobile ? 0.3 : 0.5 }} 
              onClick={handleInfoOpen}
            >
              <InfoIcon fontSize={isMobile ? "small" : "medium"} />
            </IconButton>
          </Tooltip>
        </Box>
        
        <CardContent sx={{ 
          p: isMobile ? 0.8 : 1.5, 
          textAlign: 'center',
          '&:last-child': { pb: isMobile ? 1 : 2 }
        }}>
          {data.icon && (
            <Box sx={{ 
              fontSize: isMobile ? 30 : 40, 
              color: selected ? 'secondary.main' : 'primary.main', 
              mb: isMobile ? 0.5 : 1,
              animation: selected ? 'pulse 1.5s infinite' : 'none',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.1)' },
                '100%': { transform: 'scale(1)' },
              },
            }}>
              {data.icon}
            </Box>
          )}
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ display: 'block', fontSize: isMobile ? '0.65rem' : '0.75rem' }}
          >
            {data.type.replace('_', ' ')}
          </Typography>
        </CardContent>
        
        {/* Single visible handle for sources with precise positioning */}
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          style={{
            background: selected ? '#ff9800' : '#1976d2',
            width: isMobile ? 20 : 16, 
            height: isMobile ? 20 : 16,
            bottom: -10,
            border: '3px solid white',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
            zIndex: 2,
            cursor: 'crosshair',
            animation: selected ? 'pulseConnection 2s infinite' : 'none',
            // Make the connection area larger but keep it centered correctly
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: isMobile || isTouchDevice ? 40 : 30,
              height: isMobile || isTouchDevice ? 40 : 30,
              backgroundColor: 'transparent',
              borderRadius: '50%',
            }
          }}
        />
        
        {/* Connection indicator */}
        <Box 
          sx={{
            position: 'absolute',
            bottom: -35,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'background.paper',
            color: 'primary.main',
            fontSize: isMobile ? '0.6rem' : '0.7rem',
            fontWeight: 'bold',
            padding: '2px 8px',
            borderRadius: 10,
            opacity: selected ? 1 : 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
            boxShadow: 1,
            border: '1px solid',
            borderColor: 'primary.main',
          }}
        >
          Connect
        </Box>
        
        {/* Touch ripple effect */}
        {isTouchDevice && <TouchRipple ref={rippleRef} center />}
      </Card>

      <Dialog
        open={infoOpen}
        onClose={handleInfoClose}
        aria-labelledby="component-info-dialog-title"
        maxWidth="xs"
        fullWidth={isMobile}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 10,
            width: isMobile ? '95%' : 'auto',
          }
        }}
      >
        <DialogTitle 
          id="component-info-dialog-title"
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            pb: 1,
          }}
        >
          {data.label}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'center' : 'flex-start',
            mb: 2,
          }}>
            {data.icon && (
              <Box sx={{ 
                fontSize: 50, 
                color: 'primary.main', 
                mr: isMobile ? 0 : 2, 
                mb: isMobile ? 1.5 : 0,
                display: 'flex',
                justifyContent: 'center'
              }}>
                {data.icon}
              </Box>
            )}
            <Box sx={{ textAlign: isMobile ? 'center' : 'left' }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>{data.label}</Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  display: 'inline-block',
                  bgcolor: 'action.hover', 
                  px: 1.5, 
                  py: 0.5, 
                  borderRadius: 1,
                  fontWeight: 500,
                }}
              >
                Type: {data.type.replace('_', ' ')}
              </Typography>
            </Box>
          </Box>
          <DialogContentText sx={{ 
            p: 2, 
            bgcolor: 'background.paper', 
            border: '1px solid', 
            borderColor: 'divider',
            borderRadius: 1,
            mt: 1,
            fontSize: isMobile ? '0.875rem' : '1rem',
          }}>
            {data.description}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button 
            onClick={handleInfoClose}
            variant="contained"
            color="primary"
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ComponentNode;
