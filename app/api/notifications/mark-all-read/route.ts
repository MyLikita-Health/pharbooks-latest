import { type NextRequest, NextResponse } from "next/server"
import { Notification } from "@/server/models"

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, notificationIds } = body

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    const whereClause: any = { userId, isRead: false }
    if (notificationIds && notificationIds.length > 0) {
      whereClause.id = notificationIds
    }

    const [updatedCount] = await Notification.update(
      {
        isRead: true,
        readAt: new Date().toISOString(),
      },
      {
        where: whereClause,
      },
    )

    return NextResponse.json({
      message: "Notifications marked as read successfully",
      updatedCount,
    })
  } catch (error) {
    console.error("Mark all as read error:", error)
    return NextResponse.json({ message: "Failed to mark notifications as read" }, { status: 500 })
  }
}
