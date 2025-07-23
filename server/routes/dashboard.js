const express = require("express")
const { User, Appointment, Prescription, Medication, Notification, PharmacyOrder, sequelize } = require("../models")
const { authenticateToken, authorizeRoles } = require("../middleware/auth")
const { Op } = require("sequelize")
const router = express.Router()

// Doctor dashboard statistics
router.get("/doctor/stats", authenticateToken, authorizeRoles(["doctor"]), async (req, res) => {
  try {
    const doctorId = req.user.userId
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Get total patients (unique patients who had appointments with this doctor)
    const totalPatients = await Appointment.count({
      where: { doctorId },
      distinct: true,
      col: "patientId",
    })

    // Get today's appointments
    const todayAppointments = await Appointment.count({
      where: {
        doctorId,
        appointmentDate: {
          [Op.gte]: startOfDay,
          [Op.lt]: endOfDay,
        },
      },
    })

    // Get upcoming appointments
    const upcomingAppointments = await Appointment.count({
      where: {
        doctorId,
        appointmentDate: {
          [Op.gt]: new Date(),
        },
        status: ["confirmed", "pending"],
      },
    })

    // Get completed appointments
    const completedAppointments = await Appointment.count({
      where: {
        doctorId,
        status: "completed",
      },
    })

    // Get active prescriptions
    const activePrescriptions = await Prescription.count({
      where: {
        doctorId,
        status: "active",
      },
    })

    // Get total consultations
    const totalConsultations = await Appointment.count({
      where: {
        doctorId,
        status: "completed",
      },
    })

    // Get unread messages
    const unreadMessages = await Notification.count({
      where: {
        userId: doctorId,
        isRead: false,
        type: "message",
      },
    })

    // Calculate rating (mock for now)
    const rating = 4.8

    // Calculate total earnings (mock for now)
    const totalEarnings = completedAppointments * 75

    res.json({
      totalPatients,
      todayAppointments,
      upcomingAppointments,
      completedAppointments,
      activePrescriptions,
      totalConsultations,
      unreadMessages,
      rating,
      totalEarnings,
    })
  } catch (error) {
    console.error("Doctor stats error:", error)
    res.status(500).json({ message: "Failed to fetch doctor statistics" })
  }
})

// Patient dashboard statistics
router.get("/patient/stats", authenticateToken, authorizeRoles(["patient"]), async (req, res) => {
  try {
    const patientId = req.user.userId

    // Get upcoming appointments
    const upcomingAppointments = await Appointment.count({
      where: {
        patientId,
        appointmentDate: {
          [Op.gt]: new Date(),
        },
        status: ["confirmed", "pending"],
      },
    })

    // Get active prescriptions
    const activePrescriptions = await Prescription.count({
      where: {
        patientId,
        status: "active",
      },
    })

    // Get unread messages
    const unreadMessages = await Notification.count({
      where: {
        userId: patientId,
        isRead: false,
      },
    })

    // Get total appointments
    const totalAppointments = await Appointment.count({
      where: { patientId },
    })

    // Get completed appointments
    const completedAppointments = await Appointment.count({
      where: {
        patientId,
        status: "completed",
      },
    })

    // Calculate health score (mock for now)
    const healthScore = 85

    // Mock vital signs
    const vitalSigns = {
      bloodPressure: "120/80",
      heartRate: "72 bpm",
      temperature: "98.6°F",
      weight: "165 lbs",
      recordedAt: new Date().toISOString(),
    }

    res.json({
      upcomingAppointments,
      activePrescriptions,
      unreadMessages,
      totalAppointments,
      completedAppointments,
      healthScore,
      vitalSigns,
    })
  } catch (error) {
    console.error("Patient stats error:", error)
    res.status(500).json({ message: "Failed to fetch patient statistics" })
  }
})

// Admin dashboard statistics
router.get("/admin/stats", authenticateToken, authorizeRoles(["admin"]), async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await User.count()
    const totalDoctors = await User.count({ where: { role: "doctor" } })
    const totalPatients = await User.count({ where: { role: "patient" } })
    const totalPharmacists = await User.count({ where: { role: "pharmacist" } })
    const pendingApprovals = await User.count({ where: { isApproved: false, role: { [Op.ne]: "patient" } } })

    // Get appointment statistics
    const totalAppointments = await Appointment.count()
    const todayAppointments = await Appointment.count({
      where: {
        appointmentDate: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
          [Op.lt]: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    })

    // Get prescription statistics
    const totalPrescriptions = await Prescription.count()
    const activePrescriptions = await Prescription.count({ where: { status: "active" } })

    // Get revenue (mock calculation)
    const totalRevenue = totalAppointments * 75

    res.json({
      users: {
        total: totalUsers,
        doctors: totalDoctors,
        patients: totalPatients,
        pharmacists: totalPharmacists,
        pendingApprovals,
      },
      appointments: {
        total: totalAppointments,
        today: todayAppointments,
      },
      prescriptions: {
        total: totalPrescriptions,
        active: activePrescriptions,
      },
      revenue: {
        total: totalRevenue,
        monthly: Math.floor(totalRevenue / 12),
      },
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    res.status(500).json({ message: "Failed to fetch admin statistics" })
  }
})

// Pharmacist dashboard statistics
router.get("/pharmacist/stats", authenticateToken, authorizeRoles(["pharmacist"]), async (req, res) => {
  try {
    const pharmacistId = req.user.userId

    // Get prescription statistics
    const totalPrescriptions = await Prescription.count()
    const pendingPrescriptions = await Prescription.count({ where: { status: "pending" } })
    const filledPrescriptions = await Prescription.count({ where: { status: "filled" } })

    // Get order statistics (mock for now)
    const totalOrders = await PharmacyOrder.count()
    const pendingOrders = await PharmacyOrder.count({ where: { status: "pending" } })
    const completedOrders = await PharmacyOrder.count({ where: { status: "completed" } })

    // Mock inventory statistics
    const lowStockItems = 15
    const totalInventoryValue = 125000

    res.json({
      prescriptions: {
        total: totalPrescriptions,
        pending: pendingPrescriptions,
        filled: filledPrescriptions,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders,
      },
      inventory: {
        lowStockItems,
        totalValue: totalInventoryValue,
      },
    })
  } catch (error) {
    console.error("Pharmacist stats error:", error)
    res.status(500).json({ message: "Failed to fetch pharmacist statistics" })
  }
})

// Hub dashboard statistics
router.get("/hub/stats", authenticateToken, authorizeRoles(["hub", "admin"]), async (req, res) => {
  try {
    // Get patient statistics
    const totalPatients = await User.count({ where: { role: "patient" } })
    const activePatients = await User.count({ where: { role: "patient", isActive: true } })
    const newPatientsThisMonth = await User.count({
      where: {
        role: "patient",
        createdAt: {
          [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    })

    // Get appointment statistics
    const totalAppointments = await Appointment.count()
    const pendingMatches = await Appointment.count({ where: { status: "pending" } })

    // Get analytics data
    const appointmentsByMonth = await Appointment.findAll({
      attributes: [
        [sequelize.fn("DATE_FORMAT", sequelize.col("appointmentDate"), "%Y-%m"), "month"],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: [sequelize.fn("DATE_FORMAT", sequelize.col("appointmentDate"), "%Y-%m")],
      order: [[sequelize.fn("DATE_FORMAT", sequelize.col("appointmentDate"), "%Y-%m"), "ASC"]],
      limit: 12,
    })

    res.json({
      patients: {
        total: totalPatients,
        active: activePatients,
        newThisMonth: newPatientsThisMonth,
        pendingMatches,
      },
      appointments: {
        total: totalAppointments,
        byMonth: appointmentsByMonth,
      },
    })
  } catch (error) {
    console.error("Hub stats error:", error)
    res.status(500).json({ message: "Failed to fetch hub statistics" })
  }
})

module.exports = router
