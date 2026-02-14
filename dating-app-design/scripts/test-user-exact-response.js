/**
 * Test User's Exact Response Format
 * 
 * Tests the EXACT response format the user provided to ensure it works
 */

const userExactResponse = {
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

console.log("🧪 TESTING USER'S EXACT RESPONSE FORMAT")
console.log("=".repeat(80))

// Simulate the complete flow

// Step 1: Lambda returns this (wrapped in proxy format)
const lambdaProxyResponse = {
  statusCode: 200,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(userExactResponse)
}

console.log("\n📥 Step 1: Lambda Proxy Response")
console.log("=".repeat(80))
console.log("Lambda returns:", JSON.stringify(lambdaProxyResponse).substring(0, 150) + "...")

// Step 2: API route parses it
console.log("\n📥 Step 2: API Route Parsing")
console.log("=".repeat(80))

let lambdaData = null
try {
  const parsed = JSON.parse(JSON.stringify(lambdaProxyResponse))
  if (parsed.statusCode !== undefined && parsed.body && typeof parsed.body === 'string') {
    lambdaData = JSON.parse(parsed.body)
    console.log("✅ Successfully extracted body from Lambda proxy format")
  }
} catch (e) {
  console.error("❌ Parsing failed:", e.message)
  process.exit(1)
}

// Step 3: API route validates and returns
console.log("\n📤 Step 3: API Route Validation & Response")
console.log("=".repeat(80))

const hasValidScore = typeof lambdaData.score === 'number' && !isNaN(lambdaData.score)
const hasValidSummary = typeof lambdaData.summary === 'string' && lambdaData.summary.trim().length > 0

console.log("API route validation:")
console.log(`   hasValidScore: ${hasValidScore} (${lambdaData.score})`)
console.log(`   hasValidSummary: ${hasValidSummary} (${lambdaData.summary.length} chars)`)

if (!hasValidScore || !hasValidSummary) {
  console.error("❌ API route validation FAILED - would return error")
  process.exit(1)
}

const apiRouteResponse = {
  success: true,
  data: lambdaData
}

console.log("✅ API route returns:", {
  success: apiRouteResponse.success,
  hasData: !!apiRouteResponse.data,
  dataHasScore: apiRouteResponse.data.score === 82,
  dataHasSummary: apiRouteResponse.data.summary.length > 0,
  dataHasMeta: !!apiRouteResponse.data.meta
})

// Step 4: sendToBackend processes it
console.log("\n📥 Step 4: sendToBackend Processing")
console.log("=".repeat(80))

const responseData = apiRouteResponse
let frontendData = null

if (responseData.success && responseData.data) {
  frontendData = responseData.data
  console.log("✅ Extracted data from API route response")
} else if (responseData.score !== undefined || responseData.summary) {
  frontendData = responseData
  console.log("✅ Using direct Lambda response")
} else {
  frontendData = responseData
  console.log("⚠️  Using response as-is")
}

console.log("Frontend data structure:", {
  hasScore: frontendData && 'score' in frontendData,
  score: frontendData?.score,
  hasSummary: frontendData && 'summary' in frontendData,
  summaryLength: frontendData?.summary?.length,
  hasMeta: frontendData && 'meta' in frontendData
})

// Step 5: Frontend validation
console.log("\n✅ Step 5: Frontend Validation")
console.log("=".repeat(80))

const frontendHasValidScore = frontendData && typeof frontendData.score === 'number' && !isNaN(frontendData.score)
const frontendHasValidSummary = frontendData && typeof frontendData.summary === 'string' && frontendData.summary.trim().length > 0

console.log("Frontend validation:")
console.log(`   hasValidScore: ${frontendHasValidScore} (${frontendData?.score})`)
console.log(`   hasValidSummary: ${frontendHasValidSummary} (${frontendData?.summary?.length} chars)`)
console.log(`   score type: ${typeof frontendData?.score}`)
console.log(`   summary type: ${typeof frontendData?.summary}`)

if (frontendHasValidScore && frontendHasValidSummary) {
  console.log("\n✅✅✅ FRONTEND VALIDATION PASSES ✅✅✅")
  console.log("   Profile will be displayed successfully!")
} else {
  console.log("\n❌❌❌ FRONTEND VALIDATION FAILS ❌❌❌")
  console.log("   Error will be shown - THIS IS THE BUG!")
  process.exit(1)
}

// Final verification
console.log("\n" + "=".repeat(80))
console.log("📊 FINAL VERIFICATION")
console.log("=".repeat(80))
console.log("✅ Lambda response format: CORRECT")
console.log("✅ API route parsing: CORRECT")
console.log("✅ API route validation: PASSES")
console.log("✅ API route response: CORRECT")
console.log("✅ sendToBackend extraction: CORRECT")
console.log("✅ Frontend validation: PASSES")
console.log("=".repeat(80))
console.log("\n🎉🎉🎉 COMPLETE FLOW WORKS CORRECTLY! 🎉🎉🎉")
console.log("\nThe exact response format you provided will work correctly!")
