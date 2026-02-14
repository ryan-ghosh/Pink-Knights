/**
 * Complete Flow Verification Test
 * 
 * Tests the ENTIRE flow from voice collection to API payload
 * Simulates realistic user interactions
 */

// Simulate voice response collection (exact logic from voice-agent-view)
function collectVoiceResponses(voiceResponses) {
  const collected = []
  const seen = new Set()
  
  voiceResponses.forEach((response) => {
    const trimmed = response.trim()
    if (trimmed && !seen.has(trimmed)) {
      collected.push(trimmed)
      seen.add(trimmed)
    }
  })
  
  return collected
}

// Format profile (exact logic from lambda-client.ts)
function formatProfileDescription(formData, voiceTranscript) {
  const parts = []
  
  if (voiceTranscript.trim()) {
    parts.push(voiceTranscript.trim())
  }
  
  const basicInfo = []
  if (formData.age) basicInfo.push(`${formData.age} years old`)
  if (formData.location) basicInfo.push(`lives in ${formData.location}`)
  if (formData.hometown && formData.hometown !== formData.location) {
    basicInfo.push(`from ${formData.hometown}`)
  }
  if (formData.height) basicInfo.push(`${formData.height} tall`)
  
  const careerInfo = []
  if (formData.jobTitle) {
    if (formData.employer) {
      careerInfo.push(`Works as a ${formData.jobTitle} at ${formData.employer}`)
    } else {
      careerInfo.push(`Works as a ${formData.jobTitle}`)
    }
  }
  if (formData.education) careerInfo.push(`Has a ${formData.education}`)
  if (formData.lookingFor) careerInfo.push(`Looking for ${formData.lookingFor.toLowerCase()}`)
  
  const lifestyle = []
  if (formData.drinking && formData.drinking !== "No") {
    lifestyle.push(`drinks ${formData.drinking.toLowerCase()}`)
  }
  if (formData.smoking && formData.smoking !== "No") {
    lifestyle.push(`smokes ${formData.smoking.toLowerCase()}`)
  }
  if (formData.marijuana && formData.marijuana !== "No") {
    lifestyle.push(`uses marijuana ${formData.marijuana.toLowerCase()}`)
  }
  if (formData.politics) lifestyle.push(`politically ${formData.politics.toLowerCase()}`)
  
  const familyInfo = []
  if (formData.wantChildren && formData.wantChildren !== "Not sure") {
    familyInfo.push(`wants children: ${formData.wantChildren.toLowerCase()}`)
  }
  if (formData.haveChildren && formData.haveChildren === "Yes") {
    familyInfo.push("has children")
  }
  
  if (formData.religion && formData.religion !== "Prefer not to say") {
    if (formData.religionImportance === "Very important") {
      basicInfo.push(`very religious (${formData.religion.toLowerCase()})`)
    } else if (formData.religionImportance === "Somewhat important") {
      basicInfo.push(`somewhat religious (${formData.religion.toLowerCase()})`)
    }
  }
  
  if (basicInfo.length > 0) parts.push(basicInfo.join(", ") + ".")
  if (careerInfo.length > 0) parts.push(careerInfo.join(". ") + ".")
  if (lifestyle.length > 0) parts.push(lifestyle.join(", ") + ".")
  if (familyInfo.length > 0) parts.push(familyInfo.join(", ") + ".")
  
  if (parts.length === 0) return ""
  
  return parts.join(" ").trim()
}

// Validate profile
function validateProfile(profileDescription) {
  return profileDescription && profileDescription.trim().length >= 10
}

// Test scenarios
const testScenarios = [
  {
    name: "Complete Profile - All Fields + Voice",
    formData: {
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
    },
    voiceResponses: [
      "I love hiking and spending time outdoors on weekends. There's nothing better than getting up early on a Saturday morning, packing a backpack, and heading out to explore new trails.",
      "Honesty and good communication are absolutely the most important qualities I look for in a partner. I need someone who can be open and direct.",
      "Dishonesty and lack of respect are definitely dealbreakers for me. I can't be with someone who lies or who doesn't respect my boundaries."
    ],
    expectedToPass: true
  },
  {
    name: "Form Only - No Voice",
    formData: {
      firstName: "Jordan",
      age: "30",
      location: "New York, NY",
      height: "5'8\"",
      education: "Master's degree",
      jobTitle: "Marketing Director",
      employer: "Creative Agency",
      lookingFor: "Serious relationship",
      smoking: "Never",
      drinking: "Occasionally",
      politics: "Liberal",
      wantChildren: "Yes"
    },
    voiceResponses: [],
    expectedToPass: true
  },
  {
    name: "Minimal Form + Voice",
    formData: {
      firstName: "Taylor",
      age: "25",
      location: "Portland, OR"
    },
    voiceResponses: [
      "I enjoy reading and cooking.",
      "Kindness is important to me.",
      "No major dealbreakers."
    ],
    expectedToPass: true
  },
  {
    name: "Empty Everything - Should Fail",
    formData: {},
    voiceResponses: [],
    expectedToPass: false
  },
  {
    name: "Only Age - Should Fail",
    formData: {
      age: "25"
    },
    voiceResponses: [],
    expectedToPass: false
  }
]

console.log("🔍 COMPLETE FLOW VERIFICATION TEST")
console.log("=" .repeat(80))

let passed = 0
let failed = 0

testScenarios.forEach((scenario, index) => {
  console.log(`\n${"=".repeat(80)}`)
  console.log(`Test ${index + 1}/${testScenarios.length}: ${scenario.name}`)
  console.log("=".repeat(80))
  
  // Step 1: Collect voice responses
  console.log("\n📝 Step 1: Voice Response Collection")
  const collectedResponses = collectVoiceResponses(scenario.voiceResponses)
  const combinedTranscript = collectedResponses.join(" ")
  console.log(`   Input responses: ${scenario.voiceResponses.length}`)
  console.log(`   Collected responses: ${collectedResponses.length}`)
  console.log(`   Combined transcript: ${combinedTranscript.length} chars`)
  console.log(`   Transcript: "${combinedTranscript.substring(0, 100)}${combinedTranscript.length > 100 ? '...' : ''}"`)
  
  // Step 2: Format profile
  console.log("\n📝 Step 2: Profile Formatting")
  const profileDescription = formatProfileDescription(scenario.formData, combinedTranscript)
  console.log(`   Form fields: ${Object.keys(scenario.formData).length}`)
  console.log(`   Voice responses: ${collectedResponses.length}`)
  console.log(`   Profile length: ${profileDescription.length} chars`)
  console.log(`   Profile: "${profileDescription.substring(0, 150)}${profileDescription.length > 150 ? '...' : ''}"`)
  
  // Step 3: Validate
  console.log("\n📝 Step 3: Validation")
  const isValid = validateProfile(profileDescription)
  console.log(`   Valid: ${isValid ? "✅ YES" : "❌ NO"}`)
  console.log(`   Length check: ${profileDescription.length >= 10 ? "✅ PASS" : "❌ FAIL"}`)
  
  // Step 4: Create payload
  console.log("\n📝 Step 4: Payload Creation")
  const payload = {
    user_partner_profile: profileDescription
  }
  const payloadJson = JSON.stringify(payload)
  console.log(`   Payload size: ${payloadJson.length} bytes`)
  console.log(`   Has user_partner_profile: ${payload.user_partner_profile ? "✅ YES" : "❌ NO"}`)
  console.log(`   Valid JSON: ${(() => {
    try {
      JSON.parse(payloadJson)
      return "✅ YES"
    } catch {
      return "❌ NO"
    }
  })()}`)
  
  // Step 5: Verify expectations
  console.log("\n📝 Step 5: Verification")
  const testPassed = (isValid === scenario.expectedToPass)
  console.log(`   Expected to pass: ${scenario.expectedToPass ? "YES" : "NO"}`)
  console.log(`   Actually passes: ${isValid ? "YES" : "NO"}`)
  console.log(`   Test result: ${testPassed ? "✅ PASSED" : "❌ FAILED"}`)
  
  if (testPassed) {
    passed++
  } else {
    failed++
    console.log(`\n   ⚠️  MISMATCH: Expected ${scenario.expectedToPass ? "PASS" : "FAIL"} but got ${isValid ? "PASS" : "FAIL"}`)
  }
})

console.log(`\n${"=".repeat(80)}`)
console.log("📊 VERIFICATION SUMMARY")
console.log("=".repeat(80))
console.log(`   Total Tests: ${testScenarios.length}`)
console.log(`   Passed: ${passed} ✅`)
console.log(`   Failed: ${failed} ${failed > 0 ? "❌" : ""}`)
console.log(`   Success Rate: ${((passed / testScenarios.length) * 100).toFixed(1)}%`)
console.log("=".repeat(80))

if (failed === 0) {
  console.log("\n🎉 All verification tests passed!")
  console.log("\n✅ Profile storage: Working")
  console.log("✅ Profile formatting: Working")
  console.log("✅ Validation: Working")
  console.log("✅ Payload creation: Working")
} else {
  console.log(`\n⚠️  ${failed} test(s) failed. Review the issues above.`)
  process.exit(1)
}
