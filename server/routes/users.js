const express = require("express")
const { User } = require("../models")
const { authenticateToken, authorizeRoles } = require("../middleware/auth")
const { Op } = require("sequelize")
const router = express.Router()

// Get all users (admin only)
router.get("/", authenticateToken, authorizeRoles(["admin"]), async (req, res) => {
  try {
    const { role, status, search, limit = 10, offset = 0 } = req.query

    const whereClause = {}
    if (role) whereClause.role = role
    if (status === "approved") whereClause.isApproved = true
    if (status === "pending") whereClause.isApproved = false
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { licenseNumber: { [Op.like]: `%${search}%` } },
      ]
    }

    const users = await User.findAndCountAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
    })

    res.json({
      users: users.rows,
      total: users.count,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(users.count / limit),
    })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({ message: "Failed to fetch users" })
  }
})

// Get user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json({ user })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ message: "Failed to fetch profile" })
  }
})

// Update user profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { name, phone, address, specialization } = req.body
    const user = await User.findByPk(req.user.userId)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    await user.update({
      name: name || user.name,
      phone: phone || user.phone,
      address: address || user.address,
      specialization: specialization || user.specialization,
    })

    res.json({ message: "Profile updated successfully", user })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({ message: "Failed to update profile" })
  }
})

// Approve/reject user (admin only)
router.patch("/:id/approval", authenticateToken, authorizeRoles(["admin"]), async (req, res) => {
  try {
    const { id } = req.params
    const { isApproved, rejectionReason } = req.body

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    await user.update({ isApproved })

    res.json({
      message: `User ${isApproved ? "approved" : "rejected"} successfully`,
      user,
    })
  } catch (error) {
    console.error("User approval error:", error)
    res.status(500).json({ message: "Failed to update user approval" })
  }
})

// Get doctors list
router.get("/doctors", authenticateToken, async (req, res) => {
  try {
    const { specialization } = req.query

    const whereClause = {
      role: "doctor",
      isApproved: true,
      isActive: true,
    }

    if (specialization) {
      whereClause.specialization = { [Op.like]: `%${specialization}%` }
    }

    const doctors = await User.findAll({
      where: whereClause,
      attributes: ["id", "name", "specialization", "avatar"],
      order: [["name", "ASC"]],
    })

    res.json({ doctors })
  } catch (error) {
    console.error("Get doctors error:", error)
    res.status(500).json({ message: "Failed to fetch doctors" })
  }
})

module.exports = router
