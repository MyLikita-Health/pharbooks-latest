const express = require("express")
const { Op } = require("sequelize")
const { Inventory, Medication } = require("../models")
const { authenticateToken, authorizeRoles } = require("../middleware/auth")
const { validateInventory } = require("../middleware/validation")

const router = express.Router()

// Get all inventory items
router.get("/", authenticateToken, authorizeRoles(["pharmacist", "admin"]), async (req, res) => {
  try {
    const { page = 1, limit = 50, lowStock, expired, search } = req.query
    const offset = (page - 1) * limit

    const where = {}
    if (lowStock === "true") {
      where.quantity = { [Op.lt]: 10 }
    }
    if (expired === "true") {
      where.expiryDate = { [Op.lt]: new Date() }
    }

    const include = [
      {
        model: Medication,
        required: true,
      },
    ]

    if (search) {
      include[0].where = {
        [Op.or]: [{ name: { [Op.iLike]: `%${search}%` } }, { genericName: { [Op.iLike]: `%${search}%` } }],
      }
    }

    const inventory = await Inventory.findAndCountAll({
      where,
      include,
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      order: [["expiryDate", "ASC"]],
    })

    res.json({
      inventory: inventory.rows,
      total: inventory.count,
      page: Number.parseInt(page),
      totalPages: Math.ceil(inventory.count / limit),
    })
  } catch (error) {
    console.error("Get inventory error:", error)
    res.status(500).json({ error: "Failed to fetch inventory" })
  }
})

// Get inventory item by ID
router.get("/:id", authenticateToken, authorizeRoles(["pharmacist", "admin"]), async (req, res) => {
  try {
    const { id } = req.params

    const inventoryItem = await Inventory.findByPk(id, {
      include: [
        {
          model: Medication,
        },
      ],
    })

    if (!inventoryItem) {
      return res.status(404).json({ error: "Inventory item not found" })
    }

    res.json(inventoryItem)
  } catch (error) {
    console.error("Get inventory item error:", error)
    res.status(500).json({ error: "Failed to fetch inventory item" })
  }
})

// Add new inventory item
router.post("/", authenticateToken, authorizeRoles(["pharmacist", "admin"]), validateInventory, async (req, res) => {
  try {
    const inventoryData = {
      ...req.body,
      pharmacistId: req.user.id,
    }

    const inventoryItem = await Inventory.create(inventoryData)

    const fullInventoryItem = await Inventory.findByPk(inventoryItem.id, {
      include: [
        {
          model: Medication,
        },
      ],
    })

    res.status(201).json(fullInventoryItem)
  } catch (error) {
    console.error("Create inventory error:", error)
    res.status(500).json({ error: "Failed to add inventory item" })
  }
})

// Update inventory item
router.put("/:id", authenticateToken, authorizeRoles(["pharmacist", "admin"]), validateInventory, async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const [updatedRowsCount] = await Inventory.update(updates, {
      where: { id },
    })

    if (updatedRowsCount === 0) {
      return res.status(404).json({ error: "Inventory item not found" })
    }

    const updatedInventoryItem = await Inventory.findByPk(id, {
      include: [
        {
          model: Medication,
        },
      ],
    })

    res.json(updatedInventoryItem)
  } catch (error) {
    console.error("Update inventory error:", error)
    res.status(500).json({ error: "Failed to update inventory item" })
  }
})

// Delete inventory item
router.delete("/:id", authenticateToken, authorizeRoles(["admin"]), async (req, res) => {
  try {
    const { id } = req.params

    const deletedRowsCount = await Inventory.destroy({
      where: { id },
    })

    if (deletedRowsCount === 0) {
      return res.status(404).json({ error: "Inventory item not found" })
    }

    res.json({ message: "Inventory item deleted successfully" })
  } catch (error) {
    console.error("Delete inventory error:", error)
    res.status(500).json({ error: "Failed to delete inventory item" })
  }
})

// Get inventory statistics
router.get("/stats/overview", authenticateToken, authorizeRoles(["pharmacist", "admin"]), async (req, res) => {
  try {
    const totalItems = await Inventory.count()
    const lowStockItems = await Inventory.count({
      where: { quantity: { [Op.lt]: 10 } },
    })
    const expiredItems = await Inventory.count({
      where: { expiryDate: { [Op.lt]: new Date() } },
    })
    const expiringItems = await Inventory.count({
      where: {
        expiryDate: {
          [Op.between]: [new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)],
        },
      },
    })

    const totalValue = (await Inventory.sum("quantity * price")) || 0

    res.json({
      totalItems,
      lowStockItems,
      expiredItems,
      expiringItems,
      totalValue: Number.parseFloat(totalValue.toFixed(2)),
    })
  } catch (error) {
    console.error("Get inventory stats error:", error)
    res.status(500).json({ error: "Failed to fetch inventory statistics" })
  }
})

// Adjust inventory quantity
router.patch("/:id/adjust", authenticateToken, authorizeRoles(["pharmacist", "admin"]), async (req, res) => {
  try {
    const { id } = req.params
    const { adjustment, reason } = req.body

    if (!adjustment || adjustment === 0) {
      return res.status(400).json({
        success: false,
        message: "Adjustment amount is required",
      })
    }

    const inventoryItem = await Inventory.findByPk(id)
    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      })
    }

    const newQuantity = inventoryItem.quantity + adjustment

    if (newQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Insufficient inventory quantity",
      })
    }

    await inventoryItem.update({
      quantity: newQuantity,
      notes: inventoryItem.notes
        ? `${inventoryItem.notes}\n${new Date().toISOString()}: ${adjustment > 0 ? "+" : ""}${adjustment} (${reason || "No reason provided"})`
        : `${new Date().toISOString()}: ${adjustment > 0 ? "+" : ""}${adjustment} (${reason || "No reason provided"})`,
    })

    const updatedItem = await Inventory.findByPk(id, {
      include: [
        {
          model: Medication,
          attributes: ["id", "name", "genericName", "strength", "form"],
        },
      ],
    })

    res.json({
      success: true,
      message: "Inventory quantity adjusted successfully",
      inventoryItem: updatedItem,
    })
  } catch (error) {
    console.error("Error adjusting inventory:", error)
    res.status(500).json({
      success: false,
      message: "Failed to adjust inventory quantity",
      error: error.message,
    })
  }
})

// Update stock quantity
router.patch("/:id/stock", authenticateToken, authorizeRoles(["pharmacist", "admin"]), async (req, res) => {
  try {
    const { id } = req.params
    const { quantity, operation = "set" } = req.body

    if (!quantity || quantity < 0) {
      return res.status(400).json({ error: "Valid quantity required" })
    }

    const inventoryItem = await Inventory.findByPk(id)
    if (!inventoryItem) {
      return res.status(404).json({ error: "Inventory item not found" })
    }

    let newQuantity
    switch (operation) {
      case "add":
        newQuantity = inventoryItem.quantity + quantity
        break
      case "subtract":
        newQuantity = Math.max(0, inventoryItem.quantity - quantity)
        break
      default:
        newQuantity = quantity
    }

    await inventoryItem.update({ quantity: newQuantity })

    const updatedItem = await Inventory.findByPk(id, {
      include: [
        {
          model: Medication,
        },
      ],
    })

    res.json(updatedItem)
  } catch (error) {
    console.error("Update stock error:", error)
    res.status(500).json({ error: "Failed to update stock" })
  }
})

module.exports = router
