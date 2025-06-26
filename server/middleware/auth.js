const jwt = require("jsonwebtoken")
const { User } = require("../models")

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({ message: "Access token required" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "medilinka-secret-key")
    const user = await User.findByPk(decoded.userId)

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid or inactive user" })
    }

    req.user = {
      userId: user.id,
      role: user.role,
      email: user.email,
      isApproved: user.isApproved,
    }

    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    return res.status(403).json({ message: "Invalid or expired token" })
  }
}

const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" })
    }

    // Additional check for non-patient roles
    if (req.user.role !== "patient" && !req.user.isApproved) {
      return res.status(403).json({ message: "Account pending approval" })
    }

    next()
  }
}

module.exports = {
  authenticateToken,
  authorizeRoles,
}
