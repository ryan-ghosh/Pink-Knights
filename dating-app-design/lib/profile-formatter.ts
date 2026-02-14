/**
 * Profile Formatter - Shared utility for formatting user profiles
 * 
 * This function is used by both the frontend (lambda-client.ts) and
 * the API route (app/api/submit-form/route.ts) to ensure consistency.
 */

/**
 * Convert form data and voice transcript into a natural language profile description
 * 
 * Combines all form fields and voice conversation responses into a single
 * natural language description that matches the API format.
 * 
 * @param formData - The form data object (all fields from signup form)
 * @param voiceTranscript - The transcribed voice text (all responses from voice agent)
 * @returns A formatted profile description string
 */
export function formatProfileDescription(
  formData: Record<string, any>,
  voiceTranscript: string
): string {
  const parts: string[] = []

  // 1. Add voice transcript first (most natural/personal - from conversation)
  // This captures the user's spoken responses to questions
  if (voiceTranscript.trim()) {
    parts.push(voiceTranscript.trim())
  }

  // 2. Add basic demographics and location
  const basicInfo: string[] = []
  if (formData.age) {
    basicInfo.push(`${formData.age} years old`)
  }
  if (formData.location) {
    basicInfo.push(`lives in ${formData.location}`)
  }
  if (formData.hometown && formData.hometown !== formData.location) {
    basicInfo.push(`from ${formData.hometown}`)
  }
  if (formData.height) {
    basicInfo.push(`${formData.height} tall`)
  }

  // 3. Add career and education
  const careerInfo: string[] = []
  if (formData.jobTitle) {
    if (formData.employer) {
      careerInfo.push(`Works as a ${formData.jobTitle} at ${formData.employer}`)
    } else {
      careerInfo.push(`Works as a ${formData.jobTitle}`)
    }
  }
  if (formData.education) {
    careerInfo.push(`Has a ${formData.education}`)
  }

  // 4. Add dating intent
  if (formData.lookingFor) {
    careerInfo.push(`Looking for ${formData.lookingFor.toLowerCase()}`)
  }

  // 5. Add lifestyle preferences (only if not "No")
  const lifestyle: string[] = []
  if (formData.drinking && formData.drinking !== "No") {
    lifestyle.push(`drinks ${formData.drinking.toLowerCase()}`)
  }
  if (formData.smoking && formData.smoking !== "No") {
    lifestyle.push(`smokes ${formData.smoking.toLowerCase()}`)
  }
  if (formData.marijuana && formData.marijuana !== "No") {
    lifestyle.push(`uses marijuana ${formData.marijuana.toLowerCase()}`)
  }
  if (formData.politics) {
    lifestyle.push(`politically ${formData.politics.toLowerCase()}`)
  }

  // 6. Add family preferences
  const familyInfo: string[] = []
  if (formData.wantChildren && formData.wantChildren !== "Not sure") {
    familyInfo.push(`wants children: ${formData.wantChildren.toLowerCase()}`)
  }
  if (formData.haveChildren && formData.haveChildren === "Yes") {
    familyInfo.push("has children")
  }

  // 7. Add religion (if important)
  if (formData.religion && formData.religion !== "Prefer not to say") {
    if (formData.religionImportance === "Very important") {
      basicInfo.push(`very religious (${formData.religion.toLowerCase()})`)
    } else if (formData.religionImportance === "Somewhat important") {
      basicInfo.push(`somewhat religious (${formData.religion.toLowerCase()})`)
    }
  }

  // Combine all sections into natural sentences
  if (basicInfo.length > 0) {
    parts.push(basicInfo.join(", ") + ".")
  }

  if (careerInfo.length > 0) {
    parts.push(careerInfo.join(". ") + ".")
  }

  if (lifestyle.length > 0) {
    parts.push(lifestyle.join(", ") + ".")
  }

  if (familyInfo.length > 0) {
    parts.push(familyInfo.join(", ") + ".")
  }

  // If we have nothing meaningful, return empty string (will be caught by validation)
  if (parts.length === 0) {
    return ""
  }

  // Join all parts with spaces to create a flowing description
  // Voice transcript comes first, then structured info
  return parts.join(" ").trim()
}
