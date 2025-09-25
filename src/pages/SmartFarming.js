import React, { useState, useEffect } from 'react';
import IoTFlowEditor from '../components/flow/IoTFlowEditor';
import { getComponentsForSystem, validationRules } from '../components/iot-components/ComponentLibrary';
import { Box, Typography } from '@mui/material';

const SmartFarming = () => {
  const [components, setComponents] = useState([]);
  const [rules, setRules] = useState({});
  
  useEffect(() => {
    // Get components and validation rules for smart farming
    setComponents(getComponentsForSystem('farming'));
    setRules(validationRules.farming);
  }, []);
  
  const systemDescription = "Create a smart farming system that monitors soil moisture, temperature, and controls irrigation automatically based on sensor data. Connect the sensors to the microcontroller, using WiFi protocol to use data to IoT Gateway, then through a gateway to the cloud serve via MQTT protocol, and finally to a dashboard that can control the irrigation system.";

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {components.length > 0 && rules.requiredComponents && (
        <IoTFlowEditor
          systemName="Smart Farming System"
          systemId="farming"
          systemDescription={systemDescription}
          componentTypes={components}
          validationRules={rules}
        />
      )}
    </Box>
  );
};

export default SmartFarming;
