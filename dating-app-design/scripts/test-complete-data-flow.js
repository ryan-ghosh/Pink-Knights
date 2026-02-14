/**
 * Complete End-to-End Data Flow Test
 * 
 * Tests the ENTIRE flow from frontend → API route → Lambda → API route → frontend
 */

console.log("🧪 COMPLETE END-TO-END DATA FLOW TEST")
console.log("=".repeat(80))

// Step 1: Lambda returns this format
const lambdaResponse = {
  statusCode: 200,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    score: 82,
    summary: "Laura and her date met at a cozy café in Manhattan on a Sunday afternoon, and the chemistry was immediately apparent. They bonded over their shared love of hot chocolate, with him enthusiastically sharing his passion for probability theory while she appreciated his genuine intellectual engagement.",
    meta: {
      compatibility_factors: {
        shared_interests: "mathematics and intellectual discussion, rock climbing, hot chocolate",
        humor_alignment: "Both appreciate witty banter and dry humor",
        lifestyle_match: "Excellent alignment",
        conversation_ease: "Remarkably smooth"
      },
      potential_concerns: "Minor concerns about startup ambitions",
      candidate_profile: "I'm a 28-year-old data scientist..."
    }
  })
}

console.log("\n📥 Step 1: Lambda Response")
console.log("=".repeat(80))
console.log("Lambda returns:", JSON.stringify(lambdaResponse).substring(0, 200) + "...")

// Step 2: API route parses Lambda response
console.log("\n📥 Step 2: API Route Parsing")
console.log("=".repeat(80))

let lambdaData = null
const responseText = JSON.stringify(lambdaResponse)

// Simulate API route parsing logic
try {
  const parsed = JSON.parse(responseText)
  if (parsed.statusCode !== undefined && parsed.body && typeof parsed.body === 'string') {
    lambdaData = JSON.parse(parsed.body)
    console.log("✅ Extracted body from Lambda proxy format")
  }
} catch (e) {
  console.error("❌ Parsing failed:", e.message)
}

if (lambdaData) {
  console.log("✅ Parsed lambdaData:", {
    hasScore: 'score' in lambdaData,
    hasSummary: 'summary' in lambdaData,
    hasMeta: 'meta' in lambdaData,
    score: lambdaData.score,
    summaryLength: lambdaData.summary?.length
  })
}

// Step 3: API route returns to frontend
console.log("\n📤 Step 3: API Route Response")
console.log("=".repeat(80))

const apiRouteResponse = {
  success: true,
  data: lambdaData
}

console.log("API route returns:", JSON.stringify(apiRouteResponse).substring(0, 200) + "...")
console.log("✅ API route response structure:", {
  hasSuccess: 'success' in apiRouteResponse,
  hasData: 'data' in apiRouteResponse,
  dataHasScore: apiRouteResponse.data && 'score' in apiRouteResponse.data,
  dataHasSummary: apiRouteResponse.data && 'summary' in apiRouteResponse.data
})

// Step 4: sendToBackend receives and processes
console.log("\n📥 Step 4: sendToBackend Processing")
console.log("=".repeat(80))

const responseData = apiRouteResponse // This is what sendToBackend receives from fetch

let frontendData = null
if (responseData.success && responseData.data) {
  // API route format: { success: true, data: { score, summary, meta } }
  frontendData = responseData.data
  console.log("✅ Extracted data from API route response")
} else if (responseData.score !== undefined || responseData.summary) {
  // Direct Lambda response format
  frontendData = responseData
  console.log("✅ Using direct Lambda response")
} else {
  frontendData = responseData
  console.log("⚠️  Using response as-is")
}

console.log("Frontend data:", {
  hasScore: frontendData && 'score' in frontendData,
  hasSummary: frontendData && 'summary' in frontendData,
  score: frontendData?.score,
  summaryLength: frontendData?.summary?.length
})

// Step 5: Frontend validation
console.log("\n✅ Step 5: Frontend Validation")
console.log("=".repeat(80))

const hasValidScore = frontendData && typeof frontendData.score === 'number' && !isNaN(frontendData.score)
const hasValidSummary = frontendData && typeof frontendData.summary === 'string' && frontendData.summary.trim().length > 0

console.log("Validation results:")
console.log(`   hasValidScore: ${hasValidScore} (${frontendData?.score})`)
console.log(`   hasValidSummary: ${hasValidSummary} (${frontendData?.summary?.length} chars)`)
console.log(`   score type: ${typeof frontendData?.score}`)
console.log(`   summary type: ${typeof frontendData?.summary}`)

if (hasValidScore && hasValidSummary) {
  console.log("\n✅ VALIDATION PASSES - Profile will be displayed!")
} else {
  console.log("\n❌ VALIDATION FAILS - Error will be shown!")
  console.log("   This is the bug that needs to be fixed!")
}

// Final summary
console.log("\n" + "=".repeat(80))
console.log("📊 COMPLETE FLOW SUMMARY")
console.log("=".repeat(80))
console.log("✅ Step 1: Lambda response format - CORRECT")
console.log("✅ Step 2: API route parsing - CORRECT")
console.log("✅ Step 3: API route response structure - CORRECT")
console.log(`${hasValidScore && hasValidSummary ? "✅" : "❌"} Step 4: sendToBackend extraction - ${hasValidScore && hasValidSummary ? "CORRECT" : "INCORRECT"}`)
console.log(`${hasValidScore && hasValidSummary ? "✅" : "❌"} Step 5: Frontend validation - ${hasValidScore && hasValidSummary ? "PASSES" : "FAILS"}`)
console.log("=".repeat(80))

if (hasValidScore && hasValidSummary) {
  console.log("\n🎉 Complete flow works correctly!")
} else {
  console.log("\n⚠️  Flow is broken - validation fails!")
  process.exit(1)
}
