const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @desc    Get user's upcoming appointments
// @route   GET /api/appointments/upcoming
// @access  Private
const getUpcomingAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentDate = new Date();

    const appointments = await Appointment.find({
      userId,
      appointmentDate: { $gte: currentDate },
      status: { $in: ['scheduled', 'confirmed'] },
      isActive: true
    })
    .populate('doctorId', 'name email avatar profile.specialization')
    .sort({ appointmentDate: 1, 'timeSlot.start': 1 })
    .limit(10);

    res.json({
      success: true,
      appointments: appointments
    });
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming appointments'
    });
  }
};

// @desc    Get user's appointment history
// @route   GET /api/appointments/history
// @access  Private
const getAppointmentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const appointments = await Appointment.find({
      userId,
      isActive: true
    })
    .populate('doctorId', 'name email avatar profile.specialization')
    .sort({ appointmentDate: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Appointment.countDocuments({
      userId,
      isActive: true
    });

    res.json({
      success: true,
      appointments: appointments,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching appointment history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment history'
    });
  }
};

// @desc    Get appointment details
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const appointment = await Appointment.findOne({
      _id: id,
      userId,
      isActive: true
    }).populate('doctorId', 'name email avatar profile.specialization');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      appointment: appointment
    });
  } catch (error) {
    console.error('Error fetching appointment details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment details'
    });
  }
};

// @desc    Schedule a new appointment
// @route   POST /api/appointments
// @access  Private
const scheduleAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { doctorId, appointmentDate, timeSlot, reason, type, isOnline } = req.body;

    // Check if doctor exists
    const doctor = await User.findOne({
      _id: doctorId,
      role: 'doctor',
      isActive: true
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if time slot is available
    const isAvailable = await Appointment.isSlotAvailable(
      doctorId,
      appointmentDate,
      timeSlot
    );

    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Selected time slot is not available'
      });
    }

    const appointment = new Appointment({
      userId,
      doctorId,
      appointmentDate,
      timeSlot,
      reason,
      type,
      isOnline
    });

    await appointment.save();

    // Populate doctor details
    await appointment.populate('doctorId', 'name email avatar profile.specialization');

    res.status(201).json({
      success: true,
      message: 'Appointment scheduled successfully',
      appointment: appointment
    });
  } catch (error) {
    console.error('Error scheduling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error scheduling appointment'
    });
  }
};

// @desc    Reschedule an appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Private
const rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { appointmentDate, timeSlot } = req.body;

    const appointment = await Appointment.findOne({
      _id: id,
      userId,
      status: { $in: ['scheduled', 'confirmed'] },
      isActive: true
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or cannot be rescheduled'
      });
    }

    // Check if new time slot is available
    const isAvailable = await Appointment.isSlotAvailable(
      appointment.doctorId,
      appointmentDate,
      timeSlot
    );

    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Selected time slot is not available'
      });
    }

    appointment.appointmentDate = appointmentDate;
    appointment.timeSlot = timeSlot;
    appointment.status = 'scheduled';

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      appointment: appointment
    });
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error rescheduling appointment'
    });
  }
};

// @desc    Cancel an appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const appointment = await Appointment.findOne({
      _id: id,
      userId,
      status: { $in: ['scheduled', 'confirmed'] },
      isActive: true
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or cannot be cancelled'
      });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling appointment'
    });
  }
};

// @desc    Update appointment notes
// @route   PUT /api/appointments/:id/notes
// @access  Private
const updateAppointmentNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { notes } = req.body;

    const appointment = await Appointment.findOne({
      _id: id,
      userId,
      isActive: true
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    appointment.notes.patient = notes;
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment notes updated successfully',
      appointment: appointment
    });
  } catch (error) {
    console.error('Error updating appointment notes:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating appointment notes'
    });
  }
};

// @desc    Get available time slots for a doctor
// @route   GET /api/appointments/slots/:doctorId
// @access  Private
const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }

    // Check if doctor exists
    const doctor = await User.findOne({
      _id: doctorId,
      role: 'doctor',
      isActive: true
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Generate available time slots (9 AM to 5 PM, 1-hour slots)
    const availableSlots = [];
    const startHour = 9;
    const endHour = 17;

    for (let hour = startHour; hour < endHour; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

      // Check if this slot is available
      const isAvailable = await Appointment.isSlotAvailable(
        doctorId,
        date,
        { start: startTime, end: endTime }
      );

      if (isAvailable) {
        availableSlots.push({
          start: startTime,
          end: endTime
        });
      }
    }

    res.json({
      success: true,
      availableSlots: availableSlots
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available slots'
    });
  }
};

module.exports = {
  getUpcomingAppointments,
  scheduleAppointment,
  rescheduleAppointment,
  cancelAppointment,
  getAvailableSlots,
  getAppointmentHistory,
  getAppointmentDetails,
  updateAppointmentNotes
}; 