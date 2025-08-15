import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentAPI } from '../../services/apiWrapper';
import './UpcomingAppointments.css';

const UpcomingAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { apiRequest } = useAuth();
  
  // Refs for cleanup and preventing multiple calls
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);
  const lastFetchTimeRef = useRef(0);

  useEffect(() => {
    isMountedRef.current = true;
    fetchAppointments();
    
    return () => {
      isMountedRef.current = false;
      
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Empty dependency array - only run once

  const fetchAppointments = async () => {
    const now = Date.now();
    const minInterval = 5000; // Minimum 5 seconds between fetches
    
    // Prevent too frequent calls
    if (now - lastFetchTimeRef.current < minInterval) {
      console.log('⏳ UpcomingAppointments fetch skipped - too frequent');
      return;
    }
    
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    lastFetchTimeRef.current = now;

    try {
      if (!isMountedRef.current) return;
      
      setLoading(true);
      const response = await appointmentAPI.getUpcoming();
      
      if (!isMountedRef.current) return;
      
      const data = response.data;
      
      if (data.success) {
        setAppointments(data.appointments || []);
        setError(null);
      } else {
        setError(data.message || 'Failed to load appointments');
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('🚫 UpcomingAppointments fetch aborted');
        return;
      }
      
      console.error('Error fetching appointments:', err);
      if (isMountedRef.current) {
        if (err.message.includes('Too many requests') || err.message.includes('429')) {
          setError('Server is busy. Appointments will be available shortly.');
        } else {
          setError('Failed to load appointments. Please try again.');
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      abortControllerRef.current = null;
    }
  };

  if (loading) {
    return (
      <div className="upcoming-appointments">
        <div className="appointments-loading">
          <div className="loading-spinner"></div>
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="upcoming-appointments">
        <div className="appointments-error">
          <p>{error}</p>
          <button onClick={fetchAppointments} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="upcoming-appointments">
      <div className="appointments-header">
        <h3>Upcoming Appointments</h3>
        <button className="view-all-btn">View All</button>
      </div>

      {appointments.length === 0 ? (
        <div className="no-appointments">
          <div className="no-appointments-icon">📅</div>
          <p>No upcoming appointments</p>
          <button className="schedule-btn">Schedule Now</button>
        </div>
      ) : (
        <div className="appointments-list">
          {appointments.map((appointment) => (
            <div key={appointment._id} className="appointment-card">
              <div className="appointment-main">
                <div className="therapist-info">
                  <img
                    src={appointment.doctorId.avatar}
                    alt={appointment.doctorId.name}
                    className="therapist-avatar"
                  />
                  <div className="therapist-details">
                    <h4>{appointment.doctorId.name}</h4>
                    <span className="specialty">{appointment.doctorId.profile.specialization}</span>
                  </div>
                </div>
                
                <div className="appointment-details">
                  <div className="date-time">
                    <span className="date">{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                    <span className="time">{appointment.timeSlot.start} - {appointment.timeSlot.end}</span>
                  </div>
                  
                  <div className="appointment-meta">
                    <span className="type">{appointment.type}</span>
                    <span className="status">{appointment.status}</span>
                  </div>
                </div>
              </div>

              <div className="appointment-actions">
                {appointment.isOnline && (
                  <button className="join-btn">Join Session</button>
                )}
                <button className="reschedule-btn">Reschedule</button>
                <button className="cancel-btn">Cancel</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingAppointments; 