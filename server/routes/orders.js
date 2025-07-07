const express = require("express")
const { PharmacyOrder, Prescription, Medication, User } = require("../models")
const { authenticateToken, authorizeRoles } = require("../middleware/auth")
const { validateOrder } = require("../middleware/validation")
const { Op } = require("sequelize")
const router = express.Router()

// Get all orders
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, patientId } = req.query
    const offset = (page - 1) * limit

    const where = {}
    if (status) where.status = status

    // Patients can only see their own orders
    if (req.user.role === "patient") {
      where.patientId = req.user.id
    } else if (patientId && req.user.role !== "patient") {
      where.patientId = patientId
    }

    const orders = await PharmacyOrder.findAndCountAll({
      where,
      include: [
        {
          model: Prescription,
          include: [
            {
              model: Medication,
              attributes: ["name", "genericName", "strength"],
            },
          ],
        },
        {
          model: User,
          as: "Patient",
          attributes: ["name", "email", "phone"],
        },
        {
          model: User,
          as: "Pharmacist",
          attributes: ["name", "email"],
          required: false,
        },
      ],
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      order: [["createdAt", "DESC"]],
    })

    res.json({
      orders: orders.rows,
      total: orders.count,
      page: Number.parseInt(page),
      totalPages: Math.ceil(orders.count / limit),
    })
  } catch (error) {
    console.error("Get orders error:", error)
    res.status(500).json({ error: "Failed to fetch orders" })
  }
})

// Get order by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const order = await PharmacyOrder.findByPk(id, {
      include: [
        {
          model: Prescription,
          include: [
            {
              model: Medication,
              attributes: ["name", "genericName", "strength", "dosageForm"],
            },
          ],
        },
        {
          model: User,
          as: "Patient",
          attributes: ["name", "email", "phone"],
        },
        {
          model: User,
          as: "Pharmacist",
          attributes: ["name", "email"],
          required: false,
        },
      ],
    })

    if (!order) {
      return res.status(404).json({ error: "Order not found" })
    }

    // Check access permissions
    if (req.user.role === "patient" && order.patientId !== req.user.id) {
      return res.status(403).json({ error: "Access denied" })
    }

    res.json(order)
  } catch (error) {
    console.error("Get order error:", error)
    res.status(500).json({ error: "Failed to fetch order" })
  }
})

// Create order (Patient)
router.post("/", authenticateToken, authorizeRoles(["patient"]), validateOrder, async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      patientId: req.user.id,
      status: "pending",
    }

    const order = await PharmacyOrder.create(orderData)

    const fullOrder = await PharmacyOrder.findByPk(order.id, {
      include: [
        {
          model: Prescription,
          include: [
            {
              model: Medication,
              attributes: ["name", "genericName", "strength"],
            },
          ],
        },
        {
          model: User,
          as: "Patient",
          attributes: ["name", "email", "phone"],
        },
      ],
    })

    res.status(201).json(fullOrder)
  } catch (error) {
    console.error("Create order error:", error)
    res.status(500).json({ error: "Failed to create order" })
  }
})

// Update order status (Pharmacist/Admin)
router.patch("/:id/status", authenticateToken, authorizeRoles(["pharmacist", "admin"]), async (req, res) => {
  try {
    const { id } = req.params
    const { status, notes } = req.body

    const validStatuses = ["pending", "confirmed", "preparing", "ready", "dispatched", "delivered", "cancelled"]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" })
    }

    const updateData = { status }
    if (notes) updateData.notes = notes
    if (status === "confirmed") updateData.pharmacistId = req.user.id
    if (status === "dispatched") updateData.dispatchedAt = new Date()
    if (status === "delivered") updateData.deliveredAt = new Date()

    const [updatedRowsCount] = await PharmacyOrder.update(updateData, {
      where: { id },
    })

    if (updatedRowsCount === 0) {
      return res.status(404).json({ error: "Order not found" })
    }

    const updatedOrder = await PharmacyOrder.findByPk(id, {
      include: [
        {
          model: Prescription,
          include: [
            {
              model: Medication,
              attributes: ["name", "genericName", "strength"],
            },
          ],
        },
        {
          model: User,
          as: "Patient",
          attributes: ["name", "email", "phone"],
        },
        {
          model: User,
          as: "Pharmacist",
          attributes: ["name", "email"],
          required: false,
        },
      ],
    })

    res.json(updatedOrder)
  } catch (error) {
    console.error("Update order status error:", error)
    res.status(500).json({ error: "Failed to update order status" })
  }
})

// Cancel order (Patient/Admin)
router.patch("/:id/cancel", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    const order = await PharmacyOrder.findByPk(id)
    if (!order) {
      return res.status(404).json({ error: "Order not found" })
    }

    // Check permissions
    if (req.user.role === "patient" && order.patientId !== req.user.id) {
      return res.status(403).json({ error: "Access denied" })
    }

    // Can't cancel delivered orders
    if (order.status === "delivered") {
      return res.status(400).json({ error: "Cannot cancel delivered order" })
    }

    await order.update({
      status: "cancelled",
      cancelledAt: new Date(),
      cancellationReason: reason,
    })

    const updatedOrder = await PharmacyOrder.findByPk(id, {
      include: [
        {
          model: Prescription,
          include: [
            {
              model: Medication,
              attributes: ["name", "genericName", "strength"],
            },
          ],
        },
        {
          model: User,
          as: "Patient",
          attributes: ["name", "email", "phone"],
        },
      ],
    })

    res.json(updatedOrder)
  } catch (error) {
    console.error("Cancel order error:", error)
    res.status(500).json({ error: "Failed to cancel order" })
  }
})

// Get order statistics (Pharmacist/Admin)
router.get("/stats/overview", authenticateToken, authorizeRoles(["pharmacist", "admin"]), async (req, res) => {
  try {
    const totalOrders = await PharmacyOrder.count()
    const pendingOrders = await PharmacyOrder.count({ where: { status: "pending" } })
    const confirmedOrders = await PharmacyOrder.count({ where: { status: "confirmed" } })
    const deliveredOrders = await PharmacyOrder.count({ where: { status: "delivered" } })

    const totalRevenue = (await PharmacyOrder.sum("totalAmount")) || 0

    const recentOrders = await PharmacyOrder.findAll({
      include: [
        {
          model: User,
          as: "Patient",
          attributes: ["name"],
        },
        {
          model: Prescription,
          include: [
            {
              model: Medication,
              attributes: ["name"],
            },
          ],
        },
      ],
      limit: 10,
      order: [["createdAt", "DESC"]],
    })

    res.json({
      totalOrders,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      totalRevenue: Number.parseFloat(totalRevenue.toFixed(2)),
      recentOrders,
    })
  } catch (error) {
    console.error("Get order stats error:", error)
    res.status(500).json({ error: "Failed to fetch order statistics" })
  }
})

module.exports = router
