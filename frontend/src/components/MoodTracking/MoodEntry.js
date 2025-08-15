import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { moodAPI } from '../../services/api';
import './MoodEntry.css';

const MoodEntry = ({ onMoodAdded }) => {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState(null);
  const [description, setDescription] = useState('');
  const [quote, setQuote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Mood options with emojis
  const moodOptions = [
    { value: 'very_sad', emoji: '😢', label: 'Very Sad', color: '#e74c3c', value_num: 1 },
    { value: 'sad', emoji: '😞', label: 'Sad', color: '#f39c12', value_num: 2 },
    { value: 'neutral', emoji: '😐', label: 'Neutral', color: '#f1c40f', value_num: 3 },
    { value: 'happy', emoji: '😊', label: 'Happy', color: '#2ecc71', value_num: 4 },
    { value: 'very_happy', emoji: '😄', label: 'Very Happy', color: '#27ae60', value_num: 5 }
  ];

  // Inspirational quotes array
  const inspirationalQuotes = [
    "Every day is a new beginning. Take a deep breath and start again.",
    "You are stronger than you know and more capable than you imagine.",
    "Progress, not perfection, is the goal.",
    "Your feelings are valid and temporary.",
    "One small positive thought in the morning can change your whole day.",
    "You are worthy of love and kindness, especially from yourself.",
    "It's okay to not be okay. What matters is that you're trying.",
    "Every sunset brings the promise of a new dawn.",
    "You have survived 100% of your bad days. You're doing great.",
    "Healing is not a destination, it's a journey."
  ];

  // Set random quote on component mount
  useEffect(() => {
    const randomQuote = inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)];
    setQuote(randomQuote);
  }, []);

  // User authentication check
  useEffect(() => {
    if (!user) {
      console.warn('User not authenticated for mood entry');
    }
  }, [user]);

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedMood) {
      alert('Please select a mood before submitting.');
      return;
    }

    if (!user) {
      alert('You must be logged in to track your mood.');
      return;
    }

    setIsSubmitting(true);

    try {
      const moodData = {
        mood: selectedMood.value,
        intensity: selectedMood.value_num * 2, // Convert 1-5 to 2-10 scale
        notes: description,
        timeOfDay: getCurrentTimeOfDay(),
        activity: 'other',
        socialContext: 'alone',
        entryMethod: 'manual',
        quote: {
          text: quote,
          author: 'Anonymous'
        }
      };

      await moodAPI.createEntry(moodData);

      // Show success state
      setShowSuccess(true);
      
      // Reset form
      setSelectedMood(null);
      setDescription('');
      
      // Generate new quote
      const newQuote = inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)];
      setQuote(newQuote);

      // Notify parent component
      if (onMoodAdded) {
        onMoodAdded();
      }

      // Dispatch global event for dashboard sync
      window.dispatchEvent(new CustomEvent('moodDataUpdated', {
        detail: { 
          action: 'create',
          moodData: moodData,
          timestamp: new Date().toISOString()
        }
      }));

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Error submitting mood:', error);
      alert('Failed to save mood entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  };

  return (
    <div className="mood-entry-component">
      {/* Header */}
      <div className="mood-entry-header">
        <h2>🎭 How are you feeling right now?</h2>
        <p>Select your current mood and share what's on your mind</p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="success-message">
          <div className="success-content">
            <span className="success-icon">✅</span>
            <span>Mood saved successfully!</span>
          </div>
        </div>
      )}

      {/* Mood Selection */}
      <div className="mood-selection">
        <h3>Select Your Mood</h3>
        <div className="mood-grid">
          {moodOptions.map((mood) => (
            <button
              key={mood.value}
              className={`mood-button ${selectedMood?.value === mood.value ? 'selected' : ''}`}
              onClick={() => handleMoodSelect(mood)}
              style={{
                backgroundColor: selectedMood?.value === mood.value ? mood.color : 'transparent',
                borderColor: mood.color,
                color: selectedMood?.value === mood.value ? 'white' : mood.color
              }}
            >
              <span className="mood-emoji">{mood.emoji}</span>
              <span className="mood-label">{mood.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="mood-description">
        <h3>Describe Your Feelings (Optional)</h3>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's making you feel this way? Share any thoughts or experiences..."
          maxLength={500}
          rows={4}
        />
        <div className="character-count">
          {description.length}/500 characters
        </div>
      </div>

      {/* Inspirational Quote */}
      <div className="inspirational-quote">
        <div className="quote-content">
          <span className="quote-icon">💭</span>
          <p className="quote-text">"{quote}"</p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="submit-section">
        <button
          onClick={handleSubmit}
          disabled={!selectedMood || isSubmitting}
          className={`submit-button ${selectedMood ? 'active' : 'disabled'}`}
          style={{
            backgroundColor: selectedMood ? selectedMood.color : '#ddd'
          }}
        >
          {isSubmitting ? (
            <>
              <span className="loading-spinner-small"></span>
              Saving...
            </>
          ) : (
            <>
              <span>💾</span>
              Save Mood Entry
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MoodEntry;
