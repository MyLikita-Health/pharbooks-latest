const { body, validationResult } = require("express-validator")

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.error("Validation errors:", errors.array())
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    })
  }
  next()
}

const validateRegistration = [
  body("email")
  .if(body("role").isIn(["doctor", "pharmacist"]))
    // .if(body("email").exists())
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required for healthcare professionals"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),
  body("role").isIn(["patient", "doctor", "pharmacist"]).withMessage("Invalid role"),
  body("phone").optional().isMobilePhone().withMessage("Valid phone number is required"),
  body("licenseNumber")
    .if(body("role").isIn(["doctor", "pharmacist"]))
    .notEmpty()
    .withMessage("License number is required for healthcare professionals"),
  handleValidationErrors,
]

const validateLogin = [
  body("email")
  .if(body("role").isIn(["doctor", "pharmacist"]))
  .isEmail()
  .normalizeEmail()
  .withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
]

const validateAppointment = [
  body("doctorId").isUUID().withMessage("Valid doctor ID is required"),
  body("appointmentDate").isISO8601().toDate().withMessage("Valid appointment date is required"),
  body("type").isIn(["video", "followup", "initial", "emergency"]).withMessage("Invalid appointment type"),
  body("symptoms").optional().trim().isLength({ max: 1000 }).withMessage("Symptoms description too long"),
  handleValidationErrors,
]

module.exports = {
  validateRegistration,
  validateLogin,
  validateAppointment,
}
