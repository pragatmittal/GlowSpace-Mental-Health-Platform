import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { moodAPI } from '../../services/api';
import './MoodEntry.css';

const MoodEntry = ({ onMoodAdded }) => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [selectedMood, setSelectedMood] = useState(null);
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Enhanced mood options with contextual data
  const moodOptions = [
    { 
      value: 'very_happy', 
      emoji: '😄', 
      label: 'Very Happy', 
      color: '#27ae60',
      tags: ['Excited', 'Joyful', 'Thrilled', 'Ecstatic', 'Overjoyed', 'Delighted'],
      activities: ['Celebration', 'Social', 'Creative', 'Exercise', 'Family', 'Hobby']
    },
    { 
      value: 'happy', 
      emoji: '😊', 
      label: 'Happy', 
      color: '#2ecc71', 
      tags: ['Happy', 'Content', 'Pleased', 'Satisfied', 'Grateful', 'Blessed'],
      activities: ['Social', 'Hobby', 'Nature', 'Learning', 'Family', 'Creative']
    },
    { 
      value: 'neutral', 
      emoji: '😐', 
      label: 'Neutral', 
      color: '#f39c12', 
      tags: ['Calm', 'Balanced', 'Centered', 'Peaceful', 'Mindful', 'Present'],
      activities: ['Rest', 'Reading', 'Meditation', 'Nature', 'Indoor', 'Learning']
    },
    { 
      value: 'sad', 
      emoji: '😞', 
      label: 'Sad', 
      color: '#e74c3c', 
      tags: ['Down', 'Disappointed', 'Lonely', 'Tired', 'Stressed', 'Overwhelmed'],
      activities: ['Rest', 'Therapy', 'Alone', 'Indoor', 'Creative', 'Nature']
    },
    { 
      value: 'very_sad', 
      emoji: '😢', 
      label: 'Very Sad', 
      color: '#c0392b', 
      tags: ['Hopeless', 'Despair', 'Grief', 'Pain', 'Lost', 'Broken'],
      activities: ['Therapy', 'Rest', 'Alone', 'Support', 'Professional', 'Self-care']
    }
  ];

  // Set initial mood on component mount
  useEffect(() => {
    if (!selectedMood) {
      setSelectedMood(moodOptions[0]); // Default to very happy
    }
  }, []);

  // User authentication check
  useEffect(() => {
    if (!user) {
      console.warn('User not authenticated for mood entry');
    }
  }, [user]);

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    // Reset tags when mood changes
    setSelectedTags([]);
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAddCustomTag = (e) => {
    e.preventDefault();
    const input = e.target.elements.customTag;
    const newTag = input.value.trim();
    if (newTag && !selectedTags.includes(newTag) && selectedTags.length < 5) {
      setSelectedTags(prev => [...prev, newTag]);
      input.value = '';
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPhoto(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
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
        intensity: 5, // Default intensity for this design
        timeOfDay: getCurrentTimeOfDay(),
        activity: selectedTags.length > 0 ? 
          (selectedTags.includes('work') ? 'work' :
           selectedTags.includes('exercise') ? 'exercise' :
           selectedTags.includes('social') ? 'social' :
           selectedTags.includes('family') ? 'family' :
           selectedTags.includes('creative') ? 'creative' :
           selectedTags.includes('study') ? 'study' :
           selectedTags.includes('therapy') ? 'therapy' :
           'other') : 'other', // Map tags to valid activity values
        entryMethod: 'manual' // This is required by backend model
      };

      // Only add optional fields if they have content
      if (description && description.trim()) {
        moodData.notes = description.trim();
      }
      
      if (selectedTags.length > 0) {
        moodData.tags = selectedTags;
      }

      console.log('Sending mood data:', moodData);
      console.log('Selected mood:', selectedMood);
      console.log('Selected tags:', selectedTags);
      console.log('Entry method:', moodData.entryMethod);
      console.log('Activity:', moodData.activity);
      console.log('Time of day:', moodData.timeOfDay);
      console.log('Mood value being sent:', moodData.mood);
      console.log('Mood type:', typeof moodData.mood);

      // Test frontend validation first
      try {
        const { validateMoodData } = await import('../../utils/errorHandler');
        validateMoodData(moodData);
        console.log('Frontend validation passed');
      } catch (validationError) {
        console.error('Frontend validation failed:', validationError);
        throw validationError;
      }

      const response = await moodAPI.createEntry(moodData);
      console.log('Backend response:', response);
      console.log('Response data:', response?.data);
      console.log('Mood entry created successfully with ID:', response?.data?.data?.id || response?.data?.data?._id);

      // Show success state
      setShowSuccess(true);
      
      // Reset form
      setSelectedMood(moodOptions[0]);
      setDescription('');
      setSelectedTags([]);
      setPhoto(null);
      
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

      // Dispatch additional event for progress updates
      window.dispatchEvent(new CustomEvent('moodEntryAdded', {
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
    if (hour >= 18 && hour < 24) return 'evening';
    return 'night';
  };

  return (
    <div className="mood-entry-component">
      {/* Success Message */}
      {showSuccess && (
        <div className="success-message">
          <div className="success-content">
            <span className="success-icon"></span>
            <span>Mood saved successfully!</span>
          </div>
        </div>
      )}

      {/* Main Mood Entry Section */}
      <div className="mood-entry-section">
        <h2 className="section-title">How are you feeling today?</h2>
        
        {/* Mood Selection */}
        <div className="mood-selection">
          {moodOptions.map((mood) => (
            <button
              key={mood.value}
              className={`mood-emoji-btn ${selectedMood?.value === mood.value ? 'selected' : ''}`}
              onClick={() => handleMoodSelect(mood)}
              style={{ '--mood-color': mood.color }}
            >
              <span className="mood-emoji">{mood.emoji}</span>
            </button>
          ))}
        </div>

        {/* Mood Entry Card */}
        <div className="mood-entry-card">
          {/* Note Section */}
          <div className="note-section">
            <div className="section-header">
              <span className="section-icon"></span>
              <h3>Note</h3>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="How are you feeling? What's on your mind?"
              maxLength={500}
              rows={3}
            />
            <div className="character-count">
              {description.length}/500 characters
            </div>
          </div>

          {/* Tags Section */}
          <div className="tags-section">
            <div className="section-header">
              <span className="section-icon"></span>
              <h3>Tags</h3>
            </div>
            <div className="tags-container">
              {selectedTags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                  <button 
                    className="remove-tag" 
                    onClick={() => handleRemoveTag(tag)}
                  >
                    ×
                  </button>
                </span>
              ))}
              {selectedTags.length < 5 && (
                <form onSubmit={handleAddCustomTag} className="add-tag-form">
                  <input
                    name="customTag"
                    placeholder="Add tag"
                    maxLength={20}
                    className="add-tag-input"
                  />
                  <button type="submit" className="add-tag-btn">Add</button>
                </form>
              )}
            </div>
            
            {/* Suggested Tags based on mood */}
            {selectedMood && (
              <div className="suggested-tags">
                <p>Suggested tags:</p>
                <div className="tag-suggestions">
                  {selectedMood.tags.map((tag) => (
                    <button
                      key={tag}
                      className={`tag-suggestion ${selectedTags.includes(tag) ? 'selected' : ''}`}
                      onClick={() => handleTagToggle(tag)}
                      disabled={selectedTags.includes(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Photo Section */}
          <div className="photo-section">
            <div className="section-header">
              <span className="section-icon"></span>
              <h3>Photo</h3>
            </div>
            {photo ? (
              <div className="photo-preview">
                <img src={photo} alt="Mood photo" />
                <button className="remove-photo" onClick={handleRemovePhoto}>
                  Remove photo
                </button>
              </div>
            ) : (
              <div className="photo-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  id="photo-upload"
                  className="photo-input"
                />
                <label htmlFor="photo-upload" className="upload-label">
                  <span className="upload-icon"></span>
                  <span>Add a photo</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          className="submit-mood-btn"
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedMood}
        >
          {isSubmitting ? (
            <>
              <span className="loading-spinner"></span>
              Saving...
            </>
          ) : (
            'Save Mood'
          )}
        </button>
      </div>
    </div>
  );
};

export default MoodEntry;
