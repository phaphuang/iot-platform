import React, { useState, useEffect } from 'react';
import IoTFlowEditor from '../components/flow/IoTFlowEditor';
import { getComponentsForSystem, validationRules } from '../components/iot-components/ComponentLibrary';
import { Box, Typography } from '@mui/material';

const SmartHealthcare = () => {
  const [components, setComponents] = useState([]);
  const [rules, setRules] = useState({});
  
  useEffect(() => {
    // Get components and validation rules for smart healthcare
    setComponents(getComponentsForSystem('healthcare'));
    setRules(validationRules.healthcare);
  }, []);
  
  const systemDescription = "Design a patient monitoring system that collects vital signs data using wearable devices. Connect heart rate and blood pressure monitors to a patient wearable, sends data from device to gateway via bluetooth protocol, transmits data to cloud server via MQTT protocol. A dashboard displays patient health information and can control the medication dispenser when needed.";

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {components.length > 0 && rules.requiredComponents && (
        <IoTFlowEditor
          systemName="Smart Healthcare System"
          systemId="healthcare"
          systemDescription={systemDescription}
          componentTypes={components}
          validationRules={rules}
        />
      )}
    </Box>
  );
};

export default SmartHealthcare;
