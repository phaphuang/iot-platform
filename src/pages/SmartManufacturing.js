import React, { useState, useEffect } from 'react';
import IoTFlowEditor from '../components/flow/IoTFlowEditor';
import { getComponentsForSystem, validationRules } from '../components/iot-components/ComponentLibrary';
import { Box, Typography } from '@mui/material';

const SmartManufacturing = () => {
  const [components, setComponents] = useState([]);
  const [rules, setRules] = useState({});
  
  useEffect(() => {
    // Get components and validation rules for smart manufacturing
    setComponents(getComponentsForSystem('manufacturing'));
    setRules(validationRules.manufacturing);
  }, []);
  
  const systemDescription = "Create a smart manufacturing system that monitors production lines using machine sensors, quality control cameras, and inventory tracker. Connect these sensors through a microcontroller via LoRaWan protocol and gateway to a cloud server using MQTT protocol. The dashboard displays real-time production data and can control robotic arms to optimize the manufacturing process.";

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {components.length > 0 && rules.requiredComponents && (
        <IoTFlowEditor
          systemName="Smart Manufacturing System"
          systemDescription={systemDescription}
          componentTypes={components}
          validationRules={rules}
        />
      )}
    </Box>
  );
};

export default SmartManufacturing;
