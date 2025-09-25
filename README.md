# IoT Platform Educational Lab

## Overview

The IoT Platform Educational Lab is an interactive learning tool designed for university students to understand IoT (Internet of Things) concepts through practical, hands-on exercises. The platform allows students to design and configure different smart systems by connecting various IoT components using a drag-and-drop interface.

## Features

- **Drag-and-drop Interface**: Easily connect IoT components such as sensors, gateways, and servers by dragging them onto the canvas and connecting them with lines.

- **Three Smart System Challenges**: 
  - Smart Farming: Create an agricultural monitoring and control system
  - Smart Healthcare: Build a patient monitoring system
  - Smart Manufacturing: Design an industrial IoT system

- **Real-time Validation**: Receive immediate feedback on your IoT system configuration

- **Progress Tracking**: Track completion of challenges and overall score

## Getting Started

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory
   ```
   cd iot-platform
   ```

3. Install dependencies
   ```
   npm install
   ```

4. Start the development server
   ```
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the application in your browser

## How to Use

### For Students

1. **Home Screen**: From the home screen, select one of the three smart system challenges to begin.

2. **Building Your System**: 
   - Drag components from the left sidebar onto the canvas
   - Connect components by clicking and dragging from one component's connection point to another's
   - The system will validate your connections in real-time

3. **Completing Challenges**:
   - When your system is correctly configured, you'll receive a success notification
   - Your progress will be automatically saved
   - Return to the home screen to see your updated progress
   - Complete all three challenges to achieve a perfect score

### Component Types

#### Common Components
- Microcontroller: Processing unit that controls the IoT device
- IoT Gateway: Connects IoT devices to the cloud or local network
- Cloud Server: Remote server for data processing and storage
- Dashboard: User interface for monitoring and control

#### Communication Protocols
- WiFi: Wireless communication protocol
- Bluetooth: Short-range wireless communication protocol
- LoRaWAN: Long Range Wide Area Network protocol
- MQTT: Lightweight messaging protocol for IoT

#### System-Specific Components
Each challenge has unique components relevant to its domain (farming, healthcare, or manufacturing).

## Learning Objectives

By completing these challenges, students will:

1. Understand the components of an IoT system and their relationships
2. Learn about different communication protocols in IoT
3. See real-world applications of IoT in various domains
4. Practice system design and integration skills
5. Develop problem-solving abilities through practical application

## Development

The application is built with React and uses the following libraries:
- reactflow: For the drag-and-drop interface
- Material-UI: For the user interface components
- react-router-dom: For navigation between different systems
- localforage: For local storage of progress

## Deployment

### Deploying to Vercel

This project is configured for easy deployment to Vercel:

1. Install Vercel CLI (if not already installed)
   ```
   npm install -g vercel
   ```

2. Login to Vercel from the command line
   ```
   vercel login
   ```

3. Deploy from the project directory
   ```
   vercel
   ```

4. For production deployment
   ```
   vercel --prod
   ```

Alternatively, you can connect your GitHub repository to Vercel for automatic deployments.

## License

This project is licensed for educational use.

## Contact

For any questions or support, please contact your course instructor.
