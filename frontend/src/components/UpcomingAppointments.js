import React, { useState, useEffect } from 'react';
import { appointmentAPI } from '../services/api';
import './UpcomingAppointments.css';

const UpcomingAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getUpcoming();
      setAppointments(response.data.appointments);
      setError(null);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const handleJoinSession = (appointmentId) => {
    // TODO: Implement join session logic
    console.log('Joining session for appointment:', appointmentId);
  };

  const handleReschedule = async (appointmentId) => {
    try {
      await appointmentAPI.reschedule(appointmentId);
      await fetchAppointments(); // Refresh the list
    } catch (err) {
      console.error('Error rescheduling appointment:', err);
      setError('Failed to reschedule appointment');
    }
  };

  const handleCancel = async (appointmentId) => {
    try {
      await appointmentAPI.cancel(appointmentId);
      await fetchAppointments(); // Refresh the list
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError('Failed to cancel appointment');
    }
  };

  if (loading) {
    return (
      <div className="upcoming-appointments">
        <div className="appointments-header">
          <h3>Upcoming Appointments</h3>
        </div>
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
        <div className="appointments-header">
          <h3>Upcoming Appointments</h3>
        </div>
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
          <button className="schedule-btn">Schedule Session</button>
        </div>
      ) : (
        <div className="appointments-list">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="appointment-card">
              <div className="appointment-main">
                <div className="therapist-info">
                  <img
                    src={appointment.avatar}
                    alt={appointment.therapistName}
                    className="therapist-avatar"
                  />
                  <div className="therapist-details">
                    <h4>{appointment.therapistName}</h4>
                    <p className="specialty">{appointment.therapistSpecialty}</p>
                  </div>
                </div>
                
                <div className="appointment-details">
                  <div className="date-time">
                    <span className="date">{formatDate(appointment.date)}</span>
                    <span className="time">{appointment.time}</span>
                  </div>
                  <div className="appointment-meta">
                    <span className="type">{appointment.type}</span>
                    <span 
                      className="status"
                      style={{ color: getStatusColor(appointment.status) }}
                    >
                      {appointment.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="appointment-actions">
                {appointment.type === 'Video Call' && appointment.status === 'confirmed' && (
                  <button
                    className="join-btn"
                    onClick={() => handleJoinSession(appointment.id)}
                  >
                    Join Session
                  </button>
                )}
                <button
                  className="reschedule-btn"
                  onClick={() => handleReschedule(appointment.id)}
                >
                  Reschedule
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => handleCancel(appointment.id)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="appointments-footer">
        <button className="schedule-new-btn">
          + Schedule New Appointment
        </button>
      </div>
    </div>
  );
};

export default UpcomingAppointments;
