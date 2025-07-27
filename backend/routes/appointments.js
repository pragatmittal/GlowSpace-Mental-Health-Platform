const express = require('express');
const router = express.Router();

// Import controllers
const {
  getUpcomingAppointments,
  scheduleAppointment,
  rescheduleAppointment,
  cancelAppointment,
  getAvailableSlots,
  getAppointmentHistory,
  getAppointmentDetails,
  updateAppointmentNotes
} = require('../controllers/appointmentController');

// Import middleware
const { protect } = require('../middlewares/auth');
const { validateAppointment } = require('../middlewares/validators');

// Protect all routes
router.use(protect);

// @route   GET /api/appointments/upcoming
// @desc    Get user's upcoming appointments
// @access  Private
router.get('/upcoming', getUpcomingAppointments);

// @route   GET /api/appointments/history
// @desc    Get user's appointment history
// @access  Private
router.get('/history', getAppointmentHistory);

// @route   GET /api/appointments/:id
// @desc    Get appointment details
// @access  Private
router.get('/:id', getAppointmentDetails);

// @route   POST /api/appointments
// @desc    Schedule a new appointment
// @access  Private
router.post('/', validateAppointment, scheduleAppointment);

// @route   PUT /api/appointments/:id/reschedule
// @desc    Reschedule an appointment
// @access  Private
router.put('/:id/reschedule', validateAppointment, rescheduleAppointment);

// @route   PUT /api/appointments/:id/cancel
// @desc    Cancel an appointment
// @access  Private
router.put('/:id/cancel', cancelAppointment);

// @route   PUT /api/appointments/:id/notes
// @desc    Update appointment notes
// @access  Private
router.put('/:id/notes', updateAppointmentNotes);

// @route   GET /api/appointments/slots/:doctorId
// @desc    Get available time slots for a doctor
// @access  Private
router.get('/slots/:doctorId', getAvailableSlots);

module.exports = router; 