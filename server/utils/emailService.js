const nodemailer = require("nodemailer")

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  async sendAppointmentConfirmation(appointment, patient, doctor) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: patient.email,
      subject: "Appointment Confirmation - MediLinka",
      html: `
        <h2>Appointment Confirmed</h2>
        <p>Dear ${patient.name},</p>
        <p>Your appointment has been confirmed with the following details:</p>
        <ul>
          <li><strong>Doctor:</strong> ${doctor.name}</li>
          <li><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${new Date(appointment.appointmentDate).toLocaleTimeString()}</li>
          <li><strong>Type:</strong> ${appointment.type}</li>
        </ul>
        <p>Please join the consultation 5 minutes before your scheduled time.</p>
        <p>Best regards,<br>MediLinka Team</p>
      `,
    }

    try {
      await this.transporter.sendMail(mailOptions)
      console.log("Appointment confirmation email sent")
    } catch (error) {
      console.error("Email sending failed:", error)
    }
  }

  async sendPrescriptionReady(prescription, patient) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: patient.email,
      subject: "Prescription Ready - MediLinka",
      html: `
        <h2>Prescription Ready for Pickup</h2>
        <p>Dear ${patient.name},</p>
        <p>Your prescription #${prescription.prescriptionNumber} is ready for pickup or delivery.</p>
        <p>Please contact our pharmacy for more details.</p>
        <p>Best regards,<br>MediLinka Pharmacy</p>
      `,
    }

    try {
      await this.transporter.sendMail(mailOptions)
      console.log("Prescription ready email sent")
    } catch (error) {
      console.error("Email sending failed:", error)
    }
  }
}

module.exports = new EmailService()
