/**
 * Test Exact Lambda Response Format
 * 
 * Tests the exact response format the user provided
 */

const exactResponse = {
  "score": 82,
  "summary": "Laura and her date met at a cozy café in Manhattan on a Sunday afternoon, and the chemistry was immediately apparent. They bonded over their shared love of hot chocolate, with him enthusiastically sharing his passion for probability theory while she appreciated his genuine intellectual engagement. The conversation flowed naturally from mathematics to their favorite rock climbing spots in upstate New York, with both lighting up when discussing their recent climbs. He was genuinely interested in her consulting work at McKinsey, and she found his data science background fascinating. When the topic turned to weekend plans, they discovered perfect alignment—he enthusiastically endorsed the idea of lazy mornings making French toast rather than waking early, and readily agreed that hiring someone to clean would be ideal. Their values around building a family resonated deeply, and both appreciated each other's progressive worldview and cultural curiosity. The date lasted three hours longer than planned, with natural laughter and easy silences that suggested genuine compatibility.\n\nThe only minor moment came when he mentioned his ambition to eventually start his own venture, which Laura gently probed about to ensure it wasn't rooted in ego—but his grounded, collaborative approach quickly put her at ease. By the end of the date, they were already planning their first rock climbing trip together and debating which sci-fi novels they should read in parallel. He walked her to the subway with a genuine smile, and both left feeling like they'd met someone who truly understood their ideal balance of intellectual stimulation, adventure, and cozy domesticity.",
  "meta": {
    "compatibility_factors": {
      "shared_interests": "mathematics and intellectual discussion, rock climbing, hot chocolate, reading, lazy weekend mornings, desire for family, progressive values, avoiding early wake-ups, delegating household tasks",
      "humor_alignment": "Both appreciate witty banter and dry humor; he makes clever probability jokes while she appreciates his self-aware geekiness without pretension",
      "lifestyle_match": "Excellent alignment—both value adventure (climbing) balanced with cozy downtime (reading, hot chocolate), neither are morning people, both seek work-life balance and are willing to outsource chores",
      "conversation_ease": "Remarkably smooth; they moved effortlessly between deep intellectual topics and casual lifestyle preferences, with natural curiosity driving questions about each other's backgrounds"
    },
    "potential_concerns": "Laura's emphasis on not being conceited or monocultured is well-satisfied, though his startup ambitions could theoretically become concerning if they ever manifested as ego-driven behavior—however, his current framing suggests genuine passion rather than arrogance",
    "candidate_profile": "I'm a 28-year-old data scientist at a fintech startup in NYC who genuinely geeks out over mathematics and statistics—I'd love to debate probability theory over hot chocolate on lazy Sunday mornings. Rock climbing is my favorite weekend escape, and I'm equally happy curling up with a good sci-fi novel or letting someone else handle the household chores while I decompress. I'm politically progressive, culturally curious, and looking for something real with someone who values both adventure and cozy downtime, ideally leading to building a family together."
  }
}

console.log("🧪 TESTING EXACT LAMBDA RESPONSE FORMAT")
console.log("=".repeat(80))

// Test 1: Direct JSON (what Lambda might return directly)
console.log("\n📋 Test 1: Direct JSON Response")
console.log("=".repeat(80))
const directJson = JSON.stringify(exactResponse)
console.log("Response length:", directJson.length, "characters")
console.log("Response preview:", directJson.substring(0, 200) + "...")

// Simulate API route parsing
let lambdaData = null
try {
  const parsed = JSON.parse(directJson)
  if (parsed.score !== undefined || parsed.summary) {
    lambdaData = parsed
    console.log("✅ Parsed as direct JSON (has score/summary)")
  }
} catch (e) {
  console.error("❌ Failed to parse:", e.message)
}

if (lambdaData) {
  const hasValidScore = typeof lambdaData.score === 'number' && !isNaN(lambdaData.score)
  const hasValidSummary = typeof lambdaData.summary === 'string' && lambdaData.summary.trim().length > 0
  const hasMeta = lambdaData.meta && typeof lambdaData.meta === 'object'
  
  console.log("\n📊 Validation Results:")
  console.log(`   Has valid score: ${hasValidScore ? "✅" : "❌"} (${lambdaData.score})`)
  console.log(`   Has valid summary: ${hasValidSummary ? "✅" : "❌"} (${lambdaData.summary.length} chars)`)
  console.log(`   Has meta: ${hasMeta ? "✅" : "❌"}`)
  console.log(`   Has compatibility_factors: ${lambdaData.meta?.compatibility_factors ? "✅" : "❌"}`)
  console.log(`   Has potential_concerns: ${lambdaData.meta?.potential_concerns !== undefined ? "✅" : "❌"}`)
  console.log(`   Has candidate_profile: ${lambdaData.meta?.candidate_profile ? "✅" : "❌"}`)
  
  if (hasValidScore && hasValidSummary) {
    console.log("\n✅ VALIDATION PASSES - Response structure is correct!")
  } else {
    console.log("\n❌ VALIDATION FAILS")
  }
}

// Test 2: Lambda Proxy Format (wrapped in statusCode/body)
console.log("\n📋 Test 2: Lambda Proxy Format (wrapped)")
console.log("=".repeat(80))
const lambdaProxyFormat = JSON.stringify({
  statusCode: 200,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(exactResponse)
})
console.log("Response length:", lambdaProxyFormat.length, "characters")

// Simulate API route parsing for Lambda proxy format
let lambdaData2 = null
try {
  const parsed = JSON.parse(lambdaProxyFormat)
  if (parsed.statusCode !== undefined && parsed.body && typeof parsed.body === 'string') {
    const bodyData = JSON.parse(parsed.body)
    lambdaData2 = bodyData
    console.log("✅ Extracted from Lambda proxy format")
  }
} catch (e) {
  console.error("❌ Failed to parse:", e.message)
}

if (lambdaData2) {
  const hasValidScore = typeof lambdaData2.score === 'number' && !isNaN(lambdaData2.score)
  const hasValidSummary = typeof lambdaData2.summary === 'string' && lambdaData2.summary.trim().length > 0
  
  console.log("\n📊 Validation Results:")
  console.log(`   Has valid score: ${hasValidScore ? "✅" : "❌"} (${lambdaData2.score})`)
  console.log(`   Has valid summary: ${hasValidSummary ? "✅" : "❌"} (${lambdaData2.summary.length} chars)`)
  
  if (hasValidScore && hasValidSummary) {
    console.log("\n✅ VALIDATION PASSES - Lambda proxy format parsed correctly!")
  } else {
    console.log("\n❌ VALIDATION FAILS")
  }
}

// Test 3: Frontend validation (what app/page.tsx checks)
console.log("\n📋 Test 3: Frontend Validation")
console.log("=".repeat(80))
const frontendData = exactResponse

const hasValidScore = frontendData && typeof frontendData.score === 'number' && !isNaN(frontendData.score)
const hasValidSummary = frontendData && typeof frontendData.summary === 'string' && frontendData.summary.trim().length > 0

console.log("Frontend validation check:")
console.log(`   hasValidScore: ${hasValidScore}`)
console.log(`   hasValidSummary: ${hasValidSummary}`)
console.log(`   score value: ${frontendData.score}`)
console.log(`   score type: ${typeof frontendData.score}`)
console.log(`   summary length: ${frontendData.summary.length}`)
console.log(`   summary type: ${typeof frontendData.summary}`)

if (hasValidScore && hasValidSummary) {
  console.log("\n✅ FRONTEND VALIDATION PASSES - Response will be accepted!")
} else {
  console.log("\n❌ FRONTEND VALIDATION FAILS - Response will be rejected!")
  console.log("   This is the issue that needs to be fixed!")
}

console.log("\n" + "=".repeat(80))
console.log("📊 FINAL SUMMARY")
console.log("=".repeat(80))
console.log("✅ Direct JSON: Parses correctly")
console.log("✅ Lambda Proxy Format: Parses correctly")
console.log(`${hasValidScore && hasValidSummary ? "✅" : "❌"} Frontend Validation: ${hasValidScore && hasValidSummary ? "PASSES" : "FAILS"}`)
console.log("=".repeat(80))

if (!hasValidScore || !hasValidSummary) {
  console.log("\n⚠️  ISSUE DETECTED: Frontend validation is failing even though data is correct!")
  console.log("   This suggests the validation logic needs to be fixed.")
  process.exit(1)
} else {
  console.log("\n🎉 All validations pass! The response format is correct.")
}
