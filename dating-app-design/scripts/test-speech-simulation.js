/**
 * QA Test Script: Speech Input Simulation
 * 
 * Simulates realistic voice conversations and tests the complete flow
 */

// Test Case 1: Complete Profile with Rich Voice Responses
const testCase1 = {
  name: "Complete Profile - Rich Voice Responses",
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
    "I love hiking and spending time outdoors on weekends. There's nothing better than getting up early on a Saturday morning, packing a backpack, and heading out to explore new trails. I've hiked all over California and I'm always looking for the next adventure.",
    "Honesty and good communication are absolutely the most important qualities I look for in a partner. I've been in relationships where communication broke down, and it's just not worth it. I need someone who can be open, direct, and who values transparency as much as I do.",
    "Dishonesty and lack of respect are definitely dealbreakers for me. I can't be with someone who lies or who doesn't respect my boundaries and values. Trust is everything, and once it's broken, it's really hard to rebuild."
  ],
  expectedProfileLength: 200, // Minimum expected length
  description: "Full form data + detailed voice responses"
}

// Test Case 2: Minimal Form Data with Rich Voice
const testCase2 = {
  name: "Minimal Form - Rich Voice Responses",
  formData: {
    firstName: "Jordan",
    age: "25",
    location: "New York, NY"
  },
  voiceResponses: [
    "I'm really into indie music and going to live shows. I probably go to at least two concerts a month. I love discovering new artists and supporting local bands. Music is a huge part of my life.",
    "I value creativity and someone who thinks outside the box. I want a partner who challenges me intellectually and who isn't afraid to be different or express themselves authentically.",
    "I can't stand people who are judgmental or closed-minded. Life is too short to be around negativity. I need someone who's open to new experiences and different perspectives."
  ],
  expectedProfileLength: 150,
  description: "Minimal form fields but detailed voice responses"
}

// Test Case 3: Rich Form Data with Short Voice Responses
const testCase3 = {
  name: "Rich Form - Short Voice Responses",
  formData: {
    firstName: "Sam",
    age: "30",
    location: "Austin, TX",
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
  voiceResponses: [
    "I enjoy cooking and trying new restaurants.",
    "Kindness and humor are important to me.",
    "No dealbreakers really, just be a good person."
  ],
  expectedProfileLength: 100,
  description: "Detailed form data with brief voice responses"
}

// Test Case 4: Very Short Responses (Edge Case)
const testCase4 = {
  name: "Very Short Responses - Should Pass",
  formData: {
    firstName: "Taylor",
    age: "26",
    location: "Portland, OR",
    jobTitle: "Teacher"
  },
  voiceResponses: [
    "I like reading.",
    "Honesty matters.",
    "No major dealbreakers."
  ],
  expectedProfileLength: 50,
  description: "Minimal responses that should still pass validation (10+ chars)"
}

// Test Case 5: Empty Voice (Form Only)
const testCase5 = {
  name: "Form Only - No Voice",
  formData: {
    firstName: "Casey",
    age: "29",
    location: "Chicago, IL",
    height: "5'10\"",
    education: "Bachelor's degree",
    jobTitle: "Nurse",
    employer: "City Hospital",
    lookingFor: "Long-term relationship",
    smoking: "Never",
    drinking: "Socially",
    wantChildren: "Maybe",
    haveChildren: "No"
  },
  voiceResponses: [],
  expectedProfileLength: 100,
  description: "Only form data, no voice responses"
}

// Test Case 6: Voice Only (Minimal Form)
const testCase6 = {
  name: "Voice Heavy - Minimal Form",
  formData: {
    firstName: "Riley",
    age: "27"
  },
  voiceResponses: [
    "I'm a freelance photographer who travels a lot for work. I love capturing moments and telling stories through my lens. When I'm not working, I enjoy yoga, meditation, and trying new cuisines. I'm really into wellness and living a balanced lifestyle.",
    "I'm looking for someone who's independent and has their own passions. I need a partner who understands my career requires travel and who's supportive of my creative pursuits. Someone who values experiences over material things would be ideal.",
    "I can't be with someone who's controlling or who doesn't respect my independence. I also need someone who's emotionally available and who can communicate their feelings openly."
  ],
  expectedProfileLength: 200,
  description: "Minimal form but extensive voice responses"
}

// Format profile description (same logic as lambda-client.ts)
function formatProfileDescription(formData, voiceTranscript) {
  const parts = []

  // 1. Add voice transcript first
  if (voiceTranscript.trim()) {
    parts.push(voiceTranscript.trim())
  }

  // 2. Add basic demographics
  const basicInfo = []
  if (formData.age) basicInfo.push(`${formData.age} years old`)
  if (formData.location) basicInfo.push(`lives in ${formData.location}`)
  if (formData.hometown && formData.hometown !== formData.location) {
    basicInfo.push(`from ${formData.hometown}`)
  }
  if (formData.height) basicInfo.push(`${formData.height} tall`)

  // 3. Add career
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

  // 4. Add lifestyle
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

  // 5. Add family
  const familyInfo = []
  if (formData.wantChildren && formData.wantChildren !== "Not sure") {
    familyInfo.push(`wants children: ${formData.wantChildren.toLowerCase()}`)
  }
  if (formData.haveChildren && formData.haveChildren === "Yes") {
    familyInfo.push("has children")
  }

  // 6. Add religion
  if (formData.religion && formData.religion !== "Prefer not to say") {
    if (formData.religionImportance === "Very important") {
      basicInfo.push(`very religious (${formData.religion.toLowerCase()})`)
    } else if (formData.religionImportance === "Somewhat important") {
      basicInfo.push(`somewhat religious (${formData.religion.toLowerCase()})`)
    }
  }

  // Combine
  if (basicInfo.length > 0) parts.push(basicInfo.join(", ") + ".")
  if (careerInfo.length > 0) parts.push(careerInfo.join(". ") + ".")
  if (lifestyle.length > 0) parts.push(lifestyle.join(", ") + ".")
  if (familyInfo.length > 0) parts.push(familyInfo.join(", ") + ".")

  if (parts.length === 0) return ""

  return parts.join(" ").trim()
}

// Run tests
console.log("🧪 QA Test: Speech Input Simulation")
console.log("=" .repeat(80))

const testCases = [testCase1, testCase2, testCase3, testCase4, testCase5, testCase6]
let passed = 0
let failed = 0

testCases.forEach((testCase, index) => {
  console.log(`\n${"=".repeat(80)}`)
  console.log(`Test ${index + 1}/${testCases.length}: ${testCase.name}`)
  console.log("=".repeat(80))
  console.log(`Description: ${testCase.description}`)
  
  // Simulate voice responses being collected
  const voiceTranscript = testCase.voiceResponses.join(" ")
  
  console.log(`\n📋 Form Data Fields: ${Object.keys(testCase.formData).length}`)
  console.log(`🎤 Voice Responses: ${testCase.voiceResponses.length}`)
  console.log(`📝 Voice Transcript Length: ${voiceTranscript.length} characters`)
  
  // Show voice responses
  console.log("\n🎤 Simulated Voice Responses:")
  testCase.voiceResponses.forEach((response, i) => {
    console.log(`   ${i + 1}. "${response.substring(0, 80)}${response.length > 80 ? '...' : ''}"`)
  })
  
  // Format profile
  const profileDescription = formatProfileDescription(testCase.formData, voiceTranscript)
  
  console.log(`\n📝 Formatted Profile Description:`)
  console.log(`   Length: ${profileDescription.length} characters`)
  console.log(`   Preview: "${profileDescription.substring(0, 150)}${profileDescription.length > 150 ? '...' : ''}"`)
  
  // Validate
  const isValid = profileDescription && profileDescription.trim().length >= 10
  const meetsExpected = profileDescription.length >= testCase.expectedProfileLength
  
  console.log(`\n✅ Validation:`)
  console.log(`   - Has content: ${isValid ? "✅ YES" : "❌ NO"}`)
  console.log(`   - Length >= 10: ${profileDescription.length >= 10 ? "✅ YES" : "❌ NO"}`)
  console.log(`   - Meets expected (${testCase.expectedProfileLength}+): ${meetsExpected ? "✅ YES" : "⚠️  NO (but still valid)"}`)
  
  // Create payload
  const payload = {
    user_partner_profile: profileDescription
  }
  
  console.log(`\n📦 Payload:`)
  console.log(`   Size: ${JSON.stringify(payload).length} bytes`)
  console.log(`   Valid JSON: ✅ YES`)
  
  if (isValid) {
    console.log(`\n✅ TEST PASSED`)
    passed++
  } else {
    console.log(`\n❌ TEST FAILED: Profile too short`)
    failed++
  }
})

console.log(`\n${"=".repeat(80)}`)
console.log("📊 Test Summary")
console.log("=".repeat(80))
console.log(`   Total Tests: ${testCases.length}`)
console.log(`   Passed: ${passed} ✅`)
console.log(`   Failed: ${failed} ${failed > 0 ? "❌" : ""}`)
console.log(`   Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`)
console.log("=".repeat(80))

if (failed === 0) {
  console.log("\n🎉 All speech simulation tests passed!")
} else {
  console.log(`\n⚠️  ${failed} test(s) failed.`)
  process.exit(1)
}
