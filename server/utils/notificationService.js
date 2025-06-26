const { Notification } = require("../models")

class NotificationService {
  async createNotification(userId, type, title, message, data = null, priority = "medium") {
    try {
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        data,
        priority,
      })
      return notification
    } catch (error) {
      console.error("Failed to create notification:", error)
    }
  }

  async notifyAppointmentBooked(appointment, patient, doctor) {
    // Notify patient
    await this.createNotification(
      patient.id,
      "appointment_booked",
      "Appointment Booked",
      `Your appointment with ${doctor.name} has been scheduled for ${new Date(appointment.appointmentDate).toLocaleDateString()}`,
      { appointmentId: appointment.id },
      "medium",
    )

    // Notify doctor
    await this.createNotification(
      doctor.id,
      "appointment_booked",
      "New Appointment",
      `New appointment scheduled with ${patient.name} for ${new Date(appointment.appointmentDate).toLocaleDateString()}`,
      { appointmentId: appointment.id },
      "medium",
    )
  }

  async notifyPrescriptionReady(prescription, patient) {
    await this.createNotification(
      patient.id,
      "prescription_ready",
      "Prescription Ready",
      `Your prescription #${prescription.prescriptionNumber} is ready for pickup`,
      { prescriptionId: prescription.id },
      "high",
    )
  }

  async notifyOrderDispatched(order, patient) {
    await this.createNotification(
      patient.id,
      "order_dispatched",
      "Order Dispatched",
      `Your medication order #${order.orderNumber} has been dispatched. Tracking: ${order.trackingNumber}`,
      { orderId: order.id, trackingNumber: order.trackingNumber },
      "medium",
    )
  }

  async notifyUserApproved(user) {
    await this.createNotification(
      user.id,
      "user_approved",
      "Account Approved",
      `Congratulations! Your ${user.role} account has been approved. You can now access all platform features.`,
      null,
      "high",
    )
  }
}

module.exports = new NotificationService()
