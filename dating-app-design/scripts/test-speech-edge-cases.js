/**
 * QA Test Script: Speech Input Edge Cases
 * 
 * Tests edge cases and boundary conditions for speech input
 */

// Edge Case 1: Single Word Responses
const edgeCase1 = {
  name: "Single Word Responses",
  formData: { firstName: "Test", age: "25", location: "NYC" },
  voiceResponses: ["Hiking", "Honesty", "Lies"],
  shouldPass: true, // Combined with form data, should pass
  description: "Each response is a single word, but combined with form data should pass"
}

// Edge Case 2: Very Long Responses
const edgeCase2 = {
  name: "Very Long Responses",
  formData: { firstName: "Test", age: "25" },
  voiceResponses: [
    "I love hiking and spending time outdoors on weekends. There's nothing better than getting up early on a Saturday morning, packing a backpack with snacks and water, and heading out to explore new trails. I've hiked all over California - from the redwoods in the north to the deserts in the south. I'm always looking for the next adventure and I love discovering hidden gems off the beaten path. The feeling of reaching a summit after a challenging climb is unbeatable, and I love sharing those experiences with others.",
    "Honesty and good communication are absolutely the most important qualities I look for in a partner. I've been in relationships where communication broke down, and it's just not worth it. I need someone who can be open, direct, and who values transparency as much as I do. I believe that being able to talk through problems and express feelings openly is the foundation of any strong relationship. Without that, everything else falls apart.",
    "Dishonesty and lack of respect are definitely dealbreakers for me. I can't be with someone who lies or who doesn't respect my boundaries and values. Trust is everything, and once it's broken, it's really hard to rebuild. I also can't stand people who are judgmental or who try to change me. I want someone who accepts me for who I am while still encouraging me to grow."
  ],
  shouldPass: true,
  description: "Extremely detailed, long responses"
}

// Edge Case 3: Empty Voice Array
const edgeCase3 = {
  name: "Empty Voice Array",
  formData: {
    firstName: "Test",
    age: "30",
    location: "LA",
    jobTitle: "Engineer",
    education: "Bachelor's",
    lookingFor: "Relationship"
  },
  voiceResponses: [],
  shouldPass: true, // Form data should be enough
  description: "No voice responses, only form data"
}

// Edge Case 4: Special Characters in Voice
const edgeCase4 = {
  name: "Special Characters in Voice",
  formData: { firstName: "Test", age: "25" },
  voiceResponses: [
    "I love music - especially jazz & blues!",
    "I value honesty... it's everything!",
    "No dealbreakers, just be yourself!"
  ],
  shouldPass: true,
  description: "Voice responses contain special characters"
}

// Edge Case 5: Numbers in Voice
const edgeCase5 = {
  name: "Numbers in Voice Responses",
  formData: { firstName: "Test", age: "25" },
  voiceResponses: [
    "I've been to 15 countries and counting",
    "I've been playing guitar for 10 years",
    "I run 5 miles every morning"
  ],
  shouldPass: true,
  description: "Voice responses contain numbers"
}

// Edge Case 6: Mixed Case Responses
const edgeCase6 = {
  name: "Mixed Case Responses",
  formData: { firstName: "Test", age: "25" },
  voiceResponses: [
    "I LOVE hiking and the outdoors",
    "honesty is very important to me",
    "NO major dealbreakers"
  ],
  shouldPass: true,
  description: "Voice responses with inconsistent capitalization"
}

// Edge Case 7: Whitespace Only
const edgeCase7 = {
  name: "Whitespace Only Responses",
  formData: { firstName: "Test", age: "25", location: "NYC" },
  voiceResponses: ["   ", "\n\n", "\t\t"],
  shouldPass: true, // Form data alone should be enough
  description: "Voice responses are only whitespace, but form data should make it pass"
}

// Edge Case 8: Exactly 10 Characters
const edgeCase8 = {
  name: "Exactly 10 Characters",
  formData: { firstName: "Test", age: "25" },
  voiceResponses: ["1234567890"], // Exactly 10 chars
  shouldPass: true, // Should pass validation
  description: "Response is exactly at the minimum threshold"
}

// Edge Case 9: Just Under 10 Characters
const edgeCase9 = {
  name: "Just Under 10 Characters",
  formData: { firstName: "Test", age: "25", location: "NYC" },
  voiceResponses: ["123456789"], // 9 chars
  shouldPass: true, // Combined with form data, should pass
  description: "Response is just below 10 chars, but combined with form data should pass"
}

// Edge Case 10: Multiple Short Responses That Combine
const edgeCase10 = {
  name: "Multiple Short Responses",
  formData: { firstName: "Test", age: "25" },
  voiceResponses: [
    "I like hiking",
    "Honesty matters",
    "No dealbreakers"
  ],
  shouldPass: true, // Combined should be > 10 chars
  description: "Multiple short responses that together exceed minimum"
}

function formatProfileDescription(formData, voiceTranscript) {
  const parts = []
  
  if (voiceTranscript.trim()) {
    parts.push(voiceTranscript.trim())
  }
  
  const basicInfo = []
  if (formData.age) basicInfo.push(`${formData.age} years old`)
  if (formData.location) basicInfo.push(`lives in ${formData.location}`)
  
  const careerInfo = []
  if (formData.jobTitle) careerInfo.push(`Works as a ${formData.jobTitle}`)
  if (formData.education) careerInfo.push(`Has a ${formData.education}`)
  if (formData.lookingFor) careerInfo.push(`Looking for ${formData.lookingFor.toLowerCase()}`)
  
  if (basicInfo.length > 0) parts.push(basicInfo.join(", ") + ".")
  if (careerInfo.length > 0) parts.push(careerInfo.join(". ") + ".")
  
  if (parts.length === 0) return ""
  
  return parts.join(" ").trim()
}

console.log("🧪 QA Test: Speech Input Edge Cases")
console.log("=" .repeat(80))

const edgeCases = [
  edgeCase1, edgeCase2, edgeCase3, edgeCase4, edgeCase5,
  edgeCase6, edgeCase7, edgeCase8, edgeCase9, edgeCase10
]

let passed = 0
let failed = 0

edgeCases.forEach((testCase, index) => {
  console.log(`\n${"=".repeat(80)}`)
  console.log(`Edge Case ${index + 1}/${edgeCases.length}: ${testCase.name}`)
  console.log("=".repeat(80))
  console.log(`Description: ${testCase.description}`)
  
  // Filter out whitespace-only responses
  const validResponses = testCase.voiceResponses.filter(r => r.trim().length > 0)
  const voiceTranscript = validResponses.join(" ")
  
  console.log(`\n📊 Input:`)
  console.log(`   - Form fields: ${Object.keys(testCase.formData).length}`)
  console.log(`   - Voice responses: ${testCase.voiceResponses.length}`)
  console.log(`   - Valid responses: ${validResponses.length}`)
  console.log(`   - Combined transcript: ${voiceTranscript.length} chars`)
  
  if (testCase.voiceResponses.length > 0) {
    console.log(`\n🎤 Voice Responses:`)
    testCase.voiceResponses.forEach((r, i) => {
      const isValid = r.trim().length > 0
      console.log(`   ${i + 1}. "${r}" ${isValid ? "✅" : "⚠️  (whitespace only)"}`)
    })
  }
  
  const profileDescription = formatProfileDescription(testCase.formData, voiceTranscript)
  const isValid = profileDescription && profileDescription.trim().length >= 10
  
  console.log(`\n📝 Profile Description:`)
  console.log(`   Length: ${profileDescription.length} characters`)
  console.log(`   Content: "${profileDescription.substring(0, 100)}${profileDescription.length > 100 ? '...' : ''}"`)
  
  console.log(`\n✅ Validation:`)
  console.log(`   - Length >= 10: ${profileDescription.length >= 10 ? "✅ YES" : "❌ NO"}`)
  console.log(`   - Expected to pass: ${testCase.shouldPass ? "YES" : "NO"}`)
  console.log(`   - Actually passes: ${isValid ? "YES" : "NO"}`)
  
  const testPassed = (isValid === testCase.shouldPass)
  
  if (testPassed) {
    console.log(`\n✅ TEST PASSED`)
    passed++
  } else {
    console.log(`\n❌ TEST FAILED`)
    console.log(`   Expected: ${testCase.shouldPass ? "PASS" : "FAIL"}`)
    console.log(`   Actual: ${isValid ? "PASS" : "FAIL"}`)
    failed++
  }
})

console.log(`\n${"=".repeat(80)}`)
console.log("📊 Edge Cases Summary")
console.log("=".repeat(80))
console.log(`   Total Tests: ${edgeCases.length}`)
console.log(`   Passed: ${passed} ✅`)
console.log(`   Failed: ${failed} ${failed > 0 ? "❌" : ""}`)
console.log(`   Success Rate: ${((passed / edgeCases.length) * 100).toFixed(1)}%`)
console.log("=".repeat(80))

if (failed === 0) {
  console.log("\n🎉 All edge case tests passed!")
} else {
  console.log(`\n⚠️  ${failed} edge case test(s) failed.`)
  process.exit(1)
}
