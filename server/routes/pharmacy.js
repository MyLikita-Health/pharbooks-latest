const express = require("express")
const { PharmacyOrder, Prescription, Medication, User } = require("../models")
const { authenticateToken, authorizeRoles } = require("../middleware/auth")
const router = express.Router()

// Get pharmacy orders
router.get("/orders", authenticateToken, authorizeRoles(["pharmacist", "admin"]), async (req, res) => {
  try {
    const { status, limit = 10, offset = 0 } = req.query
    const { role, userId } = req.user

    const whereClause = {}
    if (status) whereClause.status = status
    if (role === "pharmacist") whereClause.pharmacistId = userId

    const orders = await PharmacyOrder.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Prescription,
          include: [
            { model: Medication },
            { model: User, as: "Patient", attributes: ["id", "name", "phone"] },
            { model: User, as: "Doctor", attributes: ["id", "name", "specialization"] },
          ],
        },
        { model: User, as: "Pharmacist", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
    })

    res.json({
      orders: orders.rows,
      total: orders.count,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(orders.count / limit),
    })
  } catch (error) {
    console.error("Get pharmacy orders error:", error)
    res.status(500).json({ message: "Failed to fetch pharmacy orders" })
  }
})

// Process prescription (create pharmacy order)
router.post("/orders", authenticateToken, authorizeRoles(["pharmacist"]), async (req, res) => {
  try {
    const { prescriptionId, deliveryAddress, deliveryMethod, estimatedDelivery } = req.body
    const pharmacistId = req.user.userId

    // Verify prescription exists and is verified
    const prescription = await Prescription.findOne({
      where: { id: prescriptionId, status: "verified" },
      include: [{ model: Medication }],
    })

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found or not verified" })
    }

    // Check if order already exists
    const existingOrder = await PharmacyOrder.findOne({ where: { prescriptionId } })
    if (existingOrder) {
      return res.status(409).json({ message: "Order already exists for this prescription" })
    }

    // Calculate total amount
    const totalAmount = prescription.Medications.reduce((sum, med) => {
      return sum + (med.price || 0) * med.quantity
    }, 0)

    // Create pharmacy order
    const order = await PharmacyOrder.create({
      prescriptionId,
      pharmacistId,
      totalAmount,
      deliveryAddress,
      deliveryMethod,
      estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
    })

    // Update prescription status
    await prescription.update({ status: "filled" })

    // Fetch complete order
    const completeOrder = await PharmacyOrder.findByPk(order.id, {
      include: [
        {
          model: Prescription,
          include: [{ model: Medication }, { model: User, as: "Patient", attributes: ["id", "name", "phone"] }],
        },
        { model: User, as: "Pharmacist", attributes: ["id", "name"] },
      ],
    })

    res.status(201).json({
      message: "Pharmacy order created successfully",
      order: completeOrder,
    })
  } catch (error) {
    console.error("Create pharmacy order error:", error)
    res.status(500).json({ message: "Failed to create pharmacy order" })
  }
})

// Update order status
router.patch("/orders/:id/status", authenticateToken, authorizeRoles(["pharmacist", "admin"]), async (req, res) => {
  try {
    const { id } = req.params
    const { status, trackingNumber, notes } = req.body

    const order = await PharmacyOrder.findByPk(id)
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    const updateData = { status }
    if (trackingNumber) updateData.trackingNumber = trackingNumber
    if (notes) updateData.notes = notes
    if (status === "delivered") updateData.actualDelivery = new Date()

    await order.update(updateData)

    res.json({
      message: "Order status updated successfully",
      order,
    })
  } catch (error) {
    console.error("Update order status error:", error)
    res.status(500).json({ message: "Failed to update order status" })
  }
})

module.exports = router
