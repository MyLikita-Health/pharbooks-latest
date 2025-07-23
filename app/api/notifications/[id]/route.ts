import { type NextRequest, NextResponse } from "next/server"
import { Notification } from "@/server/models"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { isRead, readAt } = body

    const notification = await Notification.findByPk(id)
    if (!notification) {
      return NextResponse.json({ message: "Notification not found" }, { status: 404 })
    }

    await notification.update({
      isRead: isRead !== undefined ? isRead : notification.isRead,
      readAt: readAt || (isRead ? new Date().toISOString() : notification.readAt),
    })

    return NextResponse.json({
      message: "Notification updated successfully",
      notification,
    })
  } catch (error) {
    console.error("Update notification error:", error)
    return NextResponse.json({ message: "Failed to update notification" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const notification = await Notification.findByPk(id)
    if (!notification) {
      return NextResponse.json({ message: "Notification not found" }, { status: 404 })
    }

    await notification.destroy()

    return NextResponse.json({
      message: "Notification deleted successfully",
    })
  } catch (error) {
    console.error("Delete notification error:", error)
    return NextResponse.json({ message: "Failed to delete notification" }, { status: 500 })
  }
}
