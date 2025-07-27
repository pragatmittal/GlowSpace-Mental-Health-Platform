import React, { useState } from 'react';
import { moodAPI } from '../../services/api';
import './QuickMoodEntry.css';

const QuickMoodEntry = ({ onEntryCreated }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const moodOptions = [
    { value: 'very_happy', emoji: '😄', label: 'Very Happy', color: '#27ae60' },
    { value: 'happy', emoji: '😊', label: 'Happy', color: '#2ecc71' },
    { value: 'neutral', emoji: '😐', label: 'Neutral', color: '#f1c40f' },
    { value: 'sad', emoji: '😔', label: 'Sad', color: '#f39c12' },
    { value: 'very_sad', emoji: '😢', label: 'Very Sad', color: '#e74c3c' }
  ];

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    if (!showDetails) {
      setShowDetails(true);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMood) return;

    try {
      setLoading(true);

      const entryData = {
        mood: selectedMood.value,
        intensity,
        notes: notes.trim() || undefined,
        activity: 'other',
        socialContext: 'alone',
        entryMethod: 'quick_button'
      };

      await moodAPI.createEntry(entryData);

      // Reset form
      setSelectedMood(null);
      setIntensity(5);
      setNotes('');
      setShowDetails(false);

      // Notify parent
      if (onEntryCreated) {
        onEntryCreated();
      }

    } catch (error) {
      console.error('Error creating mood entry:', error);
      alert('Failed to save mood entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSubmit = async (mood) => {
    try {
      setLoading(true);

      const entryData = {
        mood: mood.value,
        intensity: 5,
        activity: 'other',
        socialContext: 'alone',
        entryMethod: 'quick_button'
      };

      await moodAPI.createEntry(entryData);

      // Notify parent
      if (onEntryCreated) {
        onEntryCreated();
      }

    } catch (error) {
      console.error('Error creating quick mood entry:', error);
      alert('Failed to save mood entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quick-mood-entry">
      {/* Quick Mood Buttons */}
      <div className="mood-buttons">
        {moodOptions.map((mood) => (
          <button
            key={mood.value}
            className={`mood-button ${selectedMood?.value === mood.value ? 'selected' : ''}`}
            onClick={() => handleMoodSelect(mood)}
            style={{ 
              borderColor: selectedMood?.value === mood.value ? mood.color : 'transparent',
              backgroundColor: selectedMood?.value === mood.value ? `${mood.color}20` : 'rgba(255, 255, 255, 0.2)'
            }}
          >
            <span className="mood-emoji">{mood.emoji}</span>
            <span className="mood-label">{mood.label}</span>
          </button>
        ))}
      </div>

      {/* Quick Submit Buttons */}
      <div className="quick-submit-buttons">
        <p className="quick-submit-text">Or quickly log your mood:</p>
        <div className="quick-buttons">
          {moodOptions.map((mood) => (
            <button
              key={`quick-${mood.value}`}
              className="quick-submit-button"
              onClick={() => handleQuickSubmit(mood)}
              disabled={loading}
              style={{ backgroundColor: mood.color }}
            >
              {mood.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Detailed Entry Form */}
      {showDetails && selectedMood && (
        <div className="detailed-entry">
          <div className="entry-header">
            <h3>Add Details</h3>
            <button 
              className="close-button"
              onClick={() => setShowDetails(false)}
            >
              ×
            </button>
          </div>

          <div className="entry-content">
            {/* Selected Mood Display */}
            <div className="selected-mood-display">
              <span className="selected-emoji">{selectedMood.emoji}</span>
              <span className="selected-label">{selectedMood.label}</span>
            </div>

            {/* Intensity Slider */}
            <div className="intensity-section">
              <label htmlFor="intensity">Intensity: {intensity}/10</label>
              <input
                type="range"
                id="intensity"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="intensity-slider"
              />
              <div className="intensity-labels">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            {/* Notes */}
            <div className="notes-section">
              <label htmlFor="notes">Notes (optional)</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How are you feeling? What's on your mind?"
                maxLength="500"
                rows="3"
                className="notes-textarea"
              />
              <div className="notes-counter">
                {notes.length}/500
              </div>
            </div>

            {/* Submit Button */}
            <button
              className="submit-button"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Mood Entry'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickMoodEntry; 