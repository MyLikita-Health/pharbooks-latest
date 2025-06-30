const express = require("express")
const { Appointment, User } = require("../models")
const { authenticateToken, authorizeRoles } = require("../middleware/auth")
const { validateAppointment } = require("../middleware/validation")
const { Op } = require("sequelize")
const router = express.Router()

// Get appointments (role-based)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { role, userId } = req.user
    const { status, date, limit = 50, offset = 0 } = req.query

    const whereClause = {}
    const include = []

    // Build query based on user role
    if (role === "patient") {
      whereClause.patientId = userId
      include.push({ model: User, as: "Doctor", attributes: ["id", "name", "specialization"] })
    } else if (role === "doctor") {
      whereClause.doctorId = userId
      include.push({ model: User, as: "Patient", attributes: ["id", "name", "phone"] })
    } else if (role === "admin") {
      include.push(
        { model: User, as: "Patient", attributes: ["id", "name", "phone"] },
        { model: User, as: "Doctor", attributes: ["id", "name", "specialization"] },
      )
    }

    // Add filters
    if (status) whereClause.status = status
    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      whereClause.appointmentDate = {
        [Op.gte]: startDate,
        [Op.lt]: endDate,
      }
    }

    const appointments = await Appointment.findAndCountAll({
      where: whereClause,
      include,
      order: [["appointmentDate", "ASC"]],
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
    })

    res.json({
      appointments: appointments.rows,
      total: appointments.count,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(appointments.count / limit),
    })
  } catch (error) {
    console.error("Get appointments error:", error)
    res.status(500).json({ message: "Failed to fetch appointments" })
  }
})

// Get single appointment
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { role, userId } = req.user

    const whereClause = { id }
    const include = [
      { model: User, as: "Patient", attributes: ["id", "name", "phone", "email"] },
      { model: User, as: "Doctor", attributes: ["id", "name", "specialization"] },
    ]

    // Authorization check
    if (role === "patient") {
      whereClause.patientId = userId
    } else if (role === "doctor") {
      whereClause.doctorId = userId
    }

    const appointment = await Appointment.findOne({
      where: whereClause,
      include,
    })

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" })
    }

    res.json({ appointment })
  } catch (error) {
    console.error("Get appointment error:", error)
    res.status(500).json({ message: "Failed to fetch appointment" })
  }
})

// Book appointment
router.post("/", authenticateToken, authorizeRoles(["patient"]), validateAppointment, async (req, res) => {
  try {
    const { doctorId, appointmentDate, type, symptoms, duration } = req.body
    const patientId = req.user.userId

    // Check if doctor exists and is approved
    const doctor = await User.findOne({
      where: { id: doctorId, role: "doctor", isApproved: true },
    })

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found or not approved" })
    }

    // Check for scheduling conflicts
    const conflictingAppointment = await Appointment.findOne({
      where: {
        doctorId,
        appointmentDate,
        status: ["confirmed", "in_progress"],
      },
    })

    if (conflictingAppointment) {
      return res.status(409).json({ message: "Time slot not available" })
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      appointmentDate: new Date(appointmentDate),
      type,
      symptoms,
      duration: duration || 30,
    })

    // Fetch appointment with related data
    const createdAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        { model: User, as: "Patient", attributes: ["id", "name", "phone"] },
        { model: User, as: "Doctor", attributes: ["id", "name", "specialization"] },
      ],
    })

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment: createdAppointment,
    })
  } catch (error) {
    console.error("Book appointment error:", error)
    res.status(500).json({ message: "Failed to book appointment" })
  }
})

// Update appointment status
router.patch("/:id/status", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { status, notes, diagnosis } = req.body
    const { role, userId } = req.user

    const appointment = await Appointment.findByPk(id)
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" })
    }

    // Authorization check
    if (role === "patient" && appointment.patientId !== userId) {
      return res.status(403).json({ message: "Access denied" })
    }
    if (role === "doctor" && appointment.doctorId !== userId) {
      return res.status(403).json({ message: "Access denied" })
    }

    // Update appointment
    const updateData = { status }
    if (notes) updateData.notes = notes
    if (diagnosis) updateData.diagnosis = diagnosis
    if (status === "cancelled") {
      updateData.cancelledAt = new Date()
      updateData.cancelledBy = userId
    }

    await appointment.update(updateData)

    // Fetch updated appointment with related data
    const updatedAppointment = await Appointment.findByPk(id, {
      include: [
        { model: User, as: "Patient", attributes: ["id", "name", "phone"] },
        { model: User, as: "Doctor", attributes: ["id", "name", "specialization"] },
      ],
    })

    res.json({
      message: "Appointment status updated successfully",
      appointment: updatedAppointment,
    })
  } catch (error) {
    console.error("Update appointment error:", error)
    res.status(500).json({ message: "Failed to update appointment" })
  }
})

// Update appointment details (doctors only)
router.patch("/:id", authenticateToken, authorizeRoles(["doctor"]), async (req, res) => {
  try {
    const { id } = req.params
    const { diagnosis, notes, duration } = req.body
    const { userId } = req.user

    const appointment = await Appointment.findOne({
      where: { id, doctorId: userId },
    })

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" })
    }

    const updateData = {}
    if (diagnosis !== undefined) updateData.diagnosis = diagnosis
    if (notes !== undefined) updateData.notes = notes
    if (duration !== undefined) updateData.duration = duration

    await appointment.update(updateData)

    // Fetch updated appointment with related data
    const updatedAppointment = await Appointment.findByPk(id, {
      include: [
        { model: User, as: "Patient", attributes: ["id", "name", "phone"] },
        { model: User, as: "Doctor", attributes: ["id", "name", "specialization"] },
      ],
    })

    res.json({
      message: "Appointment updated successfully",
      appointment: updatedAppointment,
    })
  } catch (error) {
    console.error("Update appointment error:", error)
    res.status(500).json({ message: "Failed to update appointment" })
  }
})

module.exports = router