const nodemailer = require('nodemailer');

// Create reusable transporter object using the default SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // Your email
      pass: process.env.SMTP_PASSWORD // Your password or app password
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send email function
const sendEmail = async (options) => {
  try {
    // Create transporter
    const transporter = createTransporter();

    // Verify connection configuration
    await transporter.verify();

    // Define email options
    const mailOptions = {
      from: `"GlowSpace" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      to: options.email,
      subject: options.subject
    });
    
    return {
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully'
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    
    return {
      success: false,
      error: error.message,
      message: 'Failed to send email'
    };
  }
};

// Send verification email
const sendVerificationEmail = async (email, name, verificationToken) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - GlowSpace</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #4F46E5; }
        .button { display: inline-block; background-color: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🌟 GlowSpace</div>
        </div>
        
        <h2>Welcome to GlowSpace!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering with GlowSpace, your mental wellness companion. To complete your registration and start your journey toward better mental health, please verify your email address.</p>
        
        <div style="text-align: center;">
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
        </div>
        
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #4F46E5;">${verificationUrl}</p>
        
        <p>This verification link will expire in 24 hours for security reasons.</p>
        
        <p>If you didn't create an account with GlowSpace, please ignore this email.</p>
        
        <div class="footer">
          <p>Best regards,<br>The GlowSpace Team</p>
          <p style="font-size: 12px; color: #999;">This email was sent from GlowSpace Mental Health Platform</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    email,
    subject: 'Verify Your Email - GlowSpace',
    html: htmlContent
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, name, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - GlowSpace</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #4F46E5; }
        .button { display: inline-block; background-color: #EF4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 14px; }
        .warning { background-color: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🌟 GlowSpace</div>
        </div>
        
        <h2>Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password for your GlowSpace account. If you made this request, click the button below to reset your password.</p>
        
        <div style="text-align: center;">
          <a href="${resetUrl}" class="button">Reset Password</a>
        </div>
        
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #EF4444;">${resetUrl}</p>
        
        <div class="warning">
          <strong>⚠️ Important:</strong> This password reset link will expire in 10 minutes for security reasons.
        </div>
        
        <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
        
        <div class="footer">
          <p>Best regards,<br>The GlowSpace Team</p>
          <p style="font-size: 12px; color: #999;">This email was sent from GlowSpace Mental Health Platform</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    email,
    subject: 'Reset Your Password - GlowSpace',
    html: htmlContent
  });
};

// Send appointment confirmation email
const sendAppointmentConfirmationEmail = async (email, name, appointmentDetails) => {
  const { doctorName, appointmentDate, timeSlot, type, meetingLink } = appointmentDetails;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appointment Confirmed - GlowSpace</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #4F46E5; }
        .appointment-card { background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; background-color: #10B981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🌟 GlowSpace</div>
        </div>
        
        <h2>Appointment Confirmed</h2>
        <p>Hi ${name},</p>
        <p>Your appointment has been successfully scheduled. Here are your appointment details:</p>
        
        <div class="appointment-card">
          <h3>📅 Appointment Details</h3>
          <p><strong>Doctor:</strong> ${doctorName}</p>
          <p><strong>Date:</strong> ${new Date(appointmentDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${timeSlot}</p>
          <p><strong>Type:</strong> ${type}</p>
          ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
        </div>
        
        ${meetingLink ? `
          <div style="text-align: center;">
            <a href="${meetingLink}" class="button">Join Session</a>
          </div>
        ` : ''}
        
        <p>Please ensure you're available at the scheduled time. If you need to reschedule or cancel, please log in to your GlowSpace account.</p>
        
        <p>We look forward to supporting you on your mental wellness journey.</p>
        
        <div class="footer">
          <p>Best regards,<br>The GlowSpace Team</p>
          <p style="font-size: 12px; color: #999;">This email was sent from GlowSpace Mental Health Platform</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    email,
    subject: 'Appointment Confirmed - GlowSpace',
    html: htmlContent
  });
};

// Send reminder email
const sendReminderEmail = async (email, name, reminderDetails) => {
  const { type, message, actionUrl } = reminderDetails;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reminder - GlowSpace</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #4F46E5; }
        .button { display: inline-block; background-color: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🌟 GlowSpace</div>
        </div>
        
        <h2>Reminder: ${type}</h2>
        <p>Hi ${name},</p>
        <p>${message}</p>
        
        ${actionUrl ? `
          <div style="text-align: center;">
            <a href="${actionUrl}" class="button">Take Action</a>
          </div>
        ` : ''}
        
        <p>Taking care of your mental health is important. We're here to support you every step of the way.</p>
        
        <div class="footer">
          <p>Best regards,<br>The GlowSpace Team</p>
          <p style="font-size: 12px; color: #999;">This email was sent from GlowSpace Mental Health Platform</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    email,
    subject: `Reminder: ${type} - GlowSpace`,
    html: htmlContent
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAppointmentConfirmationEmail,
  sendReminderEmail
};
