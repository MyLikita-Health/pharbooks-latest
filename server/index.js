const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const { sequelize } = require("./models")
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")
const appointmentRoutes = require("./routes/appointments")
const prescriptionRoutes = require("./routes/prescriptions")
const pharmacyRoutes = require("./routes/pharmacy")
const notificationRoutes = require("./routes/notifications")

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/appointments", appointmentRoutes)
app.use("/api/prescriptions", prescriptionRoutes)
app.use("/api/pharmacy", pharmacyRoutes)
app.use("/api/notifications", notificationRoutes)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "API endpoint not found" })
})

// Database connection and server start
async function startServer() {
  try {
    await sequelize.authenticate()
    console.log("Database connection established successfully.")

    // Sync database models
    await sequelize.sync({ alter: true })
    console.log("Database models synchronized.")

    app.listen(PORT, () => {
      console.log(`MediLinka API server running on port ${PORT}`)
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`)
    })
  } catch (error) {
    console.error("Unable to start server:", error)
    process.exit(1)
  }
}

startServer()

module.exports = app
