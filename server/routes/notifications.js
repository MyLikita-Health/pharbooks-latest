const express = require("express")
const { Notification } = require("../models")
const { authenticateToken } = require("../middleware/auth")
const router = express.Router()

// Get user notifications
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { isRead, limit = 20, offset = 0 } = req.query
    const userId = req.user.userId

    const whereClause = { userId }
    if (isRead !== undefined) whereClause.isRead = isRead === "true"

    const notifications = await Notification.findAndCountAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
    })

    res.json({
      notifications: notifications.rows,
      total: notifications.count,
      unreadCount: await Notification.count({ where: { userId, isRead: false } }),
    })
  } catch (error) {
    console.error("Get notifications error:", error)
    res.status(500).json({ message: "Failed to fetch notifications" })
  }
})

// Mark notification as read
router.patch("/:id/read", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const notification = await Notification.findOne({ where: { id, userId } })
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    await notification.update({ isRead: true, readAt: new Date() })

    res.json({ message: "Notification marked as read" })
  } catch (error) {
    console.error("Mark notification read error:", error)
    res.status(500).json({ message: "Failed to mark notification as read" })
  }
})

// Mark all notifications as read
router.patch("/read-all", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId

    await Notification.update({ isRead: true, readAt: new Date() }, { where: { userId, isRead: false } })

    res.json({ message: "All notifications marked as read" })
  } catch (error) {
    console.error("Mark all notifications read error:", error)
    res.status(500).json({ message: "Failed to mark all notifications as read" })
  }
})

module.exports = router
