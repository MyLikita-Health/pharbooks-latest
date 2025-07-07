const express = require("express")
const { Medication, Inventory, Prescription } = require("../models")
const { authenticateToken, authorizeRoles } = require("../middleware/auth")
const { validateMedication } = require("../middleware/validation")
const { Op } = require("sequelize")
const router = express.Router()

// Get all medications
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, search, category, inStock } = req.query
    const offset = (page - 1) * limit

    const where = {}
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { genericName: { [Op.iLike]: `%${search}%` } },
        { manufacturer: { [Op.iLike]: `%${search}%` } },
      ]
    }
    if (category) where.category = category

    const include = []
    if (inStock === "true") {
      include.push({
        model: Inventory,
        where: { quantity: { [Op.gt]: 0 } },
        required: true,
      })
    } else {
      include.push({
        model: Inventory,
        required: false,
      })
    }

    const medications = await Medication.findAndCountAll({
      where,
      include,
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      order: [["name", "ASC"]],
    })

    res.json({
      medications: medications.rows,
      total: medications.count,
      page: Number.parseInt(page),
      totalPages: Math.ceil(medications.count / limit),
    })
  } catch (error) {
    console.error("Get medications error:", error)
    res.status(500).json({ error: "Failed to fetch medications" })
  }
})

// Get medication by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const medication = await Medication.findByPk(id, {
      include: [
        {
          model: Inventory,
          attributes: ["quantity", "expiryDate", "batchNumber"],
        },
        {
          model: Prescription,
          limit: 10,
          order: [["createdAt", "DESC"]],
        },
      ],
    })

    if (!medication) {
      return res.status(404).json({ error: "Medication not found" })
    }

    res.json(medication)
  } catch (error) {
    console.error("Get medication error:", error)
    res.status(500).json({ error: "Failed to fetch medication" })
  }
})

// Create medication (Doctor/Pharmacist/Admin)
router.post(
  "/",
  authenticateToken,
  authorizeRoles(["doctor", "pharmacist", "admin"]),
  validateMedication,
  async (req, res) => {
    try {
      const medicationData = {
        ...req.body,
        createdBy: req.user.id,
      }

      const medication = await Medication.create(medicationData)
      res.status(201).json(medication)
    } catch (error) {
      console.error("Create medication error:", error)
      res.status(500).json({ error: "Failed to create medication" })
    }
  },
)

// Update medication (Doctor/Pharmacist/Admin)
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles(["doctor", "pharmacist", "admin"]),
  validateMedication,
  async (req, res) => {
    try {
      const { id } = req.params
      const updates = req.body

      const [updatedRowsCount] = await Medication.update(updates, {
        where: { id },
      })

      if (updatedRowsCount === 0) {
        return res.status(404).json({ error: "Medication not found" })
      }

      const updatedMedication = await Medication.findByPk(id)
      res.json(updatedMedication)
    } catch (error) {
      console.error("Update medication error:", error)
      res.status(500).json({ error: "Failed to update medication" })
    }
  },
)

// Delete medication (Admin only)
router.delete("/:id", authenticateToken, authorizeRoles(["admin"]), async (req, res) => {
  try {
    const { id } = req.params

    const deletedRowsCount = await Medication.destroy({
      where: { id },
    })

    if (deletedRowsCount === 0) {
      return res.status(404).json({ error: "Medication not found" })
    }

    res.json({ message: "Medication deleted successfully" })
  } catch (error) {
    console.error("Delete medication error:", error)
    res.status(500).json({ error: "Failed to delete medication" })
  }
})

// Search medications
router.get("/search/:query", authenticateToken, async (req, res) => {
  try {
    const { query } = req.params
    const { limit = 20 } = req.query

    const medications = await Medication.findAll({
      where: {
        [Op.or]: [{ name: { [Op.iLike]: `%${query}%` } }, { genericName: { [Op.iLike]: `%${query}%` } }],
      },
      include: [
        {
          model: Inventory,
          attributes: ["quantity"],
          required: false,
        },
      ],
      limit: Number.parseInt(limit),
      order: [["name", "ASC"]],
    })

    res.json(medications)
  } catch (error) {
    console.error("Search medications error:", error)
    res.status(500).json({ error: "Failed to search medications" })
  }
})

// Get medication categories
router.get("/categories/list", authenticateToken, async (req, res) => {
  try {
    const categories = await Medication.findAll({
      attributes: ["category"],
      group: ["category"],
      order: [["category", "ASC"]],
    })

    const categoryList = categories.map((item) => item.category).filter(Boolean)
    res.json(categoryList)
  } catch (error) {
    console.error("Get categories error:", error)
    res.status(500).json({ error: "Failed to fetch categories" })
  }
})

module.exports = router
