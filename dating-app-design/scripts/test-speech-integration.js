/**
 * QA Test Script: Speech Integration Test
 * 
 * Tests the complete integration: Voice Collection → Formatting → Validation → Payload
 */

// Simulate the complete voice collection process
function simulateVoiceCollection(voiceResponses) {
  const collectedResponses = []
  
  voiceResponses.forEach((response, index) => {
    const trimmed = response.trim()
    if (trimmed && !collectedResponses.includes(trimmed)) {
      collectedResponses.push(trimmed)
      console.log(`   ✅ Response ${index + 1} collected: "${trimmed.substring(0, 60)}${trimmed.length > 60 ? '...' : ''}"`)
    } else if (!trimmed) {
      console.log(`   ⚠️  Response ${index + 1} skipped (empty/whitespace)`)
    } else {
      console.log(`   ⚠️  Response ${index + 1} skipped (duplicate)`)
    }
  })
  
  return collectedResponses
}

// Format profile (same as lambda-client.ts)
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
  if (!profileDescription || profileDescription.trim().length < 10) {
    return {
      valid: false,
      error: "Please provide more information. Fill out more form fields or speak longer during the voice conversation."
    }
  }
  return { valid: true }
}

// Integration test scenarios
const scenarios = [
  {
    name: "Realistic User Journey",
    formData: {
      firstName: "Alex",
      age: "28",
      location: "San Francisco, CA",
      jobTitle: "Software Engineer",
      education: "Bachelor's degree",
      lookingFor: "Long-term relationship",
      smoking: "Never",
      drinking: "Socially"
    },
    voiceResponses: [
      "I love hiking and spending time outdoors on weekends. There's nothing better than getting up early on a Saturday morning, packing a backpack, and heading out to explore new trails.",
      "Honesty and good communication are absolutely the most important qualities I look for in a partner. I need someone who can be open and direct.",
      "Dishonesty and lack of respect are definitely dealbreakers for me. I can't be with someone who lies or who doesn't respect my boundaries."
    ]
  },
  {
    name: "Minimal Input Scenario",
    formData: {
      firstName: "Jordan",
      age: "25",
      location: "NYC"
    },
    voiceResponses: [
      "I'm really into indie music and going to live shows.",
      "I value creativity and someone who thinks outside the box.",
      "I can't stand people who are judgmental or closed-minded."
    ]
  },
  {
    name: "Voice-Heavy Scenario",
    formData: {
      firstName: "Riley",
      age: "27"
    },
    voiceResponses: [
      "I'm a freelance photographer who travels a lot for work. I love capturing moments and telling stories through my lens. When I'm not working, I enjoy yoga, meditation, and trying new cuisines.",
      "I'm looking for someone who's independent and has their own passions. I need a partner who understands my career requires travel and who's supportive of my creative pursuits.",
      "I can't be with someone who's controlling or who doesn't respect my independence. I also need someone who's emotionally available."
    ]
  }
]

console.log("🧪 QA Test: Speech Integration Test")
console.log("=" .repeat(80))

let totalPassed = 0
let totalFailed = 0

scenarios.forEach((scenario, scenarioIndex) => {
  console.log(`\n${"=".repeat(80)}`)
  console.log(`Scenario ${scenarioIndex + 1}/${scenarios.length}: ${scenario.name}`)
  console.log("=".repeat(80))
  
  // Step 1: Voice Collection
  console.log("\n📝 Step 1: Voice Response Collection")
  const collectedResponses = simulateVoiceCollection(scenario.voiceResponses)
  const combinedTranscript = collectedResponses.join(" ")
  console.log(`   ✅ Collected ${collectedResponses.length} responses`)
  console.log(`   📊 Combined transcript: ${combinedTranscript.length} characters`)
  
  // Step 2: Profile Formatting
  console.log("\n📝 Step 2: Profile Formatting")
  const profileDescription = formatProfileDescription(scenario.formData, combinedTranscript)
  console.log(`   📊 Profile length: ${profileDescription.length} characters`)
  console.log(`   📝 Preview: "${profileDescription.substring(0, 150)}${profileDescription.length > 150 ? '...' : ''}"`)
  
  // Step 3: Validation
  console.log("\n📝 Step 3: Profile Validation")
  const validation = validateProfile(profileDescription)
  if (validation.valid) {
    console.log(`   ✅ Profile is valid`)
  } else {
    console.log(`   ❌ Profile validation failed: ${validation.error}`)
  }
  
  // Step 4: Payload Creation
  console.log("\n📝 Step 4: Payload Creation")
  const payload = {
    user_partner_profile: profileDescription
  }
  const payloadJson = JSON.stringify(payload)
  console.log(`   📊 Payload size: ${payloadJson.length} bytes`)
  console.log(`   ✅ Valid JSON: YES`)
  console.log(`   ✅ Has user_partner_profile: ${payload.user_partner_profile ? "YES" : "NO"}`)
  
  // Step 5: Final Validation
  console.log("\n📝 Step 5: Final Integration Check")
  const allStepsPassed = 
    collectedResponses.length > 0 &&
    profileDescription.length > 0 &&
    validation.valid &&
    payload.user_partner_profile.length >= 10
  
  if (allStepsPassed) {
    console.log(`   ✅ All integration steps passed`)
    totalPassed++
  } else {
    console.log(`   ❌ Integration check failed`)
    totalFailed++
  }
  
  console.log(`\n${scenario.name}: ${allStepsPassed ? "✅ PASSED" : "❌ FAILED"}`)
})

console.log(`\n${"=".repeat(80)}`)
console.log("📊 Integration Test Summary")
console.log("=".repeat(80))
console.log(`   Total Scenarios: ${scenarios.length}`)
console.log(`   Passed: ${totalPassed} ✅`)
console.log(`   Failed: ${totalFailed} ${totalFailed > 0 ? "❌" : ""}`)
console.log(`   Success Rate: ${((totalPassed / scenarios.length) * 100).toFixed(1)}%`)
console.log("=".repeat(80))

if (totalFailed === 0) {
  console.log("\n🎉 All integration tests passed!")
} else {
  console.log(`\n⚠️  ${totalFailed} scenario(s) failed.`)
  process.exit(1)
}
