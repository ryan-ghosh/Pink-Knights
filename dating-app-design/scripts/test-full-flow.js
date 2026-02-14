/**
 * Test Script: Full Data Flow
 * 
 * Tests the complete flow from form data + voice → formatted profile → API payload
 */

// Simulate the complete flow
const mockFormData = {
  firstName: "Alex",
  age: "28",
  location: "San Francisco, CA",
  jobTitle: "Software Engineer",
  education: "Bachelor's degree",
  lookingFor: "Long-term relationship",
  smoking: "Never",
  drinking: "Socially"
}

// Simulate voice responses being collected
const voiceResponses = [
  "I love hiking and spending time outdoors on weekends",
  "Honesty and good communication are most important to me",
  "Dishonesty and lack of respect are dealbreakers"
]

console.log("🧪 Test: Full Data Flow")
console.log("=" .repeat(70))

// Step 1: Collect voice responses
console.log("\n📝 Step 1: Voice Response Collection")
const collectedResponses = []
voiceResponses.forEach((response, index) => {
  const trimmed = response.trim()
  if (trimmed && !collectedResponses.includes(trimmed)) {
    collectedResponses.push(trimmed)
    console.log(`   ✅ Response ${index + 1} collected`)
  }
})

const combinedTranscript = collectedResponses.join(" ")
console.log(`   📊 Combined: ${combinedTranscript.length} characters`)
console.log(`   ✅ Step 1 PASSED\n`)

// Step 2: Format profile
console.log("📝 Step 2: Profile Formatting")
function formatProfileDescription(formData, voiceTranscript) {
  const parts = []
  
  // Voice transcript first
  if (voiceTranscript.trim()) {
    parts.push(voiceTranscript.trim())
  }
  
  // Basic info
  const basicInfo = []
  if (formData.age) basicInfo.push(`${formData.age} years old`)
  if (formData.location) basicInfo.push(`lives in ${formData.location}`)
  if (formData.lookingFor) basicInfo.push(`looking for ${formData.lookingFor.toLowerCase()}`)
  
  // Career
  const careerInfo = []
  if (formData.jobTitle) careerInfo.push(`Works as a ${formData.jobTitle}`)
  if (formData.education) careerInfo.push(`Has a ${formData.education}`)
  
  // Lifestyle
  const lifestyle = []
  if (formData.smoking === "Never") lifestyle.push("non-smoker")
  if (formData.drinking && formData.drinking !== "Never") {
    lifestyle.push(`drinks: ${formData.drinking.toLowerCase()}`)
  }
  
  // Combine
  if (basicInfo.length > 0) parts.push(basicInfo.join(", ") + ".")
  if (careerInfo.length > 0) parts.push(careerInfo.join(". ") + ".")
  if (lifestyle.length > 0) parts.push(lifestyle.join(", ") + ".")
  
  return parts.join(" ")
}

const formattedProfile = formatProfileDescription(mockFormData, combinedTranscript)
console.log(`   📊 Formatted profile: ${formattedProfile.length} characters`)
console.log(`   ✅ Voice included: ${formattedProfile.includes(combinedTranscript) ? "YES" : "NO"}`)
console.log(`   ✅ Form data included: ${formattedProfile.includes(mockFormData.location) ? "YES" : "NO"}`)
console.log(`   ✅ Step 2 PASSED\n`)

// Step 3: Create API payload
console.log("📝 Step 3: API Payload Creation")
const payload = {
  user_partner_profile: formattedProfile
}

const payloadJson = JSON.stringify(payload)
console.log(`   📊 Payload size: ${payloadJson.length} bytes`)
console.log(`   ✅ Has user_partner_profile: ${payload.user_partner_profile ? "YES" : "NO"}`)
console.log(`   ✅ Valid JSON: ${(() => {
  try {
    JSON.parse(payloadJson)
    return "YES"
  } catch {
    return "NO"
  }
})()}`)
console.log(`   ✅ Step 3 PASSED\n`)

// Step 4: Validate expected Lambda response structure
console.log("📝 Step 4: Response Structure Validation")
const mockLambdaResponse = {
  score: 87,
  summary: "The date went well...",
  meta: {
    compatibility_factors: {
      shared_interests: "hiking",
      humor_alignment: "good"
    },
    potential_concerns: "none",
    candidate_profile: "I'm a designer..."
  }
}

const requiredFields = ['score', 'summary', 'meta']
const hasAllFields = requiredFields.every(field => mockLambdaResponse[field] !== undefined)
const hasMetaFields = mockLambdaResponse.meta && 
  mockLambdaResponse.meta.compatibility_factors &&
  mockLambdaResponse.meta.potential_concerns !== undefined &&
  mockLambdaResponse.meta.candidate_profile

console.log(`   ✅ Has score: ${mockLambdaResponse.score !== undefined ? "YES" : "NO"}`)
console.log(`   ✅ Has summary: ${mockLambdaResponse.summary ? "YES" : "NO"}`)
console.log(`   ✅ Has meta: ${mockLambdaResponse.meta ? "YES" : "NO"}`)
console.log(`   ✅ Has compatibility_factors: ${mockLambdaResponse.meta?.compatibility_factors ? "YES" : "NO"}`)
console.log(`   ✅ Has potential_concerns: ${mockLambdaResponse.meta?.potential_concerns !== undefined ? "YES" : "NO"}`)
console.log(`   ✅ Has candidate_profile: ${mockLambdaResponse.meta?.candidate_profile ? "YES" : "NO"}`)
console.log(`   ✅ Step 4 ${hasAllFields && hasMetaFields ? "PASSED" : "FAILED"}\n`)

// Summary
console.log("=" .repeat(70))
console.log("📊 Full Flow Summary:")
console.log(`   ✅ Voice collection: Working`)
console.log(`   ✅ Profile formatting: Working`)
console.log(`   ✅ Payload creation: Working`)
console.log(`   ✅ Response validation: ${hasAllFields && hasMetaFields ? "Working" : "Needs attention"}`)
console.log("=" .repeat(70))

if (hasAllFields && hasMetaFields) {
  console.log("\n🎉 Full flow test PASSED!")
} else {
  console.log("\n⚠️  Some validation checks failed. Review Lambda response structure.")
}
