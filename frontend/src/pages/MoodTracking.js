import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { moodAPI } from '../services/api';
import MoodEntry from '../components/MoodTracking/MoodEntry';
import RecentMoodHistory from '../components/MoodTracking/RecentMoodHistory';
import MoodChart from '../components/MoodTracking/MoodChart';
import MoodInsights from '../components/MoodTracking/MoodInsights';
import MoodErrorBoundary from '../components/common/MoodErrorBoundary';
import './MoodTracking.css';
import { useTheme } from '../contexts/ThemeContext';

const MoodTracking = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMood, setSelectedMood] = useState(null);
  const [showTagSelection, setShowTagSelection] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isQuickSaving, setIsQuickSaving] = useState(false);
  const [quickSaveSuccess, setQuickSaveSuccess] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [tipsRefreshKey, setTipsRefreshKey] = useState(0);
  const [savedMoodForTips, setSavedMoodForTips] = useState(null);
  const [userProgress, setUserProgress] = useState({
    dayStreak: 0,
    moodScore: 0,
    totalEntries: 0,
    positivePercentage: 0,
    negativePercentage: 0,
    neutralPercentage: 0,
    moodCounts: { 'very_sad': 0, 'sad': 0, 'neutral': 0, 'happy': 0, 'very_happy': 0 },
    loading: true,
    error: null
  });

  const moodActivities = {
    very_sad: [
      { icon: '🧘‍♀️', title: 'Practice Deep Breathing', description: 'Take 5 deep breaths, counting to 4 on inhale and 6 on exhale' },
      { icon: '☀️', title: 'Get Some Sunlight', description: 'Step outside for 10 minutes or sit by a window' },
      { icon: '🎵', title: 'Listen to Uplifting Music', description: 'Create a playlist of songs that make you smile' },
      { icon: '💝', title: 'Practice Self-Care', description: 'Take a warm bath, drink tea, or wrap yourself in a cozy blanket' },
      { icon: '📞', title: 'Reach Out', description: 'Call a friend or family member who always makes you feel better' },
      { icon: '📖', title: 'Read Something Inspiring', description: 'Pick up a book that always lifts your spirits' },
      { icon: '🌱', title: 'Water Your Plants', description: 'Tend to your plants or start growing something new' },
      { icon: '🎨', title: 'Creative Expression', description: 'Draw, paint, or write about your feelings' },
      { icon: '🍵', title: 'Mindful Tea Time', description: 'Brew your favorite tea and savor it slowly' },
      { icon: '🛁', title: 'Aromatherapy Bath', description: 'Add essential oils to your bath for relaxation' }
    ],
    sad: [
      { icon: '🚶‍♀️', title: 'Take a Walk', description: 'A 15-minute walk can boost your mood and energy' },
      { icon: '🎨', title: 'Express Yourself', description: 'Draw, write, or create something - even if it\'s just doodling' },
      { icon: '🍫', title: 'Treat Yourself', description: 'Enjoy a small treat or do something you normally enjoy' },
      { icon: '🌱', title: 'Connect with Nature', description: 'Look at plants, watch birds, or feel the breeze' },
      { icon: '📚', title: 'Read Something Positive', description: 'Pick up an inspiring book or article' },
      { icon: '🎵', title: 'Dance to Music', description: 'Put on your favorite upbeat song and move' },
      { icon: '☕', title: 'Coffee/Tea Ritual', description: 'Make your favorite drink and enjoy it mindfully' },
      { icon: '📱', title: 'Call a Friend', description: 'Reach out to someone who always makes you laugh' },
      { icon: '🧘‍♀️', title: 'Quick Meditation', description: 'Sit quietly for 5 minutes and focus on your breath' },
      { icon: '🎮', title: 'Play a Game', description: 'Engage in something fun and distracting' }
    ],
    neutral: [
      { icon: '🎯', title: 'Set a Small Goal', description: 'Choose one thing to accomplish today that will make you proud' },
      { icon: '🎉', title: 'Try Something New', description: 'Experiment with a new hobby, food, or activity' },
      { icon: '💪', title: 'Move Your Body', description: 'Dance, stretch, or do some light exercise' },
      { icon: '🌟', title: 'Practice Gratitude', description: 'Write down 3 things you\'re thankful for today' },
      { icon: '🤝', title: 'Help Someone', description: 'Do a small act of kindness for another person' },
      { icon: '📚', title: 'Learn Something New', description: 'Watch an educational video or read an article' },
      { icon: '🎨', title: 'Creative Project', description: 'Start a small art project or craft' },
      { icon: '🌿', title: 'Organize Something', description: 'Tidy up a small area of your space' },
      { icon: '🎵', title: 'Listen to Podcasts', description: 'Find an interesting podcast on a topic you enjoy' },
      { icon: '🍳', title: 'Cook Something', description: 'Try making a new recipe or your favorite dish' }
    ],
    happy: [
      { icon: '🎊', title: 'Celebrate Your Joy', description: 'Take a moment to appreciate this feeling' },
      { icon: '💝', title: 'Spread Happiness', description: 'Share your good mood with others - it\'s contagious!' },
      { icon: '📸', title: 'Capture the Moment', description: 'Take a photo or write about what\'s making you happy' },
      { icon: '🎯', title: 'Channel Your Energy', description: 'Use this positive energy to tackle something you\'ve been putting off' },
      { icon: '🌱', title: 'Build on It', description: 'Think about what led to this happiness and how to create more of it' },
      { icon: '🎵', title: 'Create a Happy Playlist', description: 'Make a collection of songs that boost your mood' },
      { icon: '📝', title: 'Journal Your Joy', description: 'Write about what\'s making you happy right now' },
      { icon: '🎁', title: 'Surprise Someone', description: 'Do something nice for someone else unexpectedly' },
      { icon: '🌺', title: 'Self-Care Celebration', description: 'Treat yourself to something special' },
      { icon: '🤗', title: 'Physical Activity', description: 'Use your energy for exercise or movement' }
    ],
    very_happy: [
      { icon: '🌟', title: 'Bask in the Moment', description: 'Take time to fully experience this wonderful feeling' },
      { icon: '🎁', title: 'Share Your Light', description: 'Your happiness can brighten someone else\'s day' },
      { icon: '💪', title: 'Harness Your Power', description: 'Use this energy to accomplish something meaningful' },
      { icon: '🎯', title: 'Set Positive Intentions', description: 'Channel this joy into creating more happiness in your life' },
      { icon: '🌺', title: 'Practice Self-Care', description: 'Treat yourself to something special - you deserve it!' },
      { icon: '🎉', title: 'Plan Something Fun', description: 'Use this energy to plan future enjoyable activities' },
      { icon: '💝', title: 'Gift Giving', description: 'Share your abundance with others through small gifts' },
      { icon: '📚', title: 'Inspire Others', description: 'Share your positive energy to motivate someone else' },
      { icon: '🎨', title: 'Creative Expression', description: 'Channel your joy into art, music, or writing' },
      { icon: '🌱', title: 'Plant Seeds of Joy', description: 'Start a project that will bring future happiness' }
    ]
  };

  // Function to get random activities for a mood
  const getRandomActivities = (mood, count = 2) => {
    const activities = moodActivities[mood] || [];
    const shuffled = [...activities].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };





  // Auto-refresh mechanism when new mood is added
  const handleMoodAdded = () => {
    console.log('🔄 Mood added, refreshing data...');
    setRefreshTrigger(prev => prev + 1);
    
    // Refresh user progress data
    setTimeout(() => fetchUserProgress(), 1000); // Small delay to ensure backend has processed
    
    // Dispatch custom event for dashboard update
    window.dispatchEvent(new CustomEvent('moodDataUpdated', {
      detail: { source: 'moodTracking', timestamp: Date.now() }
    }));
  };

  // SIMPLIFIED AND WORKING fetchUserProgress function
  const fetchUserProgress = async () => {
    if (!user) return;
    
    try {
      setUserProgress(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await moodAPI.getEntries({ limit: 1000 });
      
      if (!response?.data?.success) {
        throw new Error('Failed to fetch entries');
      }
      
      const entries = response.data.data || [];
      console.log('📊 Entries fetched:', entries.length);
      
      if (entries.length === 0) {
        setUserProgress({
          dayStreak: 0,
          moodScore: 0,
          totalEntries: 0,
          positivePercentage: 0,
          negativePercentage: 0,
          neutralPercentage: 0,
          moodCounts: { 'very_sad': 0, 'sad': 0, 'neutral': 0, 'happy': 0, 'very_happy': 0 },
          loading: false,
          error: null
        });
        return;
      }
      
      const moodValues = { 'very_sad': 1, 'sad': 2, 'neutral': 3, 'happy': 4, 'very_happy': 5 };
      let totalMoodValue = 0;
      let validEntries = 0;
      let moodCounts = { 'very_sad': 0, 'sad': 0, 'neutral': 0, 'happy': 0, 'very_happy': 0 };
      
      entries.forEach(entry => {
        if (entry.mood && moodValues[entry.mood] !== undefined) {
          totalMoodValue += moodValues[entry.mood];
          validEntries++;
          moodCounts[entry.mood]++;
        }
      });
      
      // Calculate mood score
      const moodScore = validEntries > 0 ? Math.round((totalMoodValue / validEntries / 5) * 100) : 0;
      
      // Calculate percentages
      const positiveMoods = moodCounts['happy'] + moodCounts['very_happy'];
      const negativeMoods = moodCounts['very_sad'] + moodCounts['sad'];
      const neutralMoods = moodCounts['neutral'];
      
      const positivePercentage = validEntries > 0 ? Math.round((positiveMoods / validEntries) * 100) : 0;
      const negativePercentage = validEntries > 0 ? Math.round((negativeMoods / validEntries) * 100) : 0;
      const neutralPercentage = validEntries > 0 ? Math.round((neutralMoods / validEntries) * 100) : 0;
      
      const sortedEntries = entries.sort((a, b) => new Date(b.date) - new Date(a.date));
      const uniqueDates = [...new Set(sortedEntries.map(entry => new Date(entry.date).toDateString()))];
      
      let dayStreak = 1;
      if (uniqueDates.length > 1) {
        let currentDate = new Date(uniqueDates[0]);
        for (let i = 1; i < uniqueDates.length; i++) {
          const prevDate = new Date(uniqueDates[i]);
          const dayDiff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
          if (dayDiff === 1) {
            dayStreak++;
            currentDate = prevDate;
          } else {
            break;
          }
        }
      }
      
      const finalProgress = {
        dayStreak,
        moodScore,
        totalEntries: entries.length,
        positivePercentage,
        negativePercentage,
        neutralPercentage,
        moodCounts,
        loading: false,
        error: null
      };
      
      console.log('🎯 Final progress:', finalProgress);
      setUserProgress(finalProgress);
      
    } catch (error) {
      console.error('❌ Error:', error);
      setUserProgress(prev => ({ ...prev, loading: false, error: error.message }));
    }
  };

  // Simplified mood score calculation - ONLY uses raw entries
  const calculateMoodScoreFromEntries = async () => {
    console.log('🧮 SIMPLIFIED: Calculating mood score from entries only...');
    try {
      const response = await moodAPI.getEntries({ limit: 100, _t: Date.now() });
      if (response.data && response.data.success) {
        const entries = response.data.data;
        console.log('🧮 Entries received:', entries);
        
        if (entries && entries.length > 0) {
          const moodValues = {
            'very_sad': 1, 'sad': 2, 'neutral': 3, 'happy': 4, 'very_happy': 5
          };
          
          let totalMoodValue = 0;
          let validEntries = 0;
          
          entries.forEach(entry => {
            if (entry.mood && moodValues[entry.mood] !== undefined) {
              const moodValue = moodValues[entry.mood];
              totalMoodValue += moodValue;
              validEntries++;
              console.log(`🧮 Entry: ${entry.mood} = ${moodValue}`);
            }
          });
          
          if (validEntries > 0) {
            const avgMood = totalMoodValue / validEntries;
            const moodScore = Math.round((avgMood / 5) * 100);
            console.log(`🧮 RESULT: avgMood=${avgMood}, moodScore=${moodScore}%, validEntries=${validEntries}`);
            
            // Update the state directly
            setUserProgress(prev => ({
              ...prev,
              moodScore: moodScore,
              totalEntries: validEntries,
              loading: false,
              error: null
            }));
            
            return moodScore;
          } else {
            console.log('🧮 No valid entries found');
            return 0;
          }
        } else {
          console.log('🧮 No entries received');
          return 0;
        }
      } else {
        console.log('🧮 API response failed:', response);
        return 0;
      }
    } catch (error) {
      console.error('🧮 Error in simplified calculation:', error);
      return 0;
    }
  };

  // Test function to debug mood score calculation
  const debugMoodScore = () => {
    console.log('🔍 DEBUG: Current userProgress state:', userProgress);
    console.log('🔍 DEBUG: Forcing progress refresh...');
    calculateMoodScoreFromEntries();
  };

  // Test function to manually calculate mood score from entries
  const testMoodScoreCalculation = async () => {
    console.log('🧪 TESTING: Manual mood score calculation...');
    const result = await calculateMoodScoreFromEntries();
    alert(`Test Result: Mood Score = ${result}%`);
  };

  // Test API connection and see what's happening
  const testAPIConnection = async () => {
    console.log('🔌 TESTING: API Connection...');
    try {
      console.log('🔌 Testing moodAPI.getEntries...');
      const response = await moodAPI.getEntries({ limit: 50 });
      console.log('🔌 API Response:', response);
      console.log('🔌 Response data:', response?.data);
      console.log('🔌 Response success:', response?.data?.success);
      console.log('🔌 Response entries:', response?.data?.data);
      
      if (response && response.data && response.data.success) {
        alert(`API Test: SUCCESS\nEntries received: ${response.data.data?.length || 0}`);
      } else {
        alert(`API Test: FAILED\nResponse: ${JSON.stringify(response, null, 2)}`);
      }
    } catch (error) {
      console.error('🔌 API Test Error:', error);
      alert(`API Test: ERROR\n${error.message}`);
    }
  };

  // Force fresh data for debugging mood score
  const forceFreshData = () => {
    console.log('🚀 Forcing fresh data...');
    calculateMoodScoreFromEntries();
  };

  // Get current time of day
  const getCurrentTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  };

  // Save quick mood entry
  const saveQuickMoodEntry = async (mood, tags = []) => {
    if (!user) {
      alert('You must be logged in to track your mood.');
      return false;
    }

    setIsQuickSaving(true);
    setQuickSaveSuccess(false);

    try {
      // Map tags to valid activity
      const activity = tags.length > 0 ? 
        (tags.includes('work') ? 'work' :
         tags.includes('exercise') ? 'exercise' :
         tags.includes('social') ? 'social' :
         tags.includes('family') ? 'family' :
         tags.includes('creative') ? 'creative' :
         tags.includes('study') ? 'study' :
         tags.includes('therapy') ? 'therapy' :
         'other') : 'other';

      const moodData = {
        mood: mood.value,
        intensity: 5, // Default intensity
        timeOfDay: getCurrentTimeOfDay(),
        activity: activity,
        entryMethod: 'quick_button', // Distinguish from manual entries
        tags: tags.length > 0 ? tags : undefined,
        notes: `Quick mood entry: ${mood.label}`
      };

      console.log('Quick mood entry data:', moodData);

      const response = await moodAPI.createEntry(moodData);
      
      if (response.data && response.data.success) {
        console.log('Quick mood entry saved successfully:', response.data);
        setQuickSaveSuccess(true);
        setShowSuccessMessage(true);
        
        // Quick mood entry saved successfully
        
        handleMoodAdded(); // Also trigger the standard refresh
        
        // Auto-hide success message after 3 seconds, but keep tips visible
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
        
        return true;
      } else {
        throw new Error(response.data?.message || 'Failed to save mood entry');
      }
    } catch (error) {
      console.error('Error saving quick mood entry:', error);
      alert('Failed to save mood entry. Please try again.');
      return false;
    } finally {
      setIsQuickSaving(false);
    }
  };

  // Handle mood selection
  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    setShowTagSelection(true);
    // Clear previous saved mood and success state when selecting new mood
    setSavedMoodForTips(null);
    setQuickSaveSuccess(false);
    setShowSuccessMessage(false);
  };

  // Handle tag selection completion
  const handleTagsSelected = async () => {
    if (selectedMood) {
      const saved = await saveQuickMoodEntry(selectedMood, selectedTags);
      if (saved) {
        // Store the mood for tips before resetting state
        setSavedMoodForTips(selectedMood);
        // Reset state after successful save
        setShowTagSelection(false);
        setSelectedMood(null);
        setSelectedTags([]);
      }
    }
  };

  // Handle tag selection
  const handleTagClick = (tag) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  // Reset to mood selection
  const handleBackToMood = () => {
    setShowTagSelection(false);
    setSelectedMood(null);
    setSelectedTags([]);
    setSavedMoodForTips(null);
    setQuickSaveSuccess(false);
    setShowSuccessMessage(false);
  };

  useEffect(() => {
    if (user) {
      setLoading(false);
      console.log('🚀 Component mounted, fetching user progress...');
      fetchUserProgress();
    }
  }, [user]);

  // Listen for mood data updates from other components
  useEffect(() => {
    const handleMoodDataUpdate = () => {
      console.log('🔄 Mood data update detected');
      // Mood data updated successfully
    };

    // Listen for custom events
    window.addEventListener('moodDataUpdated', handleMoodDataUpdate);
    window.addEventListener('moodEntryAdded', handleMoodDataUpdate);
    window.addEventListener('moodDataChanged', handleMoodDataUpdate);

    return () => {
      window.removeEventListener('moodDataUpdated', handleMoodDataUpdate);
      window.removeEventListener('moodEntryAdded', handleMoodDataUpdate);
      window.removeEventListener('moodDataChanged', handleMoodDataUpdate);
    };
  }, []);



  if (loading) {
    return (
      <div className="mood-tracking-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your wellness journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mood-tracking-page" style={{
      background: isDarkMode 
        ? 'linear-gradient(135deg, #0F1419 0%, #1A202C 100%)'
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      {/* Hero Section */}
      <div className="mood-hero-section" style={{
        background: isDarkMode 
          ? 'rgba(26, 32, 44, 0.3)'
          : 'rgba(255, 255, 255, 0.1)'
      }}>
        <div className="hero-content">


          {/* Modern Mood Tracker */}
          <div className="mood-tracker-section">
            <div className="tracker-header">
              <h2 style={{ color: isDarkMode ? 'var(--text-primary)' : 'var(--text-primary)' }}>Track Your Mood Today</h2>
              <p style={{ color: isDarkMode ? 'var(--text-secondary)' : 'var(--text-secondary)' }}>How are you feeling right now?</p>
            </div>
            
            <div className="mood-tracker-grid">
              <div className="mood-tracker-card">
                <div className="card-header">
                  <span className="card-icon">🎭</span>
                  <h3 style={{ color: isDarkMode ? 'var(--text-primary)' : 'var(--text-primary)' }}>{showTagSelection ? 'Select Tags & Activities' : 'Quick Mood Entry'}</h3>
                </div>
                
                {!showTagSelection ? (
                  // Mood Selection Step
                  <>
                    <div className="mood-options">
                      <button className="mood-option" onClick={() => handleMoodSelect({ emoji: '😄', label: 'Very Happy', value: 'very_happy' })} style={{
                        background: isDarkMode ? 'rgba(129, 230, 217, 0.1)' : 'rgba(44, 122, 123, 0.1)',
                        border: isDarkMode ? '1px solid rgba(129, 230, 217, 0.3)' : '1px solid rgba(44, 122, 123, 0.3)',
                        borderRadius: '12px',
                        padding: '15px',
                        margin: '5px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}>
                        <span className="mood-emoji" style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>😄</span>
                        <span className="mood-label" style={{ 
                          color: isDarkMode ? 'var(--text-primary)' : 'var(--text-primary)',
                          fontSize: '1rem',
                          fontWeight: '600',
                          display: 'block'
                        }}>Very Happy</span>
                      </button>
                      <button className="mood-option" onClick={() => handleMoodSelect({ emoji: '😊', label: 'Happy', value: 'happy' })} style={{
                        background: isDarkMode ? 'rgba(129, 230, 217, 0.1)' : 'rgba(44, 122, 123, 0.1)',
                        border: isDarkMode ? '1px solid rgba(129, 230, 217, 0.3)' : '1px solid rgba(44, 122, 123, 0.3)',
                        borderRadius: '12px',
                        padding: '15px',
                        margin: '5px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}>
                        <span className="mood-emoji" style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>😊</span>
                        <span className="mood-label" style={{ 
                          color: isDarkMode ? 'var(--text-primary)' : 'var(--text-primary)',
                          fontSize: '1rem',
                          fontWeight: '600',
                          display: 'block'
                        }}>Happy</span>
                      </button>
                      <button className="mood-option" onClick={() => handleMoodSelect({ emoji: '😐', label: 'Neutral', value: 'neutral' })} style={{
                        background: isDarkMode ? 'rgba(129, 230, 217, 0.1)' : 'rgba(44, 122, 123, 0.1)',
                        border: isDarkMode ? '1px solid rgba(129, 230, 217, 0.3)' : '1px solid rgba(44, 122, 123, 0.3)',
                        borderRadius: '12px',
                        padding: '15px',
                        margin: '5px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}>
                        <span className="mood-emoji" style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>😐</span>
                        <span className="mood-label" style={{ 
                          color: isDarkMode ? 'var(--text-primary)' : 'var(--text-primary)',
                          fontSize: '1rem',
                          fontWeight: '600',
                          display: 'block'
                        }}>Neutral</span>
                      </button>
                      <button className="mood-option" onClick={() => handleMoodSelect({ emoji: '😞', label: 'Sad', value: 'sad' })} style={{
                        background: isDarkMode ? 'rgba(129, 230, 217, 0.1)' : 'rgba(44, 122, 123, 0.1)',
                        border: isDarkMode ? '1px solid rgba(129, 230, 217, 0.3)' : '1px solid rgba(44, 122, 123, 0.3)',
                        borderRadius: '12px',
                        padding: '15px',
                        margin: '5px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}>
                        <span className="mood-emoji" style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>😞</span>
                        <span className="mood-label" style={{ 
                          color: isDarkMode ? 'var(--text-primary)' : 'var(--text-primary)',
                          fontSize: '1rem',
                          fontWeight: '600',
                          display: 'block'
                        }}>Sad</span>
                      </button>
                      <button className="mood-option" onClick={() => handleMoodSelect({ emoji: '😢', label: 'Very Sad', value: 'very_sad' })} style={{
                        background: isDarkMode ? 'rgba(129, 230, 217, 0.1)' : 'rgba(44, 122, 123, 0.1)',
                        border: isDarkMode ? '1px solid rgba(129, 230, 217, 0.3)' : '1px solid rgba(44, 122, 123, 0.3)',
                        borderRadius: '12px',
                        padding: '15px',
                        margin: '5px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}>
                        <span className="mood-emoji" style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>😢</span>
                        <span className="mood-label" style={{ 
                          color: isDarkMode ? 'var(--text-primary)' : 'var(--text-primary)',
                          fontSize: '1rem',
                          fontWeight: '600',
                          display: 'block'
                        }}>Very Sad</span>
                      </button>
                    </div>
                    <div className="mood-selection-info">
                      <p className="mood-selection-text" style={{ color: isDarkMode ? 'var(--text-secondary)' : 'var(--text-secondary)' }}>Select your mood to continue</p>
                      <div className="mood-quote-section">
                        <div className="quote-icon">💭</div>
                        <blockquote className="mood-quote-text" style={{ color: isDarkMode ? 'var(--text-primary)' : 'var(--text-primary)' }}>
                          "Every emotion you feel is valid. Every step you take towards understanding yourself is progress."
                        </blockquote>
                        <div className="quote-author" style={{ color: isDarkMode ? 'var(--text-secondary)' : 'var(--text-secondary)' }}>— GlowSpace Team</div>
                      </div>
                    </div>
                  </>
                ) : (
                  // Tag Selection Step
                  <>
                    <div className="selected-mood-display">
                      <div className="selected-mood-info">
                        <span className="selected-mood-emoji">{selectedMood.emoji}</span>
                        <span className="selected-mood-label">{selectedMood.label}</span>
                      </div>
                      <button className="back-to-mood-btn" onClick={handleBackToMood}>
                        ← Change Mood
                      </button>
                    </div>
                    
                    <div className="tag-selection-section">
                      <h4 style={{ color: isDarkMode ? 'var(--text-primary)' : 'var(--text-primary)' }}>What activities or tags describe your mood?</h4>
                      <div className="tag-suggestions">
                        {selectedMood.value === 'very_happy' || selectedMood.value === 'happy' ? (
                          <>
                            <button 
                              className={`tag-suggestion ${selectedTags.includes('celebrating') ? 'selected' : ''}`}
                              onClick={() => handleTagClick('celebrating')}
                            >
                              🎉 Celebrating
                            </button>
                            <button 
                              className={`tag-suggestion ${selectedTags.includes('accomplished') ? 'selected' : ''}`}
                              onClick={() => handleTagClick('accomplished')}
                            >
                              💪 Accomplished
                            </button>
                            <button 
                              className={`tag-suggestion ${selectedTags.includes('grateful') ? 'selected' : ''}`}
                              onClick={() => handleTagClick('grateful')}
                            >
                              😊 Grateful
                            </button>
                            <button 
                              className={`tag-suggestion ${selectedTags.includes('excited') ? 'selected' : ''}`}
                              onClick={() => handleTagClick('excited')}
                            >
                              🌟 Excited
                            </button>
                            <button 
                              className={`tag-suggestion ${selectedTags.includes('loved') ? 'selected' : ''}`}
                              onClick={() => handleTagClick('loved')}
                            >
                              💝 Loved
                            </button>
                          </>
                        ) : selectedMood.value === 'neutral' ? (
                          <>
                            <button 
                              className={`tag-suggestion ${selectedTags.includes('calm') ? 'selected' : ''}`}
                              onClick={() => handleTagClick('calm')}
                            >
                              🧘 Calm
                            </button>
                            <button 
                              className={`tag-suggestion ${selectedTags.includes('focused') ? 'selected' : ''}`}
                              onClick={() => handleTagClick('focused')}
                            >
                              📚 Focused
                            </button>
                            <button 
                              className={`tag-suggestion ${selectedTags.includes('relaxed') ? 'selected' : ''}`}
                              onClick={() => handleTagClick('relaxed')}
                            >
                              🏠 Relaxed
                            </button>
                            <button 
                              className={`tag-suggestion ${selectedTags.includes('contemplative') ? 'selected' : ''}`}
                              onClick={() => handleTagClick('contemplative')}
                            >
                              🤔 Contemplative
                            </button>
                            <button 
                              className={`tag-suggestion ${selectedTags.includes('balanced') ? 'selected' : ''}`}
                              onClick={() => handleTagClick('balanced')}
                            >
                              🌱 Balanced
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              className={`tag-suggestion ${selectedTags.includes('lonely') ? 'selected' : ''}`}
                              onClick={() => handleTagClick('lonely')}
                            >
                              😔 Lonely
                            </button>
                            <button 
                              className={`tag-suggestion ${selectedTags.includes('frustrated') ? 'selected' : ''}`}
                              onClick={() => handleTagClick('frustrated')}
                            >
                              😤 Frustrated
                            </button>
                            <button 
                              className={`tag-suggestion ${selectedTags.includes('anxious') ? 'selected' : ''}`}
                              onClick={() => handleTagClick('anxious')}
                            >
                              😰 Anxious
                            </button>
                            <button 
                              className={`tag-suggestion ${selectedTags.includes('overwhelmed') ? 'selected' : ''}`}
                              onClick={() => handleTagClick('overwhelmed')}
                            >
                              😭 Overwhelmed
                            </button>
                            <button 
                              className={`tag-suggestion ${selectedTags.includes('disappointed') ? 'selected' : ''}`}
                              onClick={() => handleTagClick('disappointed')}
                            >
                              😞 Disappointed
                            </button>
                          </>
                        )}
                      </div>
                      
                      {selectedTags.length > 0 && (
                        <div className="selected-tags-display">
                          <p>Selected tags: {selectedTags.join(', ')}</p>
                        </div>
                      )}
                      
                      <div className="custom-tag-input">
                        <input 
                          type="text" 
                          placeholder="Add your own tag..." 
                          className="custom-tag-field"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                              handleTagClick(e.target.value.trim().toLowerCase());
                              e.target.value = '';
                            }
                          }}
                        />
                        <button 
                          className="add-custom-tag-btn"
                          onClick={(e) => {
                            const input = e.target.previousElementSibling;
                            if (input.value.trim()) {
                              handleTagClick(input.value.trim().toLowerCase());
                              input.value = '';
                            }
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <button 
                      className="next-btn" 
                      onClick={handleTagsSelected}
                      disabled={isQuickSaving}
                    >
                      {isQuickSaving ? (
                        <>
                          <span className="loading-spinner small"></span>
                          Saving...
                        </>
                      ) : (
                        'Save Mood Entry →'
                      )}
                    </button>
                    
                    {showSuccessMessage && (
                      <div className="quick-save-success">
                        ✅ Mood saved successfully!
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* SMART MOOD GUIDANCE SYSTEM */}
              <div className="mood-tracker-card">
                <div className="card-header">
                  <span className="card-icon">💡</span>
                  <h3 style={{ color: isDarkMode ? 'var(--text-primary)' : 'var(--text-primary)' }}>Mood Guidance & Tips</h3>
                </div>
                
                <div className="mood-guidance-content">
                  {quickSaveSuccess && savedMoodForTips ? (
                    <div className="mood-specific-guidance">
                      <div className={`guidance-section ${savedMoodForTips.value}-guidance`}>
                        <h4>
                          {savedMoodForTips.value === 'very_sad' && '😢 Feeling Very Sad? Here\'s How to Feel Better:'}
                          {savedMoodForTips.value === 'sad' && '😔 Feeling Down? Let\'s Brighten Your Day:'}
                          {savedMoodForTips.value === 'neutral' && '😐 Feeling Neutral? Let\'s Add Some Sparkle:'}
                          {savedMoodForTips.value === 'happy' && '😊 Feeling Happy? Keep the Good Vibes Going!'}
                          {savedMoodForTips.value === 'very_happy' && '😄 Feeling Amazing? You\'re Radiating Joy!'}
                        </h4>
                        
                        <div className="tips-grid">
                          {getRandomActivities(savedMoodForTips.value, 2).map((activity, index) => (
                            <div key={`${tipsRefreshKey}-${index}`} className="tip-item">
                              <span className="tip-icon">{activity.icon}</span>
                              <p><strong>{activity.title}:</strong> {activity.description}</p>
                            </div>
                          ))}
                        </div>
                        

                      </div>
                    </div>
                  ) : (
                    <div className="default-guidance">
                      <div className="guidance-placeholder">
                        <span className="guidance-icon">💭</span>
                        <h4>Choose Your Mood Above</h4>
                        <p>Select how you're feeling to get personalized guidance and tips to enhance your mood!</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <button className="view-analytics-btn" onClick={() => {
                  setActiveTab('analytics');
                  setTimeout(() => {
                    const analyticsSection = document.getElementById('analytics-section');
                    if (analyticsSection) {
                      analyticsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 100);
                }} style={{
                  background: isDarkMode 
                    ? 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)'
                    : 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: isDarkMode 
                    ? '0 4px 15px rgba(129, 230, 217, 0.3)'
                    : '0 4px 15px rgba(44, 122, 123, 0.3)'
                }}>
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mood-navigation" style={{
        background: isDarkMode 
          ? 'rgba(26, 32, 44, 0.95)'
          : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: isDarkMode 
          ? '1px solid rgba(129, 230, 217, 0.2)'
          : '1px solid rgba(44, 122, 123, 0.2)',
        marginBottom: '20px',
        position: 'relative',
        zIndex: 10
      }}>
        <div className="nav-container">
          <button 
            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
            style={{
              background: activeTab === 'overview' 
                ? (isDarkMode ? 'rgba(129, 230, 217, 0.9)' : 'rgba(44, 122, 123, 0.9)')
                : 'transparent',
              color: activeTab === 'overview' 
                ? (isDarkMode ? 'var(--text-primary)' : 'var(--text-primary)')
                : (isDarkMode ? 'var(--text-secondary)' : 'var(--text-secondary)'),
              border: 'none',
              borderRadius: '15px 15px 0 0',
              padding: '15px 25px',
              margin: '0 5px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '1rem',
              fontWeight: '600',
              position: 'relative',
              zIndex: activeTab === 'overview' ? 15 : 10
            }}
          >
            <span className="tab-icon">🏠</span>
            <span className="tab-label">Overview</span>
          </button>

          <button 
            className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
            style={{
              background: activeTab === 'analytics' 
                ? (isDarkMode ? 'rgba(129, 230, 217, 0.9)' : 'rgba(44, 122, 123, 0.9)')
                : 'transparent',
              color: activeTab === 'analytics' 
                ? (isDarkMode ? 'var(--text-primary)' : 'var(--text-primary)')
                : (isDarkMode ? 'var(--text-secondary)' : 'var(--text-secondary)'),
              border: 'none',
              borderRadius: '15px 15px 0 0',
              padding: '15px 25px',
              margin: '0 5px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '1rem',
              fontWeight: '600',
              position: 'relative',
              zIndex: activeTab === 'analytics' ? 15 : 10
            }}
          >
            <span className="tab-icon">📈</span>
            <span className="tab-label">Analytics</span>
          </button>
          <button 
            className={`nav-tab ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
            style={{
              background: activeTab === 'insights' 
                ? (isDarkMode ? 'rgba(129, 230, 217, 0.9)' : 'var(--text-primary)')
                : 'transparent',
              color: activeTab === 'insights' 
                ? (isDarkMode ? 'var(--text-primary)' : 'var(--text-primary)')
                : (isDarkMode ? 'var(--text-secondary)' : 'var(--text-secondary)'),
              border: 'none',
              borderRadius: '15px 15px 0 0',
              padding: '15px 25px',
              margin: '0 5px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '1rem',
              fontWeight: '600',
              position: 'relative',
              zIndex: activeTab === 'insights' ? 15 : 10
            }}
          >
            <span className="tab-icon">💡</span>
            <span className="tab-label">Insights</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mood-main-content" style={{
        background: isDarkMode 
          ? 'rgba(26, 32, 44, 0.9)'
          : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        marginTop: '20px',
        position: 'relative',
        zIndex: 5
      }}>
        {activeTab === 'overview' && (
          <div className="overview-layout" style={{
            background: isDarkMode 
              ? 'rgba(26, 32, 44, 0.5)'
              : 'rgba(255, 255, 255, 0.5)',
            borderRadius: '20px',
            padding: '20px'
          }}>
            {/* Welcome & Motivation Section */}
            <div className="welcome-section" style={{
              marginBottom: '40px',
              padding: '20px',
              background: isDarkMode ? 'rgba(26, 32, 44, 0.8)' : 'rgba(250, 253, 251, 0.8)',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)'
            }}>
              <div className="welcome-header" style={{
                textAlign: 'center',
                marginBottom: '40px',
                background: isDarkMode ? 'rgba(129, 230, 217, 0.05)' : 'rgba(44, 122, 123, 0.05)',
                backdropFilter: 'blur(20px)',
                borderRadius: '25px',
                padding: '40px',
                border: isDarkMode ? '1px solid rgba(129, 230, 217, 0.1)' : '1px solid rgba(44, 122, 123, 0.1)'
              }}>
                <h2 style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: '2.5rem',
                  fontWeight: '800',
                  margin: '0 0 20px 0'
                }}>🌟 Welcome to Your Wellness Journey</h2>
                <p style={{
                  color: isDarkMode ? 'var(--text-secondary)' : 'var(--text-secondary)',
                  fontSize: '1.2rem',
                  fontWeight: '500',
                  margin: '0',
                  lineHeight: '1.6',
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                }}>Track your moods, discover patterns, and build emotional awareness</p>
              </div>
              
              <div className="motivation-cards" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '20px',
                marginBottom: '30px'
              }}>
                <div className="motivation-card" style={{
                  background: isDarkMode 
                    ? 'linear-gradient(135deg, rgba(129, 230, 217, 0.1) 0%, rgba(129, 230, 217, 0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(44, 122, 123, 0.1) 0%, rgba(44, 122, 123, 0.05) 100%)',
                  backdropFilter: 'blur(25px)',
                  border: isDarkMode 
                    ? '1px solid rgba(129, 230, 217, 0.2)'
                    : '1px solid rgba(44, 122, 123, 0.2)',
                  borderRadius: '20px',
                  padding: '25px 20px',
                  textAlign: 'center',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isDarkMode 
                    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                    : '0 8px 32px rgba(44, 122, 123, 0.1)'
                }}>
                  <div className="motivation-icon" style={{
                    fontSize: '3.5rem',
                    marginBottom: '20px',
                    display: 'block',
                    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
                  }}>🎯</div>
                  <h3 style={{
                    color: isDarkMode ? 'var(--text-primary)' : 'var(--text-primary)',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    margin: '0 0 15px 0',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                    letterSpacing: '0.5px'
                  }}>Set Daily Goals</h3>
                  <p style={{
                    color: isDarkMode ? 'var(--text-secondary)' : 'var(--text-secondary)',
                    fontSize: '0.95rem',
                    lineHeight: '1.5',
                    margin: '0',
                    fontWeight: '400',
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                  }}>Start with small, achievable wellness goals each day</p>
                </div>
                
                <div className="motivation-card" style={{
                  background: isDarkMode 
                    ? 'linear-gradient(135deg, rgba(129, 230, 217, 0.1) 0%, rgba(129, 230, 217, 0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(44, 122, 123, 0.1) 0%, rgba(44, 122, 123, 0.05) 100%)',
                  backdropFilter: 'blur(25px)',
                  border: isDarkMode 
                    ? '1px solid rgba(129, 230, 217, 0.2)'
                    : '1px solid rgba(44, 122, 123, 0.2)',
                  borderRadius: '20px',
                  padding: '25px 20px',
                  textAlign: 'center',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isDarkMode 
                    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                    : '0 8px 32px rgba(44, 122, 123, 0.1)'
                }}>
                  <div className="motivation-icon" style={{
                    fontSize: '3.5rem',
                    marginBottom: '20px',
                    display: 'block',
                    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
                  }}>📚</div>
                  <h3 style={{
                    color: isDarkMode ? 'var(--text-primary)' : 'var(--text-primary)',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    margin: '0 0 15px 0',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                    letterSpacing: '0.5px'
                  }}>Learn & Grow</h3>
                  <p style={{
                    color: isDarkMode ? 'var(--text-secondary)' : 'var(--text-secondary)',
                    fontSize: '0.95rem',
                    lineHeight: '1.5',
                    margin: '0',
                    fontWeight: '400',
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                  }}>Discover insights about your emotional patterns</p>
                </div>
                
                <div className="motivation-card" style={{
                  background: isDarkMode 
                    ? 'linear-gradient(135deg, rgba(129, 230, 217, 0.1) 0%, rgba(129, 230, 217, 0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(44, 122, 123, 0.1) 0%, rgba(44, 122, 123, 0.05) 100%)',
                  backdropFilter: 'blur(25px)',
                  border: isDarkMode 
                    ? '1px solid rgba(129, 230, 217, 0.2)'
                    : '1px solid rgba(44, 122, 123, 0.2)',
                  borderRadius: '20px',
                  padding: '25px 20px',
                  textAlign: 'center',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isDarkMode 
                    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                    : '0 8px 32px rgba(44, 122, 123, 0.1)'
                }}>
                  <div className="motivation-icon" style={{
                    fontSize: '3.5rem',
                    marginBottom: '20px',
                    display: 'block',
                    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
                  }}>💪</div>
                  <h3 style={{
                    color: isDarkMode ? 'var(--text-primary)' : 'var(--text-primary)',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    margin: '0 0 15px 0',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                    letterSpacing: '0.5px'
                  }}>Build Resilience</h3>
                  <p style={{
                    color: isDarkMode ? 'var(--text-secondary)' : 'var(--text-secondary)',
                    fontSize: '0.95rem',
                    lineHeight: '1.5',
                    margin: '0',
                    fontWeight: '400',
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                  }}>Develop healthy coping strategies for life's challenges</p>
                </div>
                
                <div className="motivation-card" style={{
                  background: isDarkMode 
                    ? 'linear-gradient(135deg, rgba(129, 230, 217, 0.1) 0%, rgba(129, 230, 217, 0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(44, 122, 123, 0.1) 0%, rgba(44, 122, 123, 0.05) 100%)',
                  backdropFilter: 'blur(25px)',
                  border: isDarkMode 
                    ? '1px solid rgba(129, 230, 217, 0.2)'
                    : '1px solid rgba(44, 122, 123, 0.2)',
                  borderRadius: '20px',
                  padding: '25px 20px',
                  textAlign: 'center',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isDarkMode 
                    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                    : '0 8px 32px rgba(44, 122, 123, 0.1)'
                }}>
                  <div className="motivation-icon" style={{
                    fontSize: '3.5rem',
                    marginBottom: '20px',
                    display: 'block',
                    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
                  }}>🌱</div>
                  <h3 style={{
                    color: isDarkMode ? 'var(--text-primary)' : 'var(--text-primary)',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    margin: '0 0 15px 0',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                    letterSpacing: '0.5px'
                  }}>Track Progress</h3>
                  <p style={{
                    color: isDarkMode ? 'var(--text-secondary)' : 'var(--text-secondary)',
                    fontSize: '0.95rem',
                    lineHeight: '1.5',
                    margin: '0',
                    fontWeight: '400',
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                  }}>See how far you've come in your mental wellness journey</p>
                </div>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="quick-actions-row">
              <div className="quick-action-card primary">
                <div className="action-icon">🎭</div>
                <div className="action-content">
                  <h3>How are you feeling?</h3>
                  <p>Share your current mood and thoughts</p>
                  <button className="action-button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    Track Now
                  </button>
                </div>
              </div>
              <div className="quick-action-card secondary">
                <div className="action-icon">📊</div>
                <div className="action-content">
                  <h3>Weekly Summary</h3>
                  <p>View your mood patterns this week</p>
                  <button className="action-button secondary" onClick={() => {
                    setActiveTab('analytics');
                    setTimeout(() => {
                      const analyticsSection = document.getElementById('analytics-section');
                      if (analyticsSection) {
                        analyticsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 100);
                  }}>
                    View Report
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}



        {activeTab === 'analytics' && (
          <div id="analytics-section" className="analytics-layout" style={{
            background: isDarkMode 
              ? 'rgba(26, 32, 44, 0.5)'
              : 'rgba(255, 255, 255, 0.5)',
            borderRadius: '20px',
            padding: '20px'
          }}>
                          <div className="analytics-header">
                <h2 style={{ color: isDarkMode ? 'var(--text-primary)' : 'var(--text-primary)' }}>📊 Mood Analytics</h2>
              </div>
            <div className="analytics-content">
              <div className="analytics-grid">
                <div className="analytics-item full-width">
                  <MoodErrorBoundary>
                    <MoodChart refreshTrigger={refreshTrigger} isDarkMode={isDarkMode} />
                  </MoodErrorBoundary>
                </div>
              </div>
            </div>


          </div>
        )}

        {activeTab === 'insights' && (
          <div className="insights-layout" style={{
            background: isDarkMode 
              ? 'rgba(26, 32, 44, 0.5)'
              : 'rgba(255, 255, 255, 0.5)',
            borderRadius: '20px',
            padding: '20px'
          }}>
                          <div className="insights-header">
                <h2 style={{ color: isDarkMode ? 'var(--text-primary)' : 'var(--text-primary)' }}>💡 Wellness Insights</h2>
                              <p style={{ color: isDarkMode ? 'var(--text-secondary)' : 'var(--text-secondary)' }}>Discover personalized recommendations and patterns</p>
            </div>
            <div className="insights-content">
              <MoodErrorBoundary>
                <MoodInsights refreshTrigger={refreshTrigger} />
              </MoodErrorBoundary>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: '75%' }}></div>
      </div>
    </div>
  );
};

export default MoodTracking;
