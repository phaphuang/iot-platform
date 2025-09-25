import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, Typography, Box, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

const ComponentNode = ({ data, isConnectable }) => {
  const [infoOpen, setInfoOpen] = useState(false);

  const handleInfoOpen = () => {
    setInfoOpen(true);
  };

  const handleInfoClose = () => {
    setInfoOpen(false);
  };

  return (
    <>
      <Card 
        sx={{ 
          minWidth: 150, 
          maxWidth: 200, 
          border: 1,
          borderColor: 'primary.main',
          borderRadius: 2,
        }}
      >
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
          style={{ background: '#1976d2' }}
        />
        
        <Box 
          sx={{ 
            p: 1, 
            backgroundColor: 'primary.main', 
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant="subtitle2">{data.label}</Typography>
          <Tooltip title="Component Info">
            <IconButton 
              size="small" 
              sx={{ color: 'white' }} 
              onClick={handleInfoOpen}
            >
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        <CardContent sx={{ p: 1, textAlign: 'center' }}>
          {data.icon && (
            <Box sx={{ fontSize: 40, color: 'primary.main', mb: 1 }}>
              {data.icon}
            </Box>
          )}
          <Typography variant="caption" color="text.secondary">
            {data.type}
          </Typography>
        </CardContent>
        
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          style={{ background: '#1976d2' }}
        />
      </Card>

      <Dialog
        open={infoOpen}
        onClose={handleInfoClose}
        aria-labelledby="component-info-dialog-title"
      >
        <DialogTitle id="component-info-dialog-title">
          {data.label}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {data.icon && (
              <Box sx={{ fontSize: 40, color: 'primary.main', mr: 2 }}>
                {data.icon}
              </Box>
            )}
            <Box>
              <Typography variant="subtitle1">{data.label}</Typography>
              <Typography variant="caption" color="text.secondary">
                Type: {data.type}
              </Typography>
            </Box>
          </Box>
          <DialogContentText>
            {data.description}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleInfoClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ComponentNode;
