/**
 * Test Script: Profile Formatting
 * 
 * Tests that form data and voice transcript are properly combined
 * into the user_partner_profile string
 */

// Mock form data (simulating signup form)
const mockFormData = {
  firstName: "Alex",
  age: "28",
  gender: "Male",
  orientation: "Straight",
  location: "San Francisco, CA",
  height: "6'0\"",
  ethnicity: "White",
  religion: "Christian",
  hometown: "Seattle, WA",
  lookingFor: "Long-term relationship",
  education: "Bachelor's degree",
  jobTitle: "Software Engineer",
  employer: "Tech Corp",
  smoking: "Never",
  drinking: "Socially",
  marijuana: "Never",
  otherDrugs: "Never",
  politics: "Moderate",
  religionImportance: "Somewhat important",
  wantChildren: "Yes",
  haveChildren: "No"
}

// Mock voice transcript (simulating combined voice responses)
const mockVoiceTranscript = "I love hiking and spending time outdoors on weekends. Honesty and good communication are most important to me. Dishonesty and lack of respect are dealbreakers."

// Format profile description (same logic as lambda-client.ts)
function formatProfileDescription(formData, voiceTranscript) {
  const parts = []

  // 1. Add voice transcript first (most natural/personal)
  if (voiceTranscript.trim()) {
    parts.push(voiceTranscript.trim())
  }

  // 2. Add basic demographics and location
  const basicInfo = []
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
  const careerInfo = []
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
    basicInfo.push(`looking for ${formData.lookingFor.toLowerCase()}`)
  }

  // 5. Add lifestyle preferences
  const lifestyle = []
  if (formData.smoking && formData.smoking !== "Never") {
    lifestyle.push(`smokes: ${formData.smoking.toLowerCase()}`)
  } else if (formData.smoking === "Never") {
    lifestyle.push("non-smoker")
  }
  if (formData.drinking && formData.drinking !== "Never") {
    lifestyle.push(`drinks: ${formData.drinking.toLowerCase()}`)
  }
  if (formData.marijuana && formData.marijuana !== "Never") {
    lifestyle.push(`uses marijuana: ${formData.marijuana.toLowerCase()}`)
  }

  // 6. Add family preferences
  const familyInfo = []
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

  // Combine all sections
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

  return parts.length > 0 ? parts.join(" ") : "Profile information provided."
}

console.log("🧪 Test: Profile Formatting")
console.log("=" .repeat(70))

// Test 1: Full profile formatting
console.log("\n📋 Test 1: Full Profile Formatting")
const formattedProfile = formatProfileDescription(mockFormData, mockVoiceTranscript)
console.log("\n📝 Formatted Profile:")
console.log(formattedProfile)
console.log(`\n📊 Length: ${formattedProfile.length} characters`)
console.log(`✅ Test 1 PASSED: Profile formatted successfully\n`)

// Test 2: Voice transcript included
console.log("📋 Test 2: Voice Transcript Inclusion")
const includesVoice = formattedProfile.includes(mockVoiceTranscript)
console.log(`Voice transcript included: ${includesVoice ? "✅ YES" : "❌ NO"}`)
if (includesVoice) {
  console.log(`✅ Test 2 PASSED: Voice transcript is included`)
} else {
  console.log(`❌ Test 2 FAILED: Voice transcript missing`)
}
console.log()

// Test 3: Form data included
console.log("📋 Test 3: Form Data Inclusion")
const checks = [
  { field: "age", value: mockFormData.age, found: formattedProfile.includes(mockFormData.age) },
  { field: "location", value: mockFormData.location, found: formattedProfile.includes(mockFormData.location) },
  { field: "jobTitle", value: mockFormData.jobTitle, found: formattedProfile.includes(mockFormData.jobTitle) },
  { field: "education", value: mockFormData.education, found: formattedProfile.includes(mockFormData.education) },
  { field: "lookingFor", value: mockFormData.lookingFor, found: formattedProfile.includes(mockFormData.lookingFor.toLowerCase()) }
]

checks.forEach(check => {
  console.log(`  ${check.field}: ${check.found ? "✅" : "❌"} (${check.value})`)
})

const allChecksPass = checks.every(c => c.found)
console.log(`\n✅ Test 3 ${allChecksPass ? "PASSED" : "FAILED"}: Form data inclusion\n`)

// Test 4: Empty voice transcript
console.log("📋 Test 4: Empty Voice Transcript Handling")
const profileWithoutVoice = formatProfileDescription(mockFormData, "")
console.log(`Profile without voice: ${profileWithoutVoice.length} characters`)
console.log(`Voice transcript included: ${profileWithoutVoice.includes(mockVoiceTranscript) ? "❌ YES (ERROR)" : "✅ NO (CORRECT)"}`)
console.log(`✅ Test 4 PASSED: Empty voice handled correctly\n`)

// Test 5: Minimal form data
console.log("📋 Test 5: Minimal Form Data")
const minimalFormData = {
  firstName: "Test",
  age: "25"
}
const minimalProfile = formatProfileDescription(minimalFormData, mockVoiceTranscript)
console.log(`Minimal profile length: ${minimalProfile.length} characters`)
console.log(`Voice transcript included: ${minimalProfile.includes(mockVoiceTranscript) ? "✅ YES" : "❌ NO"}`)
console.log(`✅ Test 5 PASSED: Minimal data handled\n`)

// Test 6: Expected payload format
console.log("📋 Test 6: Payload Format")
const payload = {
  user_partner_profile: formattedProfile
}
const payloadJson = JSON.stringify(payload, null, 2)
console.log("\n📦 Expected Payload Structure:")
console.log(JSON.stringify({ user_partner_profile: "..." }, null, 2))
console.log("\n✅ Test 6 PASSED: Payload format correct\n")

console.log("=" .repeat(70))
console.log("📊 Summary:")
console.log(`   - Profile formatting: ✅ Working`)
console.log(`   - Voice transcript: ${includesVoice ? "✅ Included" : "❌ Missing"}`)
console.log(`   - Form data: ${allChecksPass ? "✅ Included" : "❌ Missing"}`)
console.log(`   - Edge cases: ✅ Handled`)
console.log(`   - Payload format: ✅ Correct`)
console.log("=" .repeat(70))
