import { NextRequest, NextResponse } from "next/server"

/**
 * Next.js API Route - Alternative to Lambda Function
 * 
 * This endpoint receives form_data and voice_transcript from the frontend.
 * You can replace this with a Lambda function URL if you prefer AWS.
 * 
 * POST /api/submit-form
 * Body: { form_data: {...}, voice_transcript: "..." }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const formData = body.form_data || {}
    const voiceTranscript = body.voice_transcript || ""

    // Log the received data
    console.log("📝 Form Data:", formData)
    console.log("🎤 Voice Transcript:", voiceTranscript)

    // TODO: Add your processing logic here
    // Examples:
    // - Save to database (Prisma, MongoDB, etc.)
    // - Send to external API
    // - Process with AI/ML service
    // - Send email notifications
    // - etc.

    // Example: Validate required fields
    if (!formData.firstName) {
      return NextResponse.json(
        { success: false, error: "First name is required" },
        { status: 400 }
      )
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Data received successfully",
      received_at: new Date().toISOString(),
      form_data: formData,
      voice_transcript: voiceTranscript,
    })
  } catch (error) {
    console.error("❌ Error processing form submission:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
