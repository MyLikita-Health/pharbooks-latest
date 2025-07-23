const express = require("express")
const { Message, User } = require("../models")
const { authenticateToken } = require("../middleware/auth")
const { body, validationResult } = require("express-validator")
const { Op } = require("sequelize")
const router = express.Router()

// Get messages
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user
    const { limit = 10, offset = 0, unreadOnly = false } = req.query

    const whereClause = {
      [Op.or]: [{ senderId: userId }, { receiverId: userId }],
    }

    if (unreadOnly === "true") {
      whereClause.isRead = false
      whereClause.receiverId = userId
    }

    const messages = await Message.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: "Sender", attributes: ["id", "name", "role"] },
        { model: User, as: "Receiver", attributes: ["id", "name", "role"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
    })

    res.json({
      messages: messages.rows,
      total: messages.count,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(messages.count / limit),
    })
  } catch (error) {
    console.error("Get messages error:", error)
    res.status(500).json({ message: "Failed to fetch messages" })
  }
})

// Send message
router.post(
  "/",
  authenticateToken,
  [
    body("receiverId").isUUID().withMessage("Valid receiver ID required"),
    body("subject").trim().isLength({ min: 1, max: 200 }).withMessage("Subject is required (max 200 characters)"),
    body("content").trim().isLength({ min: 1, max: 2000 }).withMessage("Content is required (max 2000 characters)"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() })
      }

      const { receiverId, subject, content } = req.body
      const senderId = req.user.userId

      // Verify receiver exists
      const receiver = await User.findByPk(receiverId)
      if (!receiver) {
        return res.status(404).json({ message: "Receiver not found" })
      }

      const message = await Message.create({
        senderId,
        receiverId,
        subject,
        content,
      })

      const createdMessage = await Message.findByPk(message.id, {
        include: [
          { model: User, as: "Sender", attributes: ["id", "name", "role"] },
          { model: User, as: "Receiver", attributes: ["id", "name", "role"] },
        ],
      })

      res.status(201).json({
        message: "Message sent successfully",
        data: createdMessage,
      })
    } catch (error) {
      console.error("Send message error:", error)
      res.status(500).json({ message: "Failed to send message" })
    }
  },
)

// Mark message as read
router.patch("/:id/read", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.user

    const message = await Message.findOne({
      where: { id, receiverId: userId },
    })

    if (!message) {
      return res.status(404).json({ message: "Message not found" })
    }

    await message.update({ isRead: true })

    res.json({ message: "Message marked as read" })
  } catch (error) {
    console.error("Mark message as read error:", error)
    res.status(500).json({ message: "Failed to mark message as read" })
  }
})

// Get conversation between two users
router.get("/conversation/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId: otherUserId } = req.params
    const { userId } = req.user

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      include: [
        { model: User, as: "Sender", attributes: ["id", "name", "role"] },
        { model: User, as: "Receiver", attributes: ["id", "name", "role"] },
      ],
      order: [["createdAt", "ASC"]],
    })

    res.json({ messages })
  } catch (error) {
    console.error("Get conversation error:", error)
    res.status(500).json({ message: "Failed to fetch conversation" })
  }
})

module.exports = router
