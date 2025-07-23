const express = require("express")
const { Investigation, User, Appointment } = require("../models")
const { authenticateToken, authorizeRoles } = require("../middleware/auth")
const { body, validationResult } = require("express-validator")
const router = express.Router()

// Get investigations
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { role, userId } = req.user
    const { status, urgency, patientId, limit = 10, offset = 0 } = req.query

    const whereClause = {}
    const include = [
      { model: User, as: "Patient", attributes: ["id", "name", "email"] },
      { model: User, as: "Doctor", attributes: ["id", "name", "specialization"] },
      { model: Appointment, attributes: ["id", "appointmentDate"] },
    ]

    // Role-based filtering
    if (role === "patient") {
      whereClause.patientId = userId
    } else if (role === "doctor") {
      whereClause.doctorId = userId
    }

    // Additional filters
    if (status) whereClause.status = status
    if (urgency) whereClause.urgency = urgency
    if (patientId) whereClause.patientId = patientId

    const investigations = await Investigation.findAndCountAll({
      where: whereClause,
      include,
      order: [["createdAt", "DESC"]],
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
    })

    res.json({
      investigations: investigations.rows,
      total: investigations.count,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(investigations.count / limit),
    })
  } catch (error) {
    console.error("Get investigations error:", error)
    res.status(500).json({ message: "Failed to fetch investigations" })
  }
})

// Create investigation
router.post(
  "/",
  authenticateToken,
  authorizeRoles(["doctor"]),
  [
    body("appointmentId").isUUID().withMessage("Valid appointment ID required"),
    body("patientId").isUUID().withMessage("Valid patient ID required"),
    body("investigations").isArray({ min: 1 }).withMessage("At least one investigation required"),
    body("investigations.*.type").notEmpty().withMessage("Investigation type required"),
    body("investigations.*.name").notEmpty().withMessage("Investigation name required"),
    body("investigations.*.urgency").isIn(["routine", "urgent", "stat"]).withMessage("Valid urgency required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() })
      }

      const { appointmentId, patientId, investigations } = req.body
      const doctorId = req.user.userId

      // Verify appointment exists and belongs to doctor
      const appointment = await Appointment.findOne({
        where: { id: appointmentId, doctorId },
      })

      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" })
      }

      // Create investigations
      const createdInvestigations = await Promise.all(
        investigations.map((inv) =>
          Investigation.create({
            appointmentId,
            patientId,
            doctorId,
            type: inv.type,
            name: inv.name,
            urgency: inv.urgency,
            instructions: inv.instructions,
          }),
        ),
      )

      // Fetch complete investigations with relations
      const completeInvestigations = await Investigation.findAll({
        where: {
          id: createdInvestigations.map((inv) => inv.id),
        },
        include: [
          { model: User, as: "Patient", attributes: ["id", "name", "email"] },
          { model: User, as: "Doctor", attributes: ["id", "name", "specialization"] },
          { model: Appointment, attributes: ["id", "appointmentDate"] },
        ],
      })

      res.status(201).json({
        message: "Investigations created successfully",
        investigations: completeInvestigations,
      })
    } catch (error) {
      console.error("Create investigation error:", error)
      res.status(500).json({ message: "Failed to create investigations" })
    }
  },
)

// Update investigation status
router.patch("/:id/status", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { status, results, scheduledDate, completedDate } = req.body
    const { role, userId } = req.user

    const investigation = await Investigation.findByPk(id)
    if (!investigation) {
      return res.status(404).json({ message: "Investigation not found" })
    }

    // Authorization check
    if (role === "doctor" && investigation.doctorId !== userId) {
      return res.status(403).json({ message: "Access denied" })
    }

    const updateData = { status }
    if (results) updateData.results = results
    if (scheduledDate) updateData.scheduledDate = scheduledDate
    if (completedDate) updateData.completedDate = completedDate

    await investigation.update(updateData)

    const updatedInvestigation = await Investigation.findByPk(id, {
      include: [
        { model: User, as: "Patient", attributes: ["id", "name", "email"] },
        { model: User, as: "Doctor", attributes: ["id", "name", "specialization"] },
        { model: Appointment, attributes: ["id", "appointmentDate"] },
      ],
    })

    res.json({
      message: "Investigation updated successfully",
      investigation: updatedInvestigation,
    })
  } catch (error) {
    console.error("Update investigation error:", error)
    res.status(500).json({ message: "Failed to update investigation" })
  }
})

// Get investigation by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { role, userId } = req.user

    const whereClause = { id }

    // Role-based access control
    if (role === "patient") {
      whereClause.patientId = userId
    } else if (role === "doctor") {
      whereClause.doctorId = userId
    }

    const investigation = await Investigation.findOne({
      where: whereClause,
      include: [
        { model: User, as: "Patient", attributes: ["id", "name", "email", "phone"] },
        { model: User, as: "Doctor", attributes: ["id", "name", "specialization"] },
        { model: Appointment, attributes: ["id", "appointmentDate", "symptoms"] },
      ],
    })

    if (!investigation) {
      return res.status(404).json({ message: "Investigation not found" })
    }

    res.json({ investigation })
  } catch (error) {
    console.error("Get investigation error:", error)
    res.status(500).json({ message: "Failed to fetch investigation" })
  }
})

module.exports = router
