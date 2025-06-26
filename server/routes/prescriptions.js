const express = require("express")
const { Prescription, Medication, User, PharmacyOrder } = require("../models")
const { authenticateToken, authorizeRoles } = require("../middleware/auth")
const { body, validationResult } = require("express-validator")
const router = express.Router()

// Get prescriptions (role-based)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { role, userId } = req.user
    const { status, limit = 10, offset = 0 } = req.query

    const whereClause = {}
    const include = [
      { model: Medication },
      { model: User, as: "Patient", attributes: ["id", "name"] },
      { model: User, as: "Doctor", attributes: ["id", "name", "specialization"] },
    ]

    if (role === "patient") {
      whereClause.patientId = userId
    } else if (role === "doctor") {
      whereClause.doctorId = userId
    }

    if (status) whereClause.status = status

    const prescriptions = await Prescription.findAndCountAll({
      where: whereClause,
      include,
      order: [["createdAt", "DESC"]],
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
    })

    res.json({
      prescriptions: prescriptions.rows,
      total: prescriptions.count,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(prescriptions.count / limit),
    })
  } catch (error) {
    console.error("Get prescriptions error:", error)
    res.status(500).json({ message: "Failed to fetch prescriptions" })
  }
})

// Create prescription (doctors only)
router.post(
  "/",
  authenticateToken,
  authorizeRoles(["doctor"]),
  [
    body("patientId").isUUID().withMessage("Valid patient ID required"),
    body("diagnosis").optional().trim().isLength({ max: 1000 }),
    body("instructions").optional().trim().isLength({ max: 1000 }),
    body("medications").isArray({ min: 1 }).withMessage("At least one medication required"),
    body("medications.*.name").notEmpty().withMessage("Medication name required"),
    body("medications.*.dosage").notEmpty().withMessage("Dosage required"),
    body("medications.*.frequency").notEmpty().withMessage("Frequency required"),
    body("medications.*.duration").notEmpty().withMessage("Duration required"),
    body("medications.*.quantity").isInt({ min: 1 }).withMessage("Valid quantity required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() })
      }

      const { patientId, diagnosis, instructions, medications, appointmentId } = req.body
      const doctorId = req.user.userId

      // Verify patient exists
      const patient = await User.findOne({ where: { id: patientId, role: "patient" } })
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" })
      }

      // Create prescription
      const prescription = await Prescription.create({
        patientId,
        doctorId,
        appointmentId,
        diagnosis,
        instructions,
      })

      // Create medications
      const medicationPromises = medications.map((med) =>
        Medication.create({
          prescriptionId: prescription.id,
          ...med,
        }),
      )

      await Promise.all(medicationPromises)

      // Fetch complete prescription
      const completePrescription = await Prescription.findByPk(prescription.id, {
        include: [
          { model: Medication },
          { model: User, as: "Patient", attributes: ["id", "name"] },
          { model: User, as: "Doctor", attributes: ["id", "name", "specialization"] },
        ],
      })

      res.status(201).json({
        message: "Prescription created successfully",
        prescription: completePrescription,
      })
    } catch (error) {
      console.error("Create prescription error:", error)
      res.status(500).json({ message: "Failed to create prescription" })
    }
  },
)

// Update prescription status
router.patch("/:id/status", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const { role, userId } = req.user

    const prescription = await Prescription.findByPk(id)
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" })
    }

    // Authorization check
    if (role === "doctor" && prescription.doctorId !== userId) {
      return res.status(403).json({ message: "Access denied" })
    }

    await prescription.update({ status })

    res.json({
      message: "Prescription status updated successfully",
      prescription,
    })
  } catch (error) {
    console.error("Update prescription error:", error)
    res.status(500).json({ message: "Failed to update prescription" })
  }
})

module.exports = router
