import React from 'react';
import SensorsIcon from '@mui/icons-material/Sensors';
import RouterIcon from '@mui/icons-material/Router';
import StorageIcon from '@mui/icons-material/Storage';
import MemoryIcon from '@mui/icons-material/Memory';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DevicesIcon from '@mui/icons-material/Devices';
import WifiIcon from '@mui/icons-material/Wifi';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import SignalCellular4BarIcon from '@mui/icons-material/SignalCellular4Bar';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import SettingsRemoteIcon from '@mui/icons-material/SettingsRemote';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import LightModeIcon from '@mui/icons-material/LightMode';
import Co2Icon from '@mui/icons-material/Co2';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import MedicationIcon from '@mui/icons-material/Medication';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import FactoryIcon from '@mui/icons-material/Factory';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import InventoryIcon from '@mui/icons-material/Inventory';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

// Common IoT Components
export const commonComponents = [
  {
    type: 'microcontroller',
    label: 'Microcontroller',
    icon: <MemoryIcon />,
    description: 'Processing unit that controls the IoT device'
  },
  {
    type: 'gateway',
    label: 'IoT Gateway',
    icon: <RouterIcon />,
    description: 'Connects IoT devices to the cloud or local network'
  },
  {
    type: 'cloud_server',
    label: 'Cloud Server',
    icon: <CloudQueueIcon />,
    description: 'Remote server for data processing and storage'
  },
  {
    type: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
    description: 'User interface for monitoring and control'
  }
];

// Communication Protocols
export const protocolComponents = [
  {
    type: 'wifi',
    label: 'WiFi',
    icon: <WifiIcon />,
    description: 'Wireless communication protocol'
  },
  {
    type: 'bluetooth',
    label: 'Bluetooth',
    icon: <BluetoothIcon />,
    description: 'Short-range wireless communication protocol'
  },
  {
    type: 'lorawan',
    label: 'LoRaWAN',
    icon: <SignalCellular4BarIcon />,
    description: 'Long Range Wide Area Network protocol'
  },
  {
    type: 'mqtt',
    label: 'MQTT Protocol',
    icon: <DevicesIcon />,
    description: 'Lightweight messaging protocol for IoT'
  }
];

// Smart Farming Components
export const farmingComponents = [
  {
    type: 'soil_sensor',
    label: 'Soil Moisture Sensor',
    icon: <WaterDropIcon />,
    description: 'Measures soil moisture content'
  },
  {
    type: 'temp_sensor',
    label: 'Temperature Sensor',
    icon: <DeviceThermostatIcon />,
    description: 'Measures ambient temperature'
  },
  {
    type: 'light_sensor',
    label: 'Light Sensor',
    icon: <LightModeIcon />,
    description: 'Measures light intensity'
  },
  {
    type: 'irrigation_system',
    label: 'Irrigation System',
    icon: <SettingsRemoteIcon />,
    description: 'Controls water flow to crops'
  }
];

// Smart Healthcare Components
export const healthcareComponents = [
  {
    type: 'heart_rate_monitor',
    label: 'Heart Rate Monitor',
    icon: <MonitorHeartIcon />,
    description: 'Monitors patient heart rate'
  },
  {
    type: 'blood_pressure_monitor',
    label: 'Blood Pressure Monitor',
    icon: <BloodtypeIcon />,
    description: 'Measures patient blood pressure'
  },
  {
    type: 'temperature_sensor',
    label: 'Body Temperature Sensor',
    icon: <DeviceThermostatIcon />,
    description: 'Measures patient body temperature'
  },
  {
    type: 'medication_dispenser',
    label: 'Medication Dispenser',
    icon: <MedicationIcon />,
    description: 'Automated medicine dispensing system'
  },
  {
    type: 'patient_wearable',
    label: 'Patient Wearable',
    icon: <MonitorWeightIcon />,
    description: 'Wearable health monitoring device'
  }
];

// Smart Manufacturing Components
export const manufacturingComponents = [
  {
    type: 'machine_sensor',
    label: 'Machine Sensor',
    icon: <SensorsIcon />,
    description: 'Monitors machine parameters and status'
  },
  {
    type: 'robotic_arm',
    label: 'Robotic Arm',
    icon: <PrecisionManufacturingIcon />,
    description: 'Automated manufacturing component'
  },
  {
    type: 'inventory_tracker',
    label: 'Inventory Tracker',
    icon: <InventoryIcon />,
    description: 'Tracks manufacturing inventory'
  },
  {
    type: 'quality_camera',
    label: 'Quality Control Camera',
    icon: <CameraAltIcon />,
    description: 'Visual inspection system'
  },
  {
    type: 'production_line',
    label: 'Production Line',
    icon: <FactoryIcon />,
    description: 'Main manufacturing production line'
  }
];

// Get all components for a specific system
export const getComponentsForSystem = (system) => {
  let components = [...commonComponents, ...protocolComponents];
  
  switch (system) {
    case 'farming':
      return [...components, ...farmingComponents];
    case 'healthcare':
      return [...components, ...healthcareComponents];
    case 'manufacturing':
      return [...components, ...manufacturingComponents];
    default:
      return components;
  }
};

// Validation rules for each system
export const validationRules = {
  farming: {
    requiredComponents: [
      'soil_sensor', 
      'temp_sensor', 
      'microcontroller',
      'wifi',
      'gateway',
      'mqtt',
      'cloud_server',
      'dashboard', 
      'irrigation_system'
    ],
    requiredConnections: [
      { source: 'soil_sensor', target: 'microcontroller' },
      { source: 'temp_sensor', target: 'microcontroller' },
      { source: 'microcontroller', targets: ['wifi', 'lorawan', 'bluetooth'] },
      { source: 'wifi', target: 'gateway' },
      { source: 'gateway', target: 'mqtt' },
      { source: 'mqtt', target: 'cloud_server' },
      { source: 'cloud_server', target: 'dashboard' },
      { source: 'dashboard', target: 'irrigation_system' },
    ],
    connections: [
      { source: 'soil_sensor', targets: ['microcontroller'] },
      { source: 'temp_sensor', targets: ['microcontroller'] },
      { source: 'light_sensor', targets: ['microcontroller'] },
      { source: 'microcontroller', targets: ['wifi', 'lorawan', 'bluetooth'] },
      { source: 'wifi', targets: ['gateway'] },
      { source: 'bluetooth', targets: ['gateway'] },
      { source: 'lorawan', targets: ['gateway'] },
      { source: 'mqtt', targets: ['cloud_server'] },
      { source: 'gateway', targets: ['mqtt'] },
      { source: 'cloud_server', targets: ['dashboard'] },
      { source: 'dashboard', targets: ['irrigation_system'] }
    ]
  },
  healthcare: {
    requiredComponents: [
      'heart_rate_monitor', 
      'blood_pressure_monitor', 
      'patient_wearable',
      'bluetooth',
      'gateway',
      'mqtt',
      'cloud_server', 
      'dashboard',
      'medication_dispenser'
    ],
    requiredConnections: [
      { source: 'heart_rate_monitor', target: 'patient_wearable' },
      { source: 'blood_pressure_monitor', target: 'patient_wearable' },
      { source: 'patient_wearable', target: 'bluetooth' },
      { source: 'bluetooth', target: 'gateway' },
      { source: 'gateway', target: 'mqtt' },
      { source: 'mqtt', target: 'cloud_server' },
      { source: 'cloud_server', target: 'dashboard' },
      { source: 'dashboard', target: 'medication_dispenser' }
    ],
    connections: [
      { source: 'heart_rate_monitor', targets: ['patient_wearable'] },
      { source: 'blood_pressure_monitor', targets: ['patient_wearable'] },
      { source: 'temperature_sensor', targets: ['patient_wearable'] },
      { source: 'patient_wearable', targets: ['bluetooth', 'wifi', 'lorawan'] },
      { source: 'bluetooth', targets: ['gateway'] },
      { source: 'gateway', targets: ['mqtt'] },
      { source: 'mqtt', targets: ['cloud_server'] },
      { source: 'cloud_server', targets: ['dashboard'] },
      { source: 'dashboard', targets: ['medication_dispenser'] }
    ]
  },
  manufacturing: {
    requiredComponents: [
      'machine_sensor',
      'inventory_tracker', 
      'quality_camera', 
      'lorawan',
      'microcontroller', 
      'gateway', 
      'mqtt',
      'cloud_server', 
      'dashboard',
      'robotic_arm',
      'production_line',
    ],
    requiredConnections: [
      { source: 'machine_sensor', target: 'microcontroller' },
      { source: 'quality_camera', target: 'microcontroller' },
      { source: 'inventory_tracker', target: 'microcontroller' },
      { source: 'microcontroller', target: 'lorawan' },
      { source: 'gateway', target: 'mqtt' },
      { source: 'mqtt', target: 'cloud_server' },
      { source: 'cloud_server', target: 'dashboard' },
      { source: 'dashboard', target: 'robotic_arm' },
      { source: 'robotic_arm', target: 'production_line' },
    ],
    connections: [
      { source: 'machine_sensor', targets: ['microcontroller'] },
      { source: 'quality_camera', targets: ['microcontroller'] },
      { source: 'inventory_tracker', targets: ['microcontroller'] },
      { source: 'microcontroller', targets: ['lorawan', 'bluetooth', 'wifi'] },
      { source: 'bluetooth', targets: ['gateway'] },
      { source: 'gateway', targets: ['cloud_server', 'mqtt'] },
      { source: 'mqtt', targets: ['cloud_server'] },
      { source: 'cloud_server', targets: ['dashboard'] },
      { source: 'dashboard', targets: ['robotic_arm'] },
      { source: 'robotic_arm', targets: ['production_line'] }
    ]
  }
};
