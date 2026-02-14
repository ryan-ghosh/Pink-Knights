import { NextRequest, NextResponse } from "next/server"
import { formatProfileDescription } from "@/lib/profile-formatter"

/**
 * Next.js API Route - Proxies to Lambda Function
 * 
 * This endpoint receives form_data and voice_transcript from the frontend,
 * formats it as user_partner_profile, and forwards it to your Lambda function.
 * 
 * This avoids CORS issues by making the request server-side.
 * 
 * POST /api/submit-form
 * Body: { form_data: {...}, voice_transcript: "..." }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // The frontend sends { user_partner_profile: "..." } directly
    // But we also support { form_data: {...}, voice_transcript: "..." } for backwards compatibility
    let userPartnerProfile: string
    
    if (body.user_partner_profile) {
      // Frontend already formatted it - use directly
      userPartnerProfile = body.user_partner_profile
    } else if (body.form_data || body.voice_transcript) {
      // Legacy format - format it ourselves
      const formData = body.form_data || {}
      const voiceTranscript = body.voice_transcript || ""
      userPartnerProfile = formatProfileDescription(formData, voiceTranscript)
    } else {
      // No data provided
      return NextResponse.json(
        {
          success: false,
          error: "Missing required data. Please provide user_partner_profile or form_data with voice_transcript.",
        },
        { status: 400 }
      )
    }
    
    // Validate that we have meaningful profile data
    // Lower threshold to 10 characters to be more lenient
    if (!userPartnerProfile || userPartnerProfile.trim().length < 10) {
      console.error("❌ Profile validation failed:", {
        profileLength: userPartnerProfile?.length || 0,
        profilePreview: userPartnerProfile?.substring(0, 100) || "EMPTY",
        bodyKeys: Object.keys(body),
        hasUserPartnerProfile: !!body.user_partner_profile,
        hasFormData: !!body.form_data,
        hasVoiceTranscript: !!body.voice_transcript
      })
      return NextResponse.json(
        {
          success: false,
          error: "Please provide more information. Fill out more form fields or speak longer during the voice conversation.",
        },
        { status: 400 }
      )
    }

    // Get Lambda URL from environment
    const lambdaUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 
                      process.env.NEXT_PUBLIC_LAMBDA_URL ||
                      "https://33khcxehd2.execute-api.us-east-1.amazonaws.com/default/columbiahacks"

    // Print detailed input information
    console.log("=" .repeat(70))
    console.log("📥 INPUT TO LAMBDA")
    console.log("=" .repeat(70))
    console.log("📤 Lambda URL:", lambdaUrl)
    if (body.form_data) {
      console.log("\n📋 FORM DATA:")
      console.log(JSON.stringify(body.form_data, null, 2))
    }
    if (body.voice_transcript) {
      console.log("\n🎤 VOICE TRANSCRIPT:")
      console.log(body.voice_transcript)
    }
    console.log("\n📝 PROFILE DESCRIPTION (user_partner_profile):")
    console.log(userPartnerProfile)
    console.log("\n📊 FINAL PAYLOAD TO LAMBDA:")
    const finalPayload = { user_partner_profile: userPartnerProfile }
    console.log(JSON.stringify(finalPayload, null, 2))
    console.log("\n📏 PAYLOAD STATS:")
    if (body.form_data) {
      console.log(`   - Form data fields: ${Object.keys(body.form_data).length}`)
    }
    if (body.voice_transcript) {
      console.log(`   - Voice transcript length: ${body.voice_transcript.length} characters`)
    }
    console.log(`   - Profile description length: ${userPartnerProfile.length} characters`)
    console.log(`   - Final payload size: ${JSON.stringify(finalPayload).length} bytes`)
    console.log("=" .repeat(70))

    // Forward to Lambda function (server-side, no CORS issues)
    const lambdaResponse = await fetch(lambdaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_partner_profile: userPartnerProfile,
      }),
    })

    if (!lambdaResponse.ok) {
      const errorText = await lambdaResponse.text()
      console.error("❌ Lambda error response (first 1000 chars):", errorText.substring(0, 1000))
      console.error("❌ Lambda status:", lambdaResponse.status, lambdaResponse.statusText)
      
      // Try to parse error response - handle extra data robustly
      let errorMessage = `Lambda request failed: ${lambdaResponse.status} ${lambdaResponse.statusText}`
      
      // Strategy: Extract first valid JSON object using brace matching
      try {
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
            try {
              const errorData = JSON.parse(jsonStr)
              
              // Check for nested body structure
              if (errorData.body && typeof errorData.body === 'string') {
                try {
                  const bodyData = JSON.parse(errorData.body)
                  if (bodyData.error) {
                    errorMessage = bodyData.error
                  } else if (bodyData.success === false && bodyData.error) {
                    errorMessage = bodyData.error
                  }
                } catch (e) {
                  // Try extracting JSON from body
                  const bodyFirstBrace = errorData.body.indexOf('{')
                  if (bodyFirstBrace !== -1) {
                    const bodyLastBrace = errorData.body.lastIndexOf('}')
                    if (bodyLastBrace > bodyFirstBrace) {
                      try {
                        const bodyJson = errorData.body.substring(bodyFirstBrace, bodyLastBrace + 1)
                        const bodyData = JSON.parse(bodyJson)
                        if (bodyData.error) {
                          errorMessage = bodyData.error
                        }
                      } catch (e2) {
                        // Ignore
                      }
                    }
                  }
                }
              } else if (errorData.error) {
                errorMessage = errorData.error
              } else if (errorData.success === false && errorData.error) {
                errorMessage = errorData.error
              }
            } catch (e) {
              // JSON extraction failed, use default message
              console.error("Failed to parse extracted JSON:", e)
            }
          }
        }
      } catch (e) {
        // All parsing failed, use a generic message
        console.error("Error parsing Lambda error response:", e)
        errorMessage = "An error occurred processing your request. Please try again."
      }
      
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: lambdaResponse.status }
      )
    }

    let lambdaData
    try {
      const responseText = await lambdaResponse.text()
      console.log("📥 Lambda raw response (first 800 chars):", responseText.substring(0, 800))
      console.log("📥 Lambda raw response length:", responseText.length)
      
      // Try multiple parsing strategies
      let parsed: any = null
      let parseError: Error | null = null
      
      // Strategy 1: Try parsing the entire response as JSON
      try {
        parsed = JSON.parse(responseText)
        console.log("📥 Strategy 1: Parsed entire response as JSON")
      } catch (e) {
        parseError = e as Error
        console.log("📥 Strategy 1 failed:", parseError.message)
      }
      
      // Strategy 2: If parsed, check if it has a 'body' field (Lambda proxy format)
      if (parsed) {
        // Lambda returns: { statusCode: 200, body: "{\"score\": 87, ...}" }
        // We need to extract and parse the body field
        if (parsed.statusCode !== undefined && parsed.body && typeof parsed.body === 'string') {
          console.log("📥 Strategy 2: Found Lambda proxy response (statusCode + body), extracting body...")
          const bodyString = parsed.body
          try {
            // Try parsing the body string directly
            const bodyData = JSON.parse(bodyString)
            console.log("📥 Strategy 2: Successfully parsed body JSON")
            lambdaData = bodyData
          } catch (e) {
            console.log("📥 Strategy 2: Direct parse failed, trying extraction from body string...")
            // Extract JSON from body string
            const firstBrace = bodyString.indexOf('{')
            const lastBrace = bodyString.lastIndexOf('}')
            if (firstBrace !== -1 && lastBrace > firstBrace) {
              try {
                const extracted = bodyString.substring(firstBrace, lastBrace + 1)
                lambdaData = JSON.parse(extracted)
                console.log("📥 Strategy 2: Successfully extracted and parsed JSON from body")
              } catch (e2) {
                console.error("📥 Strategy 2: Failed to extract JSON from body:", e2)
                // Fall through to next strategy
              }
            }
          }
        } else if (parsed.body && typeof parsed.body === 'string' && !parsed.statusCode) {
          // Just a body field without statusCode (unlikely but handle it)
          console.log("📥 Strategy 2b: Found 'body' field without statusCode, parsing...")
          try {
            lambdaData = JSON.parse(parsed.body)
            console.log("📥 Strategy 2b: Successfully parsed body")
          } catch (e) {
            console.log("📥 Strategy 2b: Failed, will try other strategies")
          }
        }
        
        // If we haven't set lambdaData yet, check if parsed is already the data
        if (!lambdaData) {
          // Check if parsed already contains the actual data (score, summary, etc.)
          if (parsed.score !== undefined || parsed.summary) {
            // This is already the actual Lambda response data
            console.log("📥 Parsed data is already the Lambda response (has score/summary)")
            lambdaData = parsed
          } else if (!parsed.statusCode && !parsed.body) {
            // No Lambda structure, assume it's the data
            console.log("📥 Parsed data has no Lambda structure, using as-is")
            lambdaData = parsed
          } else {
            // Still has Lambda structure but we couldn't extract body
            console.error("📥 Warning: Parsed data still has Lambda structure but body extraction failed")
            console.error("📥 Parsed keys:", Object.keys(parsed))
            lambdaData = parsed // Use as fallback, but log warning
          }
        }
      } else {
        // Strategy 4: Extract first valid JSON object from the response text
        console.log("📥 Strategy 4: Attempting to extract JSON from response text...")
        // Find the first { and last } to extract valid JSON
        const firstBrace = responseText.indexOf('{')
        const lastBrace = responseText.lastIndexOf('}')
        if (firstBrace !== -1 && lastBrace > firstBrace) {
          try {
            const extracted = responseText.substring(firstBrace, lastBrace + 1)
            const extractedParsed = JSON.parse(extracted)
            console.log("📥 Strategy 4: Successfully extracted and parsed JSON")
            
            // If extracted object has Lambda proxy format, extract body
            if (extractedParsed.statusCode !== undefined && extractedParsed.body && typeof extractedParsed.body === 'string') {
              console.log("📥 Strategy 4: Found Lambda proxy in extracted JSON, extracting body...")
              try {
                lambdaData = JSON.parse(extractedParsed.body)
                console.log("📥 Strategy 4: Successfully parsed body from extracted Lambda proxy")
              } catch (e) {
                console.log("📥 Strategy 4: Body parse failed, using extracted object")
                lambdaData = extractedParsed
              }
            } else if (extractedParsed.score !== undefined || extractedParsed.summary) {
              // Already has the data
              lambdaData = extractedParsed
            } else {
              lambdaData = extractedParsed
            }
          } catch (e) {
            console.error("📥 Strategy 4: Failed to parse extracted JSON:", e)
            // Try regex as fallback
            const jsonMatch = responseText.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              try {
                const regexParsed = JSON.parse(jsonMatch[0])
                // Check if it's Lambda proxy format
                if (regexParsed.statusCode !== undefined && regexParsed.body && typeof regexParsed.body === 'string') {
                  lambdaData = JSON.parse(regexParsed.body)
                  console.log("📥 Strategy 4b: Successfully extracted using regex and parsed body")
                } else {
                  lambdaData = regexParsed
                  console.log("📥 Strategy 4b: Successfully extracted using regex fallback")
                }
              } catch (e2) {
                console.error("📥 Strategy 4b: Regex fallback also failed:", e2)
                throw parseError || new Error("All parsing strategies failed")
              }
            } else {
              throw parseError || new Error("All parsing strategies failed")
            }
          }
        } else {
          // Strategy 5: Try to find JSON starting from the first {
          const firstBrace = responseText.indexOf('{')
          if (firstBrace !== -1) {
            // Try to parse from first brace to end, or find where valid JSON ends
            let jsonEnd = firstBrace
            let braceCount = 0
            let inString = false
            let escapeNext = false
            
            for (let i = firstBrace; i < responseText.length; i++) {
              const char = responseText[i]
              
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
              try {
                const jsonStr = responseText.substring(firstBrace, jsonEnd)
                lambdaData = JSON.parse(jsonStr)
                console.log("📥 Strategy 5: Successfully parsed JSON using brace matching")
              } catch (e) {
                console.error("📥 Strategy 5: Failed to parse:", e)
                throw parseError || new Error("All parsing strategies failed")
              }
            } else {
              throw parseError || new Error("Could not find valid JSON in response")
            }
          } else {
            throw parseError || new Error("No JSON found in response")
          }
        }
      }
      
      console.log("📥 Final parsed response:", JSON.stringify(lambdaData, null, 2))
      console.log("📥 Final parsed response type:", typeof lambdaData)
      console.log("📥 Final parsed response keys:", lambdaData ? Object.keys(lambdaData) : "null/undefined")
      console.log("📥 Has score:", lambdaData && 'score' in lambdaData)
      console.log("📥 Has summary:", lambdaData && 'summary' in lambdaData)
      
      // Validate that we have the required fields
      if (!lambdaData || (typeof lambdaData === 'object' && Object.keys(lambdaData).length === 0)) {
        console.error("❌ CRITICAL: lambdaData is empty or null!")
        console.error("❌ Original response text (first 1000 chars):", responseText.substring(0, 1000))
        return NextResponse.json(
          {
            success: false,
            error: "Lambda returned an empty response. Please check Lambda logs.",
          },
          { status: 500 }
        )
      }
      
      // Validate required fields exist and are correct types
      const hasValidScore = typeof lambdaData.score === 'number' && !isNaN(lambdaData.score)
      const hasValidSummary = typeof lambdaData.summary === 'string' && lambdaData.summary.trim().length > 0
      
      if (!hasValidScore || !hasValidSummary) {
        console.error("❌ CRITICAL: lambdaData missing required fields or invalid types")
        console.error("❌ Validation details:", {
          hasValidScore,
          hasValidSummary,
          scoreValue: lambdaData.score,
          scoreType: typeof lambdaData.score,
          summaryValue: lambdaData.summary ? lambdaData.summary.substring(0, 100) : "missing",
          summaryType: typeof lambdaData.summary,
          summaryLength: lambdaData.summary?.length || 0,
          allKeys: Object.keys(lambdaData)
        })
        console.error("❌ lambdaData structure:", JSON.stringify(lambdaData, null, 2))
        console.error("❌ Original response text (first 1000 chars):", responseText.substring(0, 1000))
        
        return NextResponse.json(
          {
            success: false,
            error: "Lambda response missing required fields (score or summary). Please check Lambda logs.",
          },
          { status: 500 }
        )
      }
    } catch (parseError) {
      console.error("❌ Failed to parse Lambda response:", parseError)
      return NextResponse.json(
        {
          success: false,
          error: `Failed to parse Lambda response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
        },
        { status: 500 }
      )
    }

    // Return the Lambda response to frontend
    return NextResponse.json({
      success: true,
      data: lambdaData,
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
