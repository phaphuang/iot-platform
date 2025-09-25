import React, { createContext, useState, useEffect, useContext } from 'react';
import localforage from 'localforage';

// Create the progress context
export const ProgressContext = createContext();

// Progress provider component
export const ProgressProvider = ({ children }) => {
  const [progress, setProgress] = useState({
    completedSystems: {
      'smart-farming': false,
      'smart-healthcare': false,
      'smart-manufacturing': false
    },
    score: 0,
    totalSystems: 3
  });
  
  // Load progress from local storage when component mounts
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const savedProgress = await localforage.getItem('iotPlatformProgress');
        if (savedProgress) {
          setProgress(savedProgress);
        }
      } catch (error) {
        console.error('Failed to load progress:', error);
      }
    };
    
    loadProgress();
  }, []);
  
  // Save progress to local storage whenever it changes
  useEffect(() => {
    const saveProgress = async () => {
      try {
        await localforage.setItem('iotPlatformProgress', progress);
      } catch (error) {
        console.error('Failed to save progress:', error);
      }
    };
    
    saveProgress();
  }, [progress]);
  
  // Calculate the overall score based on completed systems
  const calculateScore = () => {
    const completedCount = Object.values(progress.completedSystems).filter(Boolean).length;
    return Math.round((completedCount / progress.totalSystems) * 100);
  };
  
  // Mark a system as completed
  const completeSystem = (systemId) => {
    setProgress(prevProgress => {
      const updatedCompletedSystems = {
        ...prevProgress.completedSystems,
        [systemId]: true
      };
      
      return {
        ...prevProgress,
        completedSystems: updatedCompletedSystems,
        score: calculateScore()
      };
    });
  };
  
  // Reset all progress
  const resetProgress = () => {
    setProgress({
      completedSystems: {
        'smart-farming': false,
        'smart-healthcare': false,
        'smart-manufacturing': false
      },
      score: 0,
      totalSystems: 3
    });
  };
  
  // Check if all systems are completed
  const isAllCompleted = () => {
    return Object.values(progress.completedSystems).every(Boolean);
  };
  
  return (
    <ProgressContext.Provider 
      value={{ 
        progress, 
        completeSystem, 
        resetProgress, 
        isAllCompleted,
        calculateScore
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

// Custom hook to use the progress context
export const useProgress = () => useContext(ProgressContext);
