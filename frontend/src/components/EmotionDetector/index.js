import React, { useState, useRef, useEffect } from 'react';
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

const EmotionDetector = () => {
  const { user } = useAuth();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  const [emotions, setEmotions] = useState({});
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [wellnessScore, setWellnessScore] = useState(0);

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
    };
  }, []);

  // Handle frame processing
  const processFrame = async () => {
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
        const { expressions } = detection;
        
        // Calculate normalized emotion scores
        const totalScore = Object.values(expressions).reduce((a, b) => a + b, 0);
        const normalizedEmotions = {};
        
        Object.entries(expressions).forEach(([emotion, score]) => {
          normalizedEmotions[emotion] = Math.round((score / totalScore) * 100);
      });

      // Update state
        setEmotions(normalizedEmotions);
        
        // Add to history
        setEmotionHistory(prev => [...prev, {
          timestamp: new Date(),
          emotions: normalizedEmotions
        }].slice(-30)); // Keep last 30 readings

      // Calculate wellness score
        const score = calculateWellnessScore(normalizedEmotions);
        setWellnessScore(score);

        // Draw face detection results
        const resizedDetection = faceapi.resizeResults(detection, displaySize);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetection);

        // Send data to backend every 5 seconds
        if (emotionHistory.length % 5 === 0) {
          await sendEmotionData(normalizedEmotions, score);
        }
      } else {
        setError('No face detected');
      }
    } catch (err) {
      setError('Error processing video frame');
      console.error('Frame processing error:', err);
    }
  };

  // Calculate wellness score
  const calculateWellnessScore = (emotions) => {
    const weights = {
      happy: 1.5,
      neutral: 1.0,
      surprised: 0.5,
      sad: -1.0,
      angry: -1.0,
      fearful: -1.0,
      disgusted: -1.0
    };

    let score = 50; // Base score
    Object.entries(emotions).forEach(([emotion, value]) => {
      score += (value * weights[emotion]) / 50;
    });

    return Math.max(0, Math.min(100, Math.round(score)));
  };

  // Send emotion data to backend
  const sendEmotionData = async (emotions, score) => {
    try {
      // Add to batch
      const currentBatch = {
        emotions,
        timestamp: new Date(),
        score
      };
      
      setEmotionHistory(prev => {
        const newHistory = [...prev, currentBatch];
        
        // Send batch every 10 readings or when stopping
        if (newHistory.length >= 10 || !isDetecting) {
          const batchData = {
        sessionId: sessionId || uuidv4(),
            readings: newHistory.map(reading => ({
              emotions: reading.emotions,
              wellnessScore: reading.score,
              timestamp: reading.timestamp
            })),
            metadata: {
              deviceInfo: navigator.userAgent,
              frameRate: 30,
              resolution: `${webcamRef.current?.video?.width}x${webcamRef.current?.video?.height}`
            }
          };

          emotionAPI.analyzeEmotion(batchData)
            .catch(err => {
              console.error('Error saving emotion data:', err);
              if (err.response?.status !== 429) { // Don't show error for rate limiting
                setError('Failed to save emotion data');
              }
            });

          // Keep only the last 30 readings for display
          return newHistory.slice(-30);
        }
        
        return newHistory;
      });
    } catch (err) {
      console.error('Error processing emotion data:', err);
      if (err.response?.status !== 429) { // Don't show error for rate limiting
        setError('Failed to process emotion data');
      }
    }
  };

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

    // Process frames at 30 FPS
    const interval = setInterval(processFrame, 1000 / 30);
    window.emotionDetectionInterval = interval;
  };

  // Stop detection
  const stopDetection = () => {
    setIsDetecting(false);
    if (window.emotionDetectionInterval) {
      clearInterval(window.emotionDetectionInterval);
    }
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
