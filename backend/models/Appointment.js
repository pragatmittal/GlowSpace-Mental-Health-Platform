const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  appointmentDate: {
    type: Date,
    required: true,
    index: true
  },
  timeSlot: {
    start: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    end: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    }
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  type: {
    type: String,
    enum: ['consultation', 'therapy', 'follow_up', 'emergency'],
    default: 'consultation'
  },
  reason: {
    type: String,
    maxlength: 1000
  },
  notes: {
    patient: {
      type: String,
      maxlength: 1000
    },
    doctor: {
      type: String,
      maxlength: 1000
    }
  },
  sessionSummary: {
    duration: Number, // in minutes
    topics: [String],
    recommendations: String,
    nextAppointment: Date,
    prescriptions: [{
      medication: String,
      dosage: String,
      frequency: String,
      duration: String
    }]
  },
  meetingLink: {
    type: String,
    default: null
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
appointmentSchema.index({ userId: 1, appointmentDate: 1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointmentDate: 1, status: 1 });

// Virtual for formatted appointment time
appointmentSchema.virtual('formattedTime').get(function() {
  return `${this.timeSlot.start} - ${this.timeSlot.end}`;
});

// Virtual for appointment duration in minutes
appointmentSchema.virtual('duration').get(function() {
  const [startHour, startMin] = this.timeSlot.start.split(':').map(Number);
  const [endHour, endMin] = this.timeSlot.end.split(':').map(Number);
  return (endHour * 60 + endMin) - (startHour * 60 + startMin);
});

// Static method to check slot availability
appointmentSchema.statics.isSlotAvailable = async function(doctorId, appointmentDate, timeSlot) {
  const existingAppointment = await this.findOne({
    doctorId,
    appointmentDate,
    $or: [
      { 'timeSlot.start': { $lte: timeSlot.start }, 'timeSlot.end': { $gt: timeSlot.start } },
      { 'timeSlot.start': { $lt: timeSlot.end }, 'timeSlot.end': { $gte: timeSlot.end } },
      { 'timeSlot.start': { $gte: timeSlot.start }, 'timeSlot.end': { $lte: timeSlot.end } }
    ],
    status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
    isActive: true
  });

  return !existingAppointment;
};

// Static method to get doctor's appointments
appointmentSchema.statics.getDoctorAppointments = async function(doctorId, date) {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  return await this.find({
    doctorId,
    appointmentDate: { $gte: startDate, $lte: endDate },
    status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
    isActive: true
  }).populate('userId', 'name email avatar').sort({ 'timeSlot.start': 1 });
};

// Static method to get user's appointments
appointmentSchema.statics.getUserAppointments = async function(userId, limit = 10) {
  return await this.find({
    userId,
    isActive: true
  })
  .populate('doctorId', 'name email avatar profile.specialization')
  .sort({ appointmentDate: -1 })
  .limit(limit);
};

// Instance method to generate meeting link
appointmentSchema.methods.generateMeetingLink = function() {
  // In production, integrate with Zoom, Google Meet, or similar
  const baseUrl = process.env.MEETING_BASE_URL || 'https://meet.glowspace.com';
  this.meetingLink = `${baseUrl}/session/${this._id}`;
  return this.meetingLink;
};

// Pre-save middleware to generate meeting link for online appointments
appointmentSchema.pre('save', function(next) {
  if (this.isOnline && !this.meetingLink) {
    this.generateMeetingLink();
  }
  next();
});

// Ensure virtual fields are serialized
appointmentSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
