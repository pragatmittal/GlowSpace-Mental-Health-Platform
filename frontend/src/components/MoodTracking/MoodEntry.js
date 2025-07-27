import React, { useState, useRef, useEffect } from 'react';
import './MoodEntry.css';

const MoodEntry = () => {
  const [activeTab, setActiveTab] = useState('mood-wheel');
  const [moodData, setMoodData] = useState({
    mood: '',
    intensity: 5,
    moodWheel: { x: 0, y: 0, color: '#667eea', angle: 0, distance: 0 },
    timeOfDay: '',
    activity: '',
    socialContext: '',
    notes: '',
    tags: [],
    entryMethod: 'mood_wheel'
  });
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-detect time of day
  useEffect(() => {
    const hour = new Date().getHours();
    let timeOfDay = '';
    
    if (hour >= 6 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
    else if (hour >= 18 && hour < 24) timeOfDay = 'evening';
    else timeOfDay = 'night';
    
    setMoodData(prev => ({ ...prev, timeOfDay }));
  }, []);

  // Mood wheel colors
  const moodColors = {
    'very_happy': '#27ae60',
    'happy': '#2ecc71',
    'neutral': '#f1c40f',
    'sad': '#f39c12',
    'very_sad': '#e74c3c'
  };

  const moodLabels = {
    'very_happy': 'Very Happy',
    'happy': 'Happy',
    'neutral': 'Neutral',
    'sad': 'Sad',
    'very_sad': 'Very Sad'
  };

  const activities = [
    'work', 'study', 'exercise', 'social', 'relaxation', 'creative',
    'outdoor', 'indoor', 'travel', 'family', 'friends', 'alone', 'therapy', 'other'
  ];

  const socialContexts = [
    'alone', 'with_friends', 'with_family', 'at_work', 'in_public',
    'at_home', 'online', 'offline', 'mixed'
  ];

  const handleMoodWheelClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const x = (event.clientX - rect.left - centerX) / centerX;
    const y = (event.clientY - rect.top - centerY) / centerY;
    
    const distance = Math.sqrt(x * x + y * y);
    const angle = Math.atan2(y, x) * (180 / Math.PI);
    
    // Determine mood based on position
    let mood = 'neutral';
    let color = moodColors.neutral;
    
    if (distance > 0.3) {
      if (angle >= -45 && angle < 45) mood = 'very_happy';
      else if (angle >= 45 && angle < 135) mood = 'happy';
      else if (angle >= 135 || angle < -135) mood = 'neutral';
      else if (angle >= -135 && angle < -45) mood = 'sad';
      
      color = moodColors[mood];
    }
    
    setMoodData(prev => ({
      ...prev,
      mood,
      moodWheel: { x, y, color, angle, distance },
      entryMethod: 'mood_wheel'
    }));
  };

  const handleQuickMood = (mood) => {
    setMoodData(prev => ({
      ...prev,
      mood,
      entryMethod: 'quick_button'
    }));
  };

  const handleVoiceRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        
        const chunks = [];
        mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/wav' });
          // Here you would typically upload the blob to your server
          console.log('Voice recording completed:', blob);
        };
        
        mediaRecorderRef.current.start();
        setIsRecording(true);
        setRecordingTime(0);
        
        recordingIntervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Unable to access microphone. Please check permissions.');
      }
    } else {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      clearInterval(recordingIntervalRef.current);
      setIsRecording(false);
      setMoodData(prev => ({
        ...prev,
        entryMethod: 'voice'
      }));
    }
  };

  const handlePhotoCapture = () => {
    fileInputRef.current.click();
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
        setMoodData(prev => ({
          ...prev,
          entryMethod: 'photo'
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTagInput = (event) => {
    if (event.key === 'Enter' && event.target.value.trim()) {
      const newTag = event.target.value.trim();
      if (!moodData.tags.includes(newTag) && moodData.tags.length < 10) {
        setMoodData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
        event.target.value = '';
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setMoodData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async () => {
    if (!moodData.mood) {
      alert('Please select a mood before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Here you would call your API to save the mood entry
      console.log('Submitting mood data:', moodData);
      
      // Reset form
      setMoodData({
        mood: '',
        intensity: 5,
        moodWheel: { x: 0, y: 0, color: '#667eea', angle: 0, distance: 0 },
        timeOfDay: moodData.timeOfDay, // Keep time of day
        activity: '',
        socialContext: '',
        notes: '',
        tags: [],
        entryMethod: 'mood_wheel'
      });
      setPhotoPreview(null);
      
      alert('Mood entry saved successfully!');
    } catch (error) {
      console.error('Error saving mood entry:', error);
      alert('Error saving mood entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mood-entry">
      <div className="entry-header">
        <h2>Log Your Mood</h2>
        <p>Choose your preferred method to track how you're feeling</p>
      </div>

      {/* Entry Method Tabs */}
      <div className="entry-tabs">
        <button 
          className={`tab ${activeTab === 'mood-wheel' ? 'active' : ''}`}
          onClick={() => setActiveTab('mood-wheel')}
        >
          🎨 Mood Wheel
        </button>
        <button 
          className={`tab ${activeTab === 'quick' ? 'active' : ''}`}
          onClick={() => setActiveTab('quick')}
        >
          ⚡ Quick Entry
        </button>
        <button 
          className={`tab ${activeTab === 'voice' ? 'active' : ''}`}
          onClick={() => setActiveTab('voice')}
        >
          🎤 Voice Entry
        </button>
        <button 
          className={`tab ${activeTab === 'photo' ? 'active' : ''}`}
          onClick={() => setActiveTab('photo')}
        >
          📸 Photo Entry
        </button>
      </div>

      {/* Entry Content */}
      <div className="entry-content">
        {/* Mood Wheel Tab */}
        {activeTab === 'mood-wheel' && (
          <div className="mood-wheel-section">
            <div className="wheel-container">
              <canvas
                ref={canvasRef}
                width={300}
                height={300}
                onClick={handleMoodWheelClick}
                className="mood-wheel"
              />
              <div className="wheel-center">
                <div className="selected-mood">
                  {moodData.mood ? moodLabels[moodData.mood] : 'Select Mood'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Entry Tab */}
        {activeTab === 'quick' && (
          <div className="quick-entry-section">
            <div className="quick-mood-buttons">
              {Object.entries(moodLabels).map(([key, label]) => (
                <button
                  key={key}
                  className={`quick-mood-btn ${moodData.mood === key ? 'selected' : ''}`}
                  onClick={() => handleQuickMood(key)}
                  style={{ backgroundColor: moodData.mood === key ? moodColors[key] : '#f7fafc' }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Voice Entry Tab */}
        {activeTab === 'voice' && (
          <div className="voice-entry-section">
            <div className="voice-recorder">
              <button
                className={`record-button ${isRecording ? 'recording' : ''}`}
                onClick={handleVoiceRecording}
              >
                {isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
              </button>
              {isRecording && (
                <div className="recording-time">
                  Recording: {formatTime(recordingTime)}
                </div>
              )}
              <p className="voice-instructions">
                Click the button above to record your mood verbally. 
                Speak naturally about how you're feeling.
              </p>
            </div>
          </div>
        )}

        {/* Photo Entry Tab */}
        {activeTab === 'photo' && (
          <div className="photo-entry-section">
            <div className="photo-upload">
              <button className="photo-button" onClick={handlePhotoCapture}>
                📸 Take Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
              {photoPreview && (
                <div className="photo-preview">
                  <img src={photoPreview} alt="Mood photo" />
                </div>
              )}
              <p className="photo-instructions">
                Take a photo to capture your current mood through facial expression.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Contextual Information */}
      <div className="contextual-info">
        <h3>Additional Context</h3>
        
        {/* Intensity Slider */}
        <div className="intensity-section">
          <label>Mood Intensity: {moodData.intensity}/10</label>
          <input
            type="range"
            min="1"
            max="10"
            value={moodData.intensity}
            onChange={(e) => setMoodData(prev => ({ ...prev, intensity: parseInt(e.target.value) }))}
            className="intensity-slider"
          />
          <div className="intensity-labels">
            <span>Very Low</span>
            <span>Very High</span>
          </div>
        </div>

        {/* Activity Selection */}
        <div className="activity-section">
          <label>What were you doing?</label>
          <select
            value={moodData.activity}
            onChange={(e) => setMoodData(prev => ({ ...prev, activity: e.target.value }))}
          >
            <option value="">Select activity...</option>
            {activities.map(activity => (
              <option key={activity} value={activity}>
                {activity.charAt(0).toUpperCase() + activity.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Social Context */}
        <div className="social-section">
          <label>Social Context</label>
          <select
            value={moodData.socialContext}
            onChange={(e) => setMoodData(prev => ({ ...prev, socialContext: e.target.value }))}
          >
            <option value="">Select context...</option>
            {socialContexts.map(context => (
              <option key={context} value={context}>
                {context.replace('_', ' ').split(' ').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="notes-section">
          <label>Notes (optional)</label>
          <textarea
            value={moodData.notes}
            onChange={(e) => setMoodData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="How are you feeling? Any specific thoughts or events?"
            maxLength={1000}
            rows={4}
          />
          <div className="notes-counter">
            {moodData.notes.length}/1000 characters
          </div>
        </div>

        {/* Tags */}
        <div className="tags-section">
          <label>Tags (optional)</label>
          <input
            type="text"
            placeholder="Press Enter to add tags..."
            onKeyPress={handleTagInput}
            maxLength={20}
          />
          <div className="tags-container">
            {moodData.tags.map(tag => (
              <span key={tag} className="tag">
                {tag}
                <button onClick={() => removeTag(tag)}>×</button>
              </span>
            ))}
          </div>
          <div className="tags-info">
            {moodData.tags.length}/10 tags
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="submit-section">
        <button
          className="submit-button"
          onClick={handleSubmit}
          disabled={!moodData.mood || isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Mood Entry'}
        </button>
      </div>
    </div>
  );
};

export default MoodEntry; 