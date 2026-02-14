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
 * 
 * If no URL is set, defaults to Next.js API route (which proxies to Lambda)
 * This avoids CORS issues by making requests server-side.
 */
function getBackendUrl(): string {
  // Option 1: Use Next.js API route (recommended - no CORS issues)
  // This proxies to Lambda server-side
  return "/api/submit-form"
  
  // Option 2: Use Lambda URL directly (requires CORS to be enabled)
  // Uncomment below and comment above if you enable CORS on Lambda
  /*
  const url = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 
              process.env.NEXT_PUBLIC_LAMBDA_URL
  
  if (!url) {
    // Fallback to API route if no URL configured
    return "/api/submit-form"
  }
  
  return url
  */
}

// Import shared profile formatter to avoid code duplication
import { formatProfileDescription } from "./profile-formatter"

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
    
    // Ensure voice transcript is a string and trim it
    const cleanVoiceTranscript = (voiceTranscript || "").toString().trim()
    
    // Format the profile description from form data and voice transcript
    const profileDescription = formatProfileDescription(formData, cleanVoiceTranscript)
    
    // CRITICAL VALIDATION: Check if profile is meaningful
    const profileLength = profileDescription?.trim().length || 0
    
    console.log("🔍 Profile Validation Check:", {
      profileLength,
      profilePreview: profileDescription?.substring(0, 150) || "EMPTY",
      formDataKeys: Object.keys(formData),
      formDataValuesWithContent: Object.values(formData).filter(v => v && v.toString().trim().length > 0).length,
      voiceTranscriptLength: cleanVoiceTranscript.length,
      voiceTranscriptPreview: cleanVoiceTranscript.substring(0, 100) || "EMPTY",
      formDataSample: JSON.stringify(formData).substring(0, 300)
    })
    
    // Validate that we have meaningful profile data
    // Lower threshold to 10 characters to be more lenient
    if (!profileDescription || profileLength < 10) {
      const errorMsg = "Please provide more information. Fill out more form fields or speak longer during the voice conversation."
      
      // If voice transcript is empty but form data exists, provide more specific error
      if (cleanVoiceTranscript.length === 0 && Object.keys(formData).length > 0) {
        const formDataValues = Object.values(formData).filter(v => v && v.toString().trim().length > 0)
        if (formDataValues.length < 3) {
          const moreSpecificError = "Please fill out at least 3 form fields, or provide voice responses during the conversation."
          console.error("⚠️  Insufficient form data and no voice transcript")
          return {
            success: false,
            message: moreSpecificError,
          }
        } else {
          const moreSpecificError = "Voice responses were not captured. The form data alone might not be enough. Please try speaking again or ensure your microphone is working."
          console.error("⚠️  Voice transcript is empty but form data exists")
          return {
            success: false,
            message: moreSpecificError,
          }
        }
      }
      
      // If form data is minimal and voice is empty
      if (Object.keys(formData).filter(k => formData[k] && formData[k].toString().trim()).length < 3 && cleanVoiceTranscript.length === 0) {
        const moreSpecificError = "Please provide more information. Fill out at least 3 form fields or speak during the voice conversation."
        return {
          success: false,
          message: moreSpecificError,
        }
      }
      
      return {
        success: false,
        message: errorMsg,
      }
    }
    
    const payload: BackendPayload = {
      user_partner_profile: profileDescription,
    }

    // Print detailed input information - FRONTEND PAYLOAD TO LAMBDA
    console.log("=" .repeat(80))
    console.log("🚀 FRONTEND → LAMBDA PAYLOAD")
    console.log("=" .repeat(80))
    console.log("📍 Backend URL:", url)
    console.log("\n📋 RAW FORM DATA:")
    console.log(JSON.stringify(formData, null, 2))
    console.log("\n🎤 RAW VOICE TRANSCRIPT:")
    console.log(`"${voiceTranscript}"`)
    console.log("\n📝 FORMATTED PROFILE DESCRIPTION (user_partner_profile):")
    console.log(`"${profileDescription}"`)
    console.log("\n📦 FINAL PAYLOAD TO LAMBDA (JSON):")
    const payloadJson = JSON.stringify(payload, null, 2)
    console.log(payloadJson)
    console.log("\n📦 FINAL PAYLOAD TO LAMBDA (One-line, ready to send):")
    console.log(JSON.stringify(payload))
    console.log("\n📏 PAYLOAD STATISTICS:")
    console.log(`   - Form data fields: ${Object.keys(formData).length}`)
    console.log(`   - Voice transcript: ${voiceTranscript.length} characters`)
    console.log(`   - Profile description: ${profileDescription.length} characters`)
    console.log(`   - Payload JSON size: ${payloadJson.length} bytes`)
    console.log(`   - Payload (one-line): ${JSON.stringify(payload).length} bytes`)
    console.log("\n🔍 PAYLOAD BREAKDOWN:")
    console.log(`   - user_partner_profile field: ${payload.user_partner_profile.length} characters`)
    console.log("=" .repeat(80))

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
      
      // Try to parse error response to extract clean error message
      let errorMessage = `Backend request failed: ${response.status} ${response.statusText}`
      
      try {
        // Try to extract JSON from error response
        const firstBrace = errorText.indexOf('{')
        if (firstBrace !== -1) {
          let jsonEnd = firstBrace
          let braceCount = 0
          let inString = false
          let escapeNext = false
          
          for (let i = firstBrace; i < errorText.length; i++) {
            const char = errorText[i]
            
            if (escapeNext) {
              escapeNext = false
              continue
            }
            
            if (char === '\\') {
              escapeNext = true
              continue
            }
            
            if (char === '"') {
              inString = !inString
              continue
            }
            
            if (!inString) {
              if (char === '{') braceCount++
              if (char === '}') {
                braceCount--
                if (braceCount === 0) {
                  jsonEnd = i + 1
                  break
                }
              }
            }
          }
          
          if (braceCount === 0 && jsonEnd > firstBrace) {
            const jsonStr = errorText.substring(firstBrace, jsonEnd)
            const errorData = JSON.parse(jsonStr)
            
            if (errorData.error) {
              errorMessage = errorData.error
            } else if (errorData.message) {
              errorMessage = errorData.message
            } else if (errorData.success === false) {
              errorMessage = errorData.error || errorData.message || "Request failed"
            }
          }
        }
      } catch (e) {
        // If parsing fails, use a generic message to avoid showing raw error with "Extra data"
        console.error("Failed to parse error response:", e)
        errorMessage = "An error occurred processing your request. Please try again."
      }
      
      // Don't throw - return error response instead
      return {
        success: false,
        message: errorMessage,
      }
    }

    const responseData = await response.json()
    
    // The API route returns { success: true, data: lambdaData }
    // So responseData.data contains the actual Lambda response
    // If responseData already has the structure we expect, use it directly
    if (responseData.success && responseData.data) {
      // API route format: { success: true, data: { score, summary, meta } }
      return {
        success: true,
        data: responseData.data, // Extract the actual Lambda data
      }
    } else if (responseData.score !== undefined || responseData.summary) {
      // Direct Lambda response format: { score, summary, meta }
      return {
        success: true,
        data: responseData, // Use the response directly
      }
    } else {
      // Fallback: return as-is
      return {
        success: true,
        data: responseData,
      }
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
    
    // Don't throw - return error response instead
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
