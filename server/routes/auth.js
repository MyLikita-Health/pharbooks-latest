const express = require("express")
const jwt = require("jsonwebtoken")
const { User } = require("../models")
const { validateRegistration, validateLogin } = require("../middleware/validation")
const router = express.Router()
const { Op } = require("sequelize")

const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Register
router.post("/register", validateRegistration, async (req, res) => {
  try {
    const { email, password, name, role, specialization, licenseNumber, phone } = req.body

  console.log("Registration request:", req.body)

    // Check if user already exists
const existingUser = await User.findOne({
  where: {
    [Op.or]: [
      { email },
      { phone }
    ],
  },
})
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email or phone number" })
    }

     const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    // Create user with OTP included
    const user = await User.create({
      email,
      password,
      name,
      role,
      specialization,
      licenseNumber,
      phone,
      otp,
      otpExpiresAt,
      isApproved: role === "patient", // Auto-approve patients
    });

    console.log("OTP for registration created:", otp); // Log the OTP for debugging
    console.log("User created:", user)

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, requiresOTP: true, role: user.role }, process.env.JWT_SECRET || "medilinka-secret-key", {
      expiresIn: "7d",
    })

    res.status(201).json({
      message: "User registered successfully and OTP sent to the given phonenumner Successfully",
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
    const { email, password, phone } = req.body;
    console.log("Login request:", req.body);

    if (!email && !phone) {
      return res.status(400).json({ message: "Email or phone is required" });
    }

    // Build query
    const whereClause = {
      [Op.or]: []
    };
    if (email) whereClause[Op.or].push({ email });
    if (phone) whereClause[Op.or].push({ phone });

    const user = await User.findOne({ where: whereClause });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    console.log("User password from DB:", user.password);

    // 💡 Always require OTP for non-patients
    const requiresOTP = true;

    if (requiresOTP) {
      const otp = generateOTP();
      const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await user.update({ otp, otpExpiresAt });

      console.log(`OTP for login (user: ${user.email || user.phone}):`, otp);

      const token = jwt.sign(
        { userId: user.id, requiresOTP: true, role: user.role },
        process.env.JWT_SECRET || "medilinka-secret-key",
        { expiresIn: "15m" }
      );

      return res.status(200).json({
        message: "OTP sent to your phone",
        token,
        requiresOTP: true,
        userId: user.id,
        otp // for dev/test only
      });
    }

    // ✅ For patients, complete login
    await user.update({ lastLoginAt: new Date() });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || "medilinka-secret-key",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});



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

router.post("/verify-otp", async (req, res) => {
  try {
    const { token, otp } = req.body; // Destructure from request body
    
    if (!token || !otp) {
      return res.status(400).json({ 
        message: "Both token and OTP are required" 
      });
    }

    // Verify the token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || "medilinka-secret-key"
    );
    
    if (!decoded.requiresOTP) {
      return res.status(400).json({ 
        message: "Invalid verification request" 
      });
    }

    // Find the user
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP code" });
    }

    // Check OTP hasn't expired
    if (new Date(user.otpExpiresAt) < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Mark user as approved and clear OTP
    await user.update({
      isApproved: true,
      otp: null,
      otpExpiresAt: null
    });

    // Generate new full-access token
    const newToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || "medilinka-secret-key",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Verification successful",
      user,
      token: newToken
    });

  } catch (error) {
    console.error("OTP verification error:", error);
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    
    res.status(500).json({ 
      message: "Verification failed", 
      error: error.message 
    });
  }
});

// router.post("/verify-otp", async (req, res) => {
//   try {
//     // const { token, otp } = req.body;

//     // Verify temp token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     if (!decoded.requiresOTP) {
//       return res.status(400).json({ message: "Invalid verification request" });
//     }

//     // Find user
//     const user = await User.findByPk(decoded.userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Check OTP
//     if (user.otp !== otp) {
//       return res.status(400).json({ message: "Invalid OTP" });
//     }

//     // Check if OTP expired
//     if (new Date(user.otpExpiresAt) < new Date()) {
//       return res.status(400).json({ message: "OTP expired" });
//     }

//     // Mark user as verified and clear OTP
//     await user.update({
//       isApproved: true,
//       otp: null,
//       otpExpiresAt: null
//     });

//     // Generate full auth token
//     const token = jwt.sign(
//       { userId: user.id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.json({
//       message: "Verification successful",
//       user,
//       token
//     });

//   } catch (error) {
//     console.error("OTP verification error:", error);
//     res.status(500).json({ message: "Verification failed", error: error.message });
//   }
// });


// Add this to your auth middleware
router.post("/resend-otp", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await user.update({ otp, otpExpiresAt });

    console.log("New OTP:", otp); // Log for development

    res.json({
      message: "New OTP generated",
      otpExpiresAt
    });

  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: "Failed to resend OTP", error: error.message });
  }
});

module.exports = router
