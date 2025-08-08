import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as faceapi from '@vladmandic/face-api';
import Webcam from 'react-webcam';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { v4 as uuidv4 } from 'uuid';
import { emotionAPI } from '../../services/api';
import './EmotionDetector.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Request Manager Class for handling API calls
class RequestManager {
  constructor() {
    this.pendingRequest = false;
    this.requestQueue = [];
    this.lastRequestTime = 0;
    this.rateLimitWindow = 10000; // 10 seconds
    this.maxRequests = 5;
    this.requestHistory = [];
  }

  canMakeRequest() {
    const now = Date.now();
    // Clean old requests from history
    this.requestHistory = this.requestHistory.filter(time => now - time < this.rateLimitWindow);
    
    return !this.pendingRequest && this.requestHistory.length < this.maxRequests;
  }

  async makeRequest(requestFn) {
    if (!this.canMakeRequest()) {
      console.log('Rate limit reached or request pending, skipping');
      return false;
    }

    this.pendingRequest = true;
    this.lastRequestTime = Date.now();
    this.requestHistory.push(this.lastRequestTime);

    try {
      await requestFn();
      return true;
    } catch (error) {
      console.error('Request failed:', error);
      if (error.response?.status === 429) {
        // Remove the failed request from history to allow retry
        this.requestHistory = this.requestHistory.filter(time => time !== this.lastRequestTime);
      }
      throw error;
    } finally {
      this.pendingRequest = false;
    }
  }

  reset() {
    this.pendingRequest = false;
    this.requestQueue = [];
    this.requestHistory = [];
  }
}

// Frame Buffer Class for collecting emotion data
class FrameBuffer {
  constructor() {
    this.buffer = [];
    this.lastSendTime = 0;
    this.sendInterval = 5000; // 5 seconds
  }

  addFrame(emotions, score) {
    this.buffer.push({
      emotions,
      score,
      timestamp: new Date()
    });
  }

  shouldSend() {
    const now = Date.now();
    return this.buffer.length > 0 && (now - this.lastSendTime >= this.sendInterval);
  }

  getBatch() {
    if (this.buffer.length === 0) return null;
    
    const batch = [...this.buffer];
    this.buffer = [];
    this.lastSendTime = Date.now();
    return batch;
  }

  reset() {
    this.buffer = [];
    this.lastSendTime = 0;
  }
}

const EmotionDetector = () => {
  const { user } = useAuth();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Request and buffer managers
  const requestManager = useRef(new RequestManager());
  const frameBuffer = useRef(new FrameBuffer());
  
  // State management
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  const [emotions, setEmotions] = useState({});
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [wellnessScore, setWellnessScore] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const [bufferSize, setBufferSize] = useState(0);
  
  // Frame counter ref for accurate counting
  const frameCounter = useRef(0);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setError(null);
        // Set the models path
        const modelsPath = `${process.env.PUBLIC_URL}/models`;
        
        // Load models with proper paths
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(modelsPath),
          faceapi.nets.faceExpressionNet.loadFromUri(modelsPath)
        ]);
        
        console.log('Models loaded successfully');
        setIsModelLoaded(true);
      } catch (err) {
        console.error('Model loading error:', err);
        setError('Failed to load emotion detection models. Please refresh the page and try again.');
      }
    };

    loadModels();
    
    // Cleanup function
    return () => {
      // Stop detection if running
      if (window.emotionDetectionInterval) {
        clearInterval(window.emotionDetectionInterval);
      }
      
      // Destroy any existing charts
      const chartInstance = ChartJS.getChart("emotion-chart");
      if (chartInstance) {
        chartInstance.destroy();
      }
      
      // Reset managers
      requestManager.current.reset();
      frameBuffer.current.reset();
    };
  }, []);

  // Update request count and buffer size when they change
  useEffect(() => {
    const interval = setInterval(() => {
      setRequestCount(requestManager.current.requestHistory.length);
      setBufferSize(frameBuffer.current.buffer.length);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Send emotion data with proper rate limiting
  const sendEmotionData = useCallback(async (batchData) => {
    try {
      const success = await requestManager.current.makeRequest(async () => {
        console.log('Sending emotion data batch:', batchData.readings.length, 'readings');
        await emotionAPI.analyzeEmotion(batchData);
        console.log('Emotion data sent successfully');
      });

      if (success) {
        setIsRateLimited(false);
        setRequestCount(requestManager.current.requestHistory.length);
        if (error && error.includes('rate limit')) {
          setError(null);
        }
      }
    } catch (err) {
      console.error('Error saving emotion data:', err);
      if (err.response?.status === 429) {
        setError('Sending data too frequently. Please wait a moment...');
        setIsRateLimited(true);
        setTimeout(() => {
          setError(null);
          setIsRateLimited(false);
        }, 3000);
      } else {
        setError('Failed to save emotion data');
      }
    }
  }, [error]);

  // Handle frame processing
  const processFrame = useCallback(async () => {
    if (!webcamRef.current || !canvasRef.current || !isModelLoaded) return;

    try {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;

      // Wait for video to be ready
      if (!video.videoWidth || !video.videoHeight) {
        requestAnimationFrame(processFrame);
        return;
      }
      
      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      
      // Match canvas size to video
      if (canvas.width !== displaySize.width || canvas.height !== displaySize.height) {
        canvas.width = displaySize.width;
        canvas.height = displaySize.height;
      }

      // Detect face and expressions
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detection) {
        // Clear any previous error when face is detected
        setError(null);
        
        const { expressions } = detection;
        
        // Calculate normalized emotion scores
        const totalScore = Object.values(expressions).reduce((a, b) => a + b, 0);
        const normalizedEmotions = {};
        
        Object.entries(expressions).forEach(([emotion, score]) => {
          normalizedEmotions[emotion] = Math.round((score / totalScore) * 100);
        });

        // Update state
        setEmotions(normalizedEmotions);
        
        // Calculate wellness score
        const score = calculateWellnessScore(normalizedEmotions);
        setWellnessScore(score);

        // Add to frame buffer
        frameBuffer.current.addFrame(normalizedEmotions, score);
        
        // Update emotion history for display
        setEmotionHistory(prev => [...prev, {
          timestamp: new Date(),
          emotions: normalizedEmotions
        }].slice(-30));

        // Draw face detection results
        const resizedDetection = faceapi.resizeResults(detection, displaySize);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetection);

        // Check if we should send data
        if (frameBuffer.current.shouldSend()) {
          const batch = frameBuffer.current.getBatch();
          if (batch && batch.length > 0) {
            const batchData = {
              sessionId: sessionId || uuidv4(),
              readings: batch.map(reading => ({
                emotions: reading.emotions,
                wellnessScore: reading.score,
                timestamp: reading.timestamp
              })),
              metadata: {
                deviceInfo: navigator.userAgent,
                frameRate: 15,
                resolution: `${webcamRef.current?.video?.width}x${webcamRef.current?.video?.height}`
              }
            };
            
            await sendEmotionData(batchData);
          }
        }
      } else {
        setError('No face detected');
      }
    } catch (err) {
      setError('Error processing video frame');
      console.error('Frame processing error:', err);
    }
  }, [isModelLoaded, sessionId, sendEmotionData]);

  // Calculate wellness score
 // ... existing code ...

// Calculate wellness score with dynamic response
const calculateWellnessScore = (emotions) => {
  // Dynamic weights based on emotion intensity
  const getDynamicWeight = (emotion, value) => {
    const baseWeights = {
      happy: 3.0,      // Strong positive for happy
      neutral: 1.0,    // Moderate positive for neutral
      surprised: 0.5,  // Small positive for surprised
      sad: -2.0,       // Strong negative for sad
      angry: -3.5,     // Very strong negative for angry
      fearful: -2.0,   // Strong negative for fearful
      disgusted: -2.0  // Strong negative for disgusted
    };

    // Scale weight based on emotion intensity (more pronounced = stronger effect)
    const intensityMultiplier = value / 100; // 0 to 1
    return baseWeights[emotion] * intensityMultiplier;
  };

  let score = 50; // Start with neutral score
  
  Object.entries(emotions).forEach(([emotion, value]) => {
    if (value > 0) { // Only process emotions with some presence
      const dynamicWeight = getDynamicWeight(emotion, value);
      const impact = (value * dynamicWeight) / 10; // More sensitive scaling
      score += impact;
    }
  });

  // Ensure score stays within 0-100 range
  return Math.max(0, Math.min(100, Math.round(score)));
};

// ... existing code ...

  // Start detection
  const startDetection = async () => {
    if (!isModelLoaded) {
      setError('Please wait for models to load');
      return;
    }
    
    setError(null);
    setSessionId(uuidv4());
    setIsDetecting(true);
    setEmotionHistory([]);
    setIsRateLimited(false);
    
    // Reset managers
    requestManager.current.reset();
    frameBuffer.current.reset();
    frameCounter.current = 0;
    setRequestCount(0);
    setBufferSize(0);

    // Process frames at 15 FPS
    const interval = setInterval(processFrame, 1000 / 15);
    window.emotionDetectionInterval = interval;
  };

  // Stop detection
  const stopDetection = () => {
    setIsDetecting(false);
    if (window.emotionDetectionInterval) {
      clearInterval(window.emotionDetectionInterval);
    }
    
    // Send any remaining data in buffer
    const remainingBatch = frameBuffer.current.getBatch();
    if (remainingBatch && remainingBatch.length > 0) {
      const batchData = {
        sessionId: sessionId || uuidv4(),
        readings: remainingBatch.map(reading => ({
          emotions: reading.emotions,
          wellnessScore: reading.score,
          timestamp: reading.timestamp
        })),
        metadata: {
          deviceInfo: navigator.userAgent,
          frameRate: 15,
          resolution: `${webcamRef.current?.video?.width}x${webcamRef.current?.video?.height}`
        }
      };
      
      sendEmotionData(batchData);
    }
    
    // Clear rate limiting state
    setIsRateLimited(false);
    setRequestCount(0);
    setBufferSize(0);
  };

  // Download session data
  const downloadData = () => {
    const data = JSON.stringify({
      sessionId,
      timestamp: new Date(),
      emotionHistory,
      averageWellnessScore: emotionHistory.reduce((acc, curr) => acc + calculateWellnessScore(curr.emotions), 0) / emotionHistory.length
    }, null, 2);

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emotion-session-${sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="emotion-detector">
      <div className="detector-header">
        <h2>Emotion Detection</h2>
        <p>Real-time emotion analysis using facial expressions</p>
      </div>

      <div className="detector-content">
        <div className="video-container">
          {showVideo && (
            <Webcam
              ref={webcamRef}
              mirrored
              className="webcam"
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: 640,
                height: 480,
                facingMode: "user"
              }}
            />
          )}
          <canvas ref={canvasRef} className="detection-canvas" />
          
          {error && (
            <div className="error-message">
              <p>{error}</p>
                </div>
              )}
          
          {isRateLimited && (
            <div className="rate-limit-indicator">
              <p>⏳ Rate limited - waiting for cooldown</p>
            </div>
          )}
          
          <div className="status-indicator">
            <p>📊 API Calls: {requestCount}/5 (10s window)</p>
            <p>🔄 Buffer: {bufferSize} frames</p>
          </div>
            </div>

        <div className="controls">
                <button
            onClick={isDetecting ? stopDetection : startDetection}
            className={`control-button ${isDetecting ? 'stop' : 'start'}`}
            disabled={!isModelLoaded}
          >
            {isDetecting ? 'Stop Detection' : 'Start Detection'}
                </button>
              
              <button
                onClick={() => setShowVideo(!showVideo)}
            className="control-button"
              >
            {showVideo ? 'Hide Video' : 'Show Video'}
              </button>
              
          {emotionHistory.length > 0 && (
                <button
              onClick={downloadData}
              className="control-button download"
                >
              Download Session Data
                </button>
              )}
          </div>

        <div className="results">
          <div className="current-emotions">
            <h3>Current Emotions</h3>
            <div className="emotion-bars">
              {Object.entries(emotions).map(([emotion, value]) => (
                <div key={emotion} className="emotion-bar">
                  <span className="emotion-label">{emotion}</span>
                  <div className="bar-container">
                    <div
                      className="bar-fill"
                      style={{ width: `${value}%` }}
                    />
                </div>
                  <span className="emotion-value">{value}%</span>
                </div>
              ))}
              </div>
            </div>

          <div className="wellness-score">
            <h3>Wellness Score</h3>
            <div className="score-display">
              <div className="score-value">{wellnessScore}</div>
              <div className="score-label">/100</div>
              </div>
            </div>

          {emotionHistory.length > 0 && (
            <div className="emotion-chart">
              <h3>Emotion Trends</h3>
              <Line
                id="emotion-chart"
                data={{
                  labels: emotionHistory.map((_, i) => i + 1),
                  datasets: Object.keys(emotions).map(emotion => ({
                    label: emotion,
                    data: emotionHistory.map(entry => entry.emotions[emotion]),
                    borderColor: getEmotionColor(emotion),
                    backgroundColor: getEmotionColor(emotion),
                    tension: 0.4,
                    fill: false
                  }))
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        usePointStyle: true,
                        padding: 20
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      title: {
                        display: true,
                        text: 'Emotion Intensity (%)'
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Time'
                      }
                    }
                  }
                }}
              />
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

const getEmotionColor = (emotion) => {
  const colors = {
    happy: '#4CAF50',
    sad: '#2196F3',
    angry: '#F44336',
    fearful: '#9C27B0',
    disgusted: '#FF9800',
    surprised: '#00BCD4',
    neutral: '#9E9E9E'
  };
  return colors[emotion] || '#9E9E9E';
};

export default EmotionDetector;
