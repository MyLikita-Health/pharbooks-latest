const express = require("express")
const jwt = require("jsonwebtoken")
const { User } = require("../models")
const { validateRegistration, validateLogin } = require("../middleware/validation")
const router = express.Router()

// Register
router.post("/register", validateRegistration, async (req, res) => {
  try {
    const { email, password, name, role, specialization, licenseNumber, phone } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" })
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      role,
      specialization,
      licenseNumber,
      phone,
    })

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || "medilinka-secret-key", {
      expiresIn: "7d",
    })

    res.status(201).json({
      message: "User registered successfully",
      user,
      token,
      requiresApproval: !user.isApproved,
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ message: "Registration failed", error: error.message })
  }
})

// Login
router.post("/login", validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password)
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Check if user is approved (except for patients)
    if (user.role !== "patient" && !user.isApproved) {
      return res.status(403).json({
        message: "Account pending approval",
        requiresApproval: true,
      })
    }

    // Update last login
    await user.update({ lastLoginAt: new Date() })

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || "medilinka-secret-key", {
      expiresIn: "7d",
    })

    res.json({
      message: "Login successful",
      user,
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Login failed", error: error.message })
  }
})

// Verify token
router.get("/verify", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]
    if (!token) {
      return res.status(401).json({ message: "No token provided" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "medilinka-secret-key")
    const user = await User.findByPk(decoded.userId)

    if (!user) {
      return res.status(401).json({ message: "Invalid token" })
    }

    res.json({ user, valid: true })
  } catch (error) {
    res.status(401).json({ message: "Invalid token", valid: false })
  }
})

module.exports = router
