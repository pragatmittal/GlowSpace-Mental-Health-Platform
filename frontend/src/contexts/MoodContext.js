import React, { createContext, useContext, useState, useCallback } from 'react';

const MoodContext = createContext();

export const useMoodContext = () => {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error('useMoodContext must be used within a MoodProvider');
  }
  return context;
};

export const MoodProvider = ({ children }) => {
  const [moodData, setMoodData] = useState({
    todayEntries: [],
    recentEntries: [],
    stats: {
      totalEntries: 0,
      currentStreak: 0,
      weeklyEntries: 0,
      averageMood: 0
    },
    lastUpdated: null
  });

  // Function to update mood data across all components
  const updateMoodData = useCallback((newData) => {
    setMoodData(prevData => ({
      ...prevData,
      ...newData,
      lastUpdated: new Date().toISOString()
    }));
  }, []);

  // Function to add a new mood entry optimistically
  const addMoodEntry = useCallback((newEntry) => {
    setMoodData(prevData => {
      // Check if entry already exists
      const entryExists = prevData.todayEntries.some(entry => entry._id === newEntry._id);
      if (entryExists) {
        return prevData;
      }

      // Add to today's entries if it's from today
      const today = new Date().toISOString().split('T')[0];
      const entryDate = new Date(newEntry.createdAt).toISOString().split('T')[0];
      
      const updatedTodayEntries = entryDate === today 
        ? [...prevData.todayEntries, newEntry].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        : prevData.todayEntries;

      // Add to recent entries
      const updatedRecentEntries = [newEntry, ...prevData.recentEntries.slice(0, 9)]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return {
        ...prevData,
        todayEntries: updatedTodayEntries,
        recentEntries: updatedRecentEntries,
        stats: {
          ...prevData.stats,
          totalEntries: prevData.stats.totalEntries + 1,
          weeklyEntries: prevData.stats.weeklyEntries + 1
        },
        lastUpdated: new Date().toISOString()
      };
    });
  }, []);

  // Function to trigger dashboard refresh
  const refreshDashboard = useCallback(() => {
    // Emit custom event that Dashboard can listen to
    window.dispatchEvent(new CustomEvent('moodDataUpdated', {
      detail: { timestamp: new Date().toISOString() }
    }));
  }, []);

  const value = {
    moodData,
    updateMoodData,
    addMoodEntry,
    refreshDashboard
  };

  return (
    <MoodContext.Provider value={value}>
      {children}
    </MoodContext.Provider>
  );
};

export default MoodContext;
