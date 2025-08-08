import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentAPI } from '../../services/api';
import './UpcomingAppointments.css';

const UpcomingAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { apiRequest } = useAuth();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getUpcoming();
      const data = response.data;
      
      if (data.success) {
        setAppointments(data.appointments || []);
        setError(null);
      } else {
        setError(data.message || 'Failed to load appointments');
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
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