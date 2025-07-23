import { type NextRequest, NextResponse } from "next/server"
import { Notification } from "@/server/models"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const type = searchParams.get("type")
    const isRead = searchParams.get("isRead")

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    const whereClause: any = { userId }
    if (type) whereClause.type = type
    if (isRead !== null) whereClause.isRead = isRead === "true"

    const notifications = await Notification.findAndCountAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    })

    return NextResponse.json({
      notifications: notifications.rows,
      total: notifications.count,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(notifications.count / limit),
    })
  } catch (error) {
    console.error("Get notifications error:", error)
    return NextResponse.json({ message: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, type, title, message, data, priority = "medium", methods = ["email"] } = body

    if (!userId || !type || !title || !message) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Create notification in database
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data,
      priority,
    })

    // Send actual notifications based on methods
    await sendNotificationMethods(notification, methods)

    return NextResponse.json({
      message: "Notification created and sent successfully",
      notification,
    })
  } catch (error) {
    console.error("Create notification error:", error)
    return NextResponse.json({ message: "Failed to create notification" }, { status: 500 })
  }
}

async function sendNotificationMethods(notification: any, methods: string[]) {
  try {
    // Get user details for contact information
    const { User } = require("@/server/models")
    const user = await User.findByPk(notification.userId)

    if (!user) {
      console.error("User not found for notification:", notification.userId)
      return
    }

    const promises = []

    // Send email notification
    if (methods.includes("email") && user.email) {
      promises.push(sendEmailNotification(user, notification))
    }

    // Send SMS notification
    if (methods.includes("sms") && user.phone) {
      promises.push(sendSMSNotification(user, notification))
    }

    // Send push notification
    if (methods.includes("push")) {
      promises.push(sendPushNotification(user, notification))
    }

    await Promise.allSettled(promises)
  } catch (error) {
    console.error("Error sending notification methods:", error)
  }
}

async function sendEmailNotification(user: any, notification: any) {
  try {
    const { sendEmail } = require("@/server/utils/emailService")

    const emailContent = {
      to: user.email,
      subject: notification.title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin: 0;">${notification.title}</h2>
            <p style="color: #666; margin: 5px 0 0 0;">Priority: ${notification.priority.toUpperCase()}</p>
          </div>
          
          <div style="padding: 20px; background-color: white; border-radius: 8px; border: 1px solid #e9ecef;">
            <p style="color: #333; line-height: 1.6; margin: 0 0 20px 0;">${notification.message}</p>
            
            ${
              notification.data
                ? `
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin-top: 20px;">
                <h4 style="color: #333; margin: 0 0 10px 0;">Additional Details:</h4>
                <pre style="color: #666; font-size: 12px; white-space: pre-wrap; margin: 0;">${JSON.stringify(
                  notification.data,
                  null,
                  2,
                )}</pre>
              </div>
            `
                : ""
            }
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px; color: #666; font-size: 12px;">
            <p>This is an automated message from your healthcare provider.</p>
            <p>Please do not reply to this email.</p>
          </div>
        </div>
      `,
    }

    await sendEmail(emailContent)
    console.log(`Email notification sent to ${user.email}`)
  } catch (error) {
    console.error("Error sending email notification:", error)
  }
}

async function sendSMSNotification(user: any, notification: any) {
  try {
    // This would integrate with an SMS service like Twilio
    const smsMessage = `${notification.title}\n\n${notification.message}\n\nPriority: ${notification.priority.toUpperCase()}`

    // Placeholder for SMS service integration
    console.log(`SMS notification would be sent to ${user.phone}:`, smsMessage)

    // Example Twilio integration:
    // const twilio = require('twilio');
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //   body: smsMessage,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: user.phone
    // });
  } catch (error) {
    console.error("Error sending SMS notification:", error)
  }
}

async function sendPushNotification(user: any, notification: any) {
  try {
    // This would integrate with a push notification service
    console.log(`Push notification would be sent to user ${user.id}:`, notification.title)

    // Example push notification integration:
    // const webpush = require('web-push');
    // await webpush.sendNotification(user.pushSubscription, JSON.stringify({
    //   title: notification.title,
    //   body: notification.message,
    //   data: notification.data
    // }));
  } catch (error) {
    console.error("Error sending push notification:", error)
  }
}
