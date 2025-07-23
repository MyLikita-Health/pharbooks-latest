const express = require("express")
const { Appointment, User } = require("../models")
const { authenticateToken, authorizeRoles } = require("../middleware/auth")
const { validateAppointment } = require("../middleware/validation")
const { Op } = require("sequelize")
const crypto = require("crypto")
const router = express.Router()

// Generate unique meeting ID
const generateMeetingId = () => {
  return crypto.randomBytes(16).toString("hex")
}

// Generate meeting URL
const generateMeetingUrl = (meetingId) => {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000"
  return `${baseUrl}/meeting/${meetingId}`
}

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

// Book appointment (for patients)
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

// Create appointment (for doctors)
router.post("/doctor-create", authenticateToken, authorizeRoles(["doctor"]), async (req, res) => {
  try {
    const { patientId, appointmentDate, type, symptoms, duration, notes, fee } = req.body
    const doctorId = req.user.userId

    // Validate required fields
    if (!patientId || !appointmentDate) {
      return res.status(400).json({ message: "Patient ID and appointment date are required" })
    }

    // Check if patient exists
    const patient = await User.findOne({
      where: { id: patientId, role: "patient" },
    })

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" })
    }

    // Check for scheduling conflicts
    const conflictingAppointment = await Appointment.findOne({
      where: {
        doctorId,
        appointmentDate: new Date(appointmentDate),
        status: ["confirmed", "in_progress"],
      },
    })

    if (conflictingAppointment) {
      return res.status(409).json({ message: "Time slot not available" })
    }

    // Generate meeting details for video appointments
    let meetingId = null
    let meetingUrl = null
    if (type === "video") {
      meetingId = generateMeetingId()
      meetingUrl = generateMeetingUrl(meetingId)
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      appointmentDate: new Date(appointmentDate),
      type: type || "video",
      symptoms,
      notes,
      duration: duration || 30,
      fee: fee || 75.0,
      status: "confirmed", // Doctor-created appointments are automatically confirmed
      meetingId,
      meetingUrl,
    })

    // Fetch appointment with related data
    const createdAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        { model: User, as: "Patient", attributes: ["id", "name", "phone", "email"] },
        { model: User, as: "Doctor", attributes: ["id", "name", "specialization"] },
      ],
    })

    res.status(201).json({
      message: "Appointment created successfully",
      appointment: createdAppointment,
    })
  } catch (error) {
    console.error("Create appointment error:", error)
    res.status(500).json({ message: "Failed to create appointment" })
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

    // Generate meeting details when confirming video appointments
    if (status === "confirmed" && appointment.type === "video" && !appointment.meetingId) {
      updateData.meetingId = generateMeetingId()
      updateData.meetingUrl = generateMeetingUrl(updateData.meetingId)
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
    const {
      diagnosis,
      notes,
      duration,
      consultationNotes,
      urgency,
      specialInstructions,
      additionalNotes,
      followUpRequired,
      followUpDays,
      followUpDate,
      consultationDuration,
      status,
    } = req.body
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
    if (consultationNotes !== undefined) updateData.consultationNotes = consultationNotes
    if (urgency !== undefined) updateData.urgency = urgency
    if (specialInstructions !== undefined) updateData.specialInstructions = specialInstructions
    if (additionalNotes !== undefined) updateData.additionalNotes = additionalNotes
    if (followUpRequired !== undefined) updateData.followUpRequired = followUpRequired
    if (followUpDays !== undefined) updateData.followUpDays = followUpDays
    if (followUpDate !== undefined) updateData.followUpDate = followUpDate
    if (consultationDuration !== undefined) updateData.consultationDuration = consultationDuration
    if (status !== undefined) updateData.status = status

    // Set consultation completion timestamp when completing
    if (status === "completed" && consultationNotes) {
      updateData.consultationCompletedAt = new Date()
    }

    await appointment.update(updateData)

    // Fetch updated appointment with related data
    const updatedAppointment = await Appointment.findByPk(id, {
      include: [
        {
          model: User,
          as: "Patient",
          attributes: ["id", "name", "phone", "email", "dateOfBirth", "gender", "medicalHistory", "allergies"],
        },
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

// Complete consultation with post-consultation data
router.patch("/:id/complete-consultation", authenticateToken, authorizeRoles(["doctor"]), async (req, res) => {
  try {
    const { id } = req.params
    const {
      consultationNotes,
      diagnosis,
      urgency,
      specialInstructions,
      additionalNotes,
      followUpRequired,
      followUpDays,
      consultationDuration,
    } = req.body
    const { userId } = req.user

    // Validate required fields
    if (!consultationNotes || consultationNotes.trim() === "") {
      return res.status(400).json({ message: "Consultation notes are required" })
    }

    const appointment = await Appointment.findOne({
      where: { id, doctorId: userId },
    })

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" })
    }

    // Calculate follow-up date
    const followUpDate =
      followUpRequired && followUpDays
        ? new Date(Date.now() + Number.parseInt(followUpDays) * 24 * 60 * 60 * 1000)
        : null

    const updateData = {
      status: "completed",
      consultationNotes,
      diagnosis,
      urgency: urgency || "medium",
      specialInstructions,
      additionalNotes,
      followUpRequired: followUpRequired || false,
      followUpDays: followUpRequired ? Number.parseInt(followUpDays) : null,
      followUpDate,
      consultationDuration,
      consultationCompletedAt: new Date(),
    }

    await appointment.update(updateData)

    // Fetch updated appointment with related data
    const updatedAppointment = await Appointment.findByPk(id, {
      include: [
        { model: User, as: "Patient", attributes: ["id", "name", "phone", "email"] },
        { model: User, as: "Doctor", attributes: ["id", "name", "specialization"] },
      ],
    })

    res.json({
      message: "Consultation completed successfully",
      appointment: updatedAppointment,
    })
  } catch (error) {
    console.error("Complete consultation error:", error)
    res.status(500).json({ message: "Failed to complete consultation" })
  }
})

// Get meeting details
router.get("/:id/meeting", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { role, userId } = req.user

    const whereClause = { id }

    // Authorization check
    if (role === "patient") {
      whereClause.patientId = userId
    } else if (role === "doctor") {
      whereClause.doctorId = userId
    }

    const appointment = await Appointment.findOne({
      where: whereClause,
      include: [
        { model: User, as: "Patient", attributes: ["id", "name", "phone"] },
        { model: User, as: "Doctor", attributes: ["id", "name", "specialization"] },
      ],
    })

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" })
    }

    if (!appointment.meetingId) {
      return res.status(400).json({ message: "No meeting link available for this appointment" })
    }

    res.json({
      meetingId: appointment.meetingId,
      meetingUrl: appointment.meetingUrl,
      appointment: {
        id: appointment.id,
        status: appointment.status,
        type: appointment.type,
        appointmentDate: appointment.appointmentDate,
        Patient: appointment.Patient,
        Doctor: appointment.Doctor,
      },
    })
  } catch (error) {
    console.error("Get meeting error:", error)
    res.status(500).json({ message: "Failed to fetch meeting details" })
  }
})

module.exports = router
