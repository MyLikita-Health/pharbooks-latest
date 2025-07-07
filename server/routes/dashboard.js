const express = require("express")
const router = express.Router()
const { User, Appointment, Prescription, PharmacyOrder, Medication } = require("../models")
const { authenticateToken } = require("../middleware/auth")
const { Op } = require("sequelize")

// Get dashboard data (role-specific)
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const userRole = req.user.role

    let dashboardData = {}

    switch (userRole) {
      case "patient":
        dashboardData = await getPatientDashboard(userId)
        break
      case "doctor":
        dashboardData = await getDoctorDashboard(userId)
        break
      case "pharmacist":
        dashboardData = await getPharmacistDashboard(userId)
        break
      case "admin":
        dashboardData = await getAdminDashboard()
        break
      case "hub":
        dashboardData = await getHubDashboard()
        break
      default:
        return res.status(400).json({ error: "Invalid user role" })
    }

    res.json(dashboardData)
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    res.status(500).json({ error: "Failed to fetch dashboard data" })
  }
})

async function getPatientDashboard(userId) {
  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

  const [
    totalAppointments,
    upcomingAppointments,
    activePrescriptions,
    pendingOrders,
    recentAppointments,
    recentPrescriptions,
  ] = await Promise.all([
    Appointment.count({ where: { patientId: userId } }),
    Appointment.count({
      where: {
        patientId: userId,
        appointmentDate: { [Op.gte]: new Date() },
        status: { [Op.in]: ["confirmed", "pending"] },
      },
    }),
    Prescription.count({
      where: { patientId: userId, status: "active" },
    }),
    PharmacyOrder.count({
      where: { patientId: userId, status: { [Op.in]: ["pending", "processing"] } },
    }),
    Appointment.findAll({
      where: { patientId: userId },
      include: [
        {
          model: User,
          as: "Doctor",
          attributes: ["id", "name", "specialization"],
        },
      ],
      order: [["appointmentDate", "DESC"]],
      limit: 5,
    }),
    Prescription.findAll({
      where: { patientId: userId },
      include: [
        {
          model: Medication,
          attributes: ["id", "name", "dosage"],
        },
        {
          model: User,
          as: "Doctor",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    }),
  ])

  return {
    stats: {
      totalAppointments,
      upcomingAppointments,
      activePrescriptions,
      pendingOrders,
    },
    recentActivity: {
      appointments: recentAppointments,
      prescriptions: recentPrescriptions,
    },
  }
}

async function getDoctorDashboard(userId) {
  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

  const [
    todayAppointments,
    totalPatients,
    activePrescriptions,
    pendingAppointments,
    todaySchedule,
    recentPrescriptions,
  ] = await Promise.all([
    Appointment.count({
      where: {
        doctorId: userId,
        appointmentDate: { [Op.between]: [startOfDay, endOfDay] },
      },
    }),
    Appointment.count({
      where: { doctorId: userId },
      distinct: true,
      col: "patientId",
    }),
    Prescription.count({
      where: { doctorId: userId, status: "active" },
    }),
    Appointment.count({
      where: { doctorId: userId, status: "pending" },
    }),
    Appointment.findAll({
      where: {
        doctorId: userId,
        appointmentDate: { [Op.between]: [startOfDay, endOfDay] },
      },
      include: [
        {
          model: User,
          as: "Patient",
          attributes: ["id", "name", "phone"],
        },
      ],
      order: [["appointmentDate", "ASC"]],
    }),
    Prescription.findAll({
      where: { doctorId: userId },
      include: [
        {
          model: User,
          as: "Patient",
          attributes: ["id", "name"],
        },
        {
          model: Medication,
          attributes: ["id", "name", "dosage"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    }),
  ])

  return {
    stats: {
      todayAppointments,
      totalPatients,
      activePrescriptions,
      pendingAppointments,
    },
    todaySchedule,
    recentActivity: {
      prescriptions: recentPrescriptions,
    },
  }
}

async function getPharmacistDashboard(userId) {
  const [pendingPrescriptions, activeOrders, lowStockItems, totalInventory, recentOrders, inventoryAlerts] =
    await Promise.all([
      Prescription.count({
        where: { pharmacistId: userId, status: "pending_verification" },
      }),
      PharmacyOrder.count({
        where: { pharmacistId: userId, status: { [Op.in]: ["processing", "shipped"] } },
      }),
      Medication.count({
        where: { currentStock: { [Op.lte]: { [Op.col]: "minStock" } } },
      }),
      Medication.count(),
      PharmacyOrder.findAll({
        where: { pharmacistId: userId },
        include: [
          {
            model: User,
            as: "Patient",
            attributes: ["id", "name"],
          },
          {
            model: Prescription,
            include: [
              {
                model: Medication,
                attributes: ["id", "name", "dosage"],
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: 5,
      }),
      Medication.findAll({
        where: { currentStock: { [Op.lte]: { [Op.col]: "minStock" } } },
        order: [["currentStock", "ASC"]],
        limit: 5,
      }),
    ])

  return {
    stats: {
      pendingPrescriptions,
      activeOrders,
      lowStockItems,
      totalInventory,
    },
    recentActivity: {
      orders: recentOrders,
      inventoryAlerts,
    },
  }
}

async function getAdminDashboard() {
  const [totalUsers, totalAppointments, totalPrescriptions, pendingApprovals, recentUsers, systemStats] =
    await Promise.all([
      User.count(),
      Appointment.count(),
      Prescription.count(),
      User.count({ where: { status: "pending" } }),
      User.findAll({
        attributes: { exclude: ["password"] },
        order: [["createdAt", "DESC"]],
        limit: 5,
      }),
      Promise.all([
        User.count({ where: { role: "patient" } }),
        User.count({ where: { role: "doctor" } }),
        User.count({ where: { role: "pharmacist" } }),
        Appointment.count({ where: { status: "completed" } }),
      ]),
    ])

  return {
    stats: {
      totalUsers,
      totalAppointments,
      totalPrescriptions,
      pendingApprovals,
    },
    systemStats: {
      patients: systemStats[0],
      doctors: systemStats[1],
      pharmacists: systemStats[2],
      completedAppointments: systemStats[3],
    },
    recentActivity: {
      users: recentUsers,
    },
  }
}

async function getHubDashboard() {
  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const [todayAppointments, totalPatients, availableDoctors, pendingMatches, recentAppointments, patientStats] =
    await Promise.all([
      Appointment.count({
        where: {
          appointmentDate: { [Op.gte]: startOfDay },
        },
      }),
      User.count({ where: { role: "patient" } }),
      User.count({ where: { role: "doctor", status: "active" } }),
      Appointment.count({ where: { status: "pending" } }),
      Appointment.findAll({
        include: [
          {
            model: User,
            as: "Patient",
            attributes: ["id", "name"],
          },
          {
            model: User,
            as: "Doctor",
            attributes: ["id", "name", "specialization"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: 5,
      }),
      Promise.all([
        User.count({ where: { role: "patient", status: "active" } }),
        User.count({ where: { role: "patient", createdAt: { [Op.gte]: startOfDay } } }),
      ]),
    ])

  return {
    stats: {
      todayAppointments,
      totalPatients,
      availableDoctors,
      pendingMatches,
    },
    patientStats: {
      active: patientStats[0],
      newToday: patientStats[1],
    },
    recentActivity: {
      appointments: recentAppointments,
    },
  }
}

module.exports = router
