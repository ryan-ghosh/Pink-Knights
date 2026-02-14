/**
 * Backend Client - Sends data to your backend (Lambda, Next.js API, or any endpoint)
 * 
 * This function sends both form_data and voice_transcript to your backend endpoint.
 * 
 * Your API Gateway expects:
 * {
 *   "user_partner_profile": "Combined text description from form and voice"
 * }
 */

interface BackendPayload {
  user_partner_profile: string
}

interface BackendResponse {
  success: boolean
  message?: string
  data?: any
}

/**
 * Get the backend URL from environment variable
 * Avoids hardcoding - uses environment variable for configuration
 */
function getBackendUrl(): string {
  // Get URL from environment variable (should be set in .env.local)
  const url = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 
              process.env.NEXT_PUBLIC_LAMBDA_URL
  
  if (!url) {
    throw new Error(
      "API Gateway URL not configured. Please set NEXT_PUBLIC_API_GATEWAY_URL in .env.local"
    )
  }
  
  return url
}

/**
 * Convert form data and voice transcript into a natural language profile description
 * 
 * @param formData - The form data object
 * @param voiceTranscript - The transcribed voice text
 * @returns A formatted profile description string
 */
function formatProfileDescription(
  formData: Record<string, any>,
  voiceTranscript: string
): string {
  const parts: string[] = []

  // Add voice transcript first (most natural/personal)
  if (voiceTranscript.trim()) {
    parts.push(voiceTranscript.trim())
  }

  // Add key form fields as natural language
  const additions: string[] = []

  if (formData.jobTitle) {
    additions.push(`Works as a ${formData.jobTitle}`)
    if (formData.employer) {
      additions[additions.length - 1] += ` at ${formData.employer}`
    }
  }

  if (formData.education) {
    additions.push(`Has a ${formData.education}`)
  }

  if (formData.location) {
    additions.push(`Lives in ${formData.location}`)
  }

  if (formData.lookingFor) {
    additions.push(`Looking for ${formData.lookingFor.toLowerCase()}`)
  }

  // Lifestyle preferences
  const lifestyle: string[] = []
  if (formData.drinking && formData.drinking !== "No") {
    lifestyle.push(`drinks ${formData.drinking.toLowerCase()}`)
  }
  if (formData.smoking && formData.smoking !== "No") {
    lifestyle.push(`smokes ${formData.smoking.toLowerCase()}`)
  }
  if (formData.politics) {
    lifestyle.push(`politically ${formData.politics.toLowerCase()}`)
  }

  if (lifestyle.length > 0) {
    additions.push(lifestyle.join(", "))
  }

  // Combine everything
  if (additions.length > 0) {
    parts.push(additions.join(". ") + ".")
  }

  // If we have nothing, create a basic description
  if (parts.length === 0) {
    return "Profile information provided."
  }

  return parts.join(" ")
}

/**
 * Send form data and voice transcript to backend
 * 
 * Combines form data and voice transcript into a natural language profile description
 * and sends it to your API Gateway endpoint.
 * 
 * @param formData - The form data object
 * @param voiceTranscript - The transcribed voice text
 * @param customUrl - Optional: Custom backend URL (overrides default)
 * @returns Promise with backend response
 * 
 * @example
 * // Use default API Gateway endpoint
 * await sendToBackend(formData, transcript)
 * 
 * @example
 * // Use custom endpoint
 * await sendToBackend(formData, transcript, "https://custom-api.com/endpoint")
 */
export async function sendToBackend(
  formData: Record<string, any>,
  voiceTranscript: string,
  customUrl?: string
): Promise<BackendResponse> {
  try {
    const url = customUrl || getBackendUrl()
    
    // Format the profile description from form data and voice transcript
    const profileDescription = formatProfileDescription(formData, voiceTranscript)
    
    const payload: BackendPayload = {
      user_partner_profile: profileDescription,
    }

    console.log("📤 Sending to API Gateway:", url)
    console.log("📝 Profile description:", profileDescription)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      // Add mode and credentials for CORS
      mode: "cors",
      credentials: "omit",
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Backend request failed: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error("❌ Error sending to backend:", error)
    
    // Provide more helpful error messages
    let errorMessage = "Unknown error"
    if (error instanceof TypeError && error.message.includes("fetch")) {
      errorMessage = "Failed to connect to API. This might be a CORS issue. Please check:\n1. API Gateway has CORS enabled\n2. The API endpoint URL is correct\n3. You're not blocking requests in browser settings"
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return {
      success: false,
      message: errorMessage,
    }
  }
}

/**
 * @deprecated Use sendToBackend() instead
 * Send form data and voice transcript to Lambda function
 * 
 * @param lambdaUrl - Your Lambda function URL
 * @param formData - The form data object
 * @param voiceTranscript - The transcribed voice text
 * @returns Promise with Lambda response
 */
export async function sendToLambda(
  lambdaUrl: string,
  formData: Record<string, any>,
  voiceTranscript: string
): Promise<BackendResponse> {
  return sendToBackend(formData, voiceTranscript, lambdaUrl)
}

/**
 * Send to API Gateway endpoint (alias for sendToBackend)
 * 
 * @param apiGatewayUrl - Your API Gateway endpoint
 * @param formData - The form data object
 * @param voiceTranscript - The transcribed voice text
 */
export async function sendToApiGateway(
  apiGatewayUrl: string,
  formData: Record<string, any>,
  voiceTranscript: string
): Promise<BackendResponse> {
  return sendToBackend(formData, voiceTranscript, apiGatewayUrl)
}
