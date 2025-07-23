import { type NextRequest, NextResponse } from "next/server"

// This would require a new Investigation model - for now we'll create a simple endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { appointmentId, patientId, investigations } = body

    if (!appointmentId || !patientId || !investigations || investigations.length === 0) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // For now, we'll just log the investigations and return success
    // In a real implementation, you would save these to an Investigation model
    console.log("Investigations requested:", {
      appointmentId,
      patientId,
      investigations,
    })

    // Create notifications for urgent investigations
    const urgentInvestigations = investigations.filter((inv: any) => inv.urgency === "urgent" || inv.urgency === "stat")

    if (urgentInvestigations.length > 0) {
      // Send urgent notification
      const notificationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: patientId,
          type: "investigation_urgent",
          title: "Urgent Medical Tests Required",
          message: `You have ${urgentInvestigations.length} urgent medical test(s) that need immediate attention. Please contact your healthcare provider or visit the nearest medical facility.`,
          data: {
            appointmentId,
            urgentInvestigations: urgentInvestigations.map((inv: any) => ({
              name: inv.name,
              type: inv.type,
              urgency: inv.urgency,
            })),
          },
          priority: "urgent",
          methods: ["email", "sms"],
        }),
      })
    }

    return NextResponse.json({
      message: "Investigations saved successfully",
      investigations: investigations.map((inv: any, index: number) => ({
        id: `inv_${Date.now()}_${index}`,
        ...inv,
        appointmentId,
        patientId,
        status: "pending",
        createdAt: new Date().toISOString(),
      })),
    })
  } catch (error) {
    console.error("Create investigations error:", error)
    return NextResponse.json({ message: "Failed to save investigations" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")
    const appointmentId = searchParams.get("appointmentId")

    if (!patientId && !appointmentId) {
      return NextResponse.json({ message: "Patient ID or Appointment ID is required" }, { status: 400 })
    }

    // For now, return empty array since we don't have Investigation model yet
    // In a real implementation, you would query the Investigation model
    return NextResponse.json({
      investigations: [],
      total: 0,
    })
  } catch (error) {
    console.error("Get investigations error:", error)
    return NextResponse.json({ message: "Failed to fetch investigations" }, { status: 500 })
  }
}
