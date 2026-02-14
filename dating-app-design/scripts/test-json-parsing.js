/**
 * Test Script: JSON Parsing Edge Cases
 * 
 * Tests various JSON response formats that might come from Lambda/API Gateway
 */

// Test cases for different response formats
const testCases = [
  {
    name: "Direct JSON response",
    response: JSON.stringify({
      score: 87,
      summary: "The date went well...",
      meta: {
        compatibility_factors: { shared_interests: "hiking" },
        potential_concerns: "none",
        candidate_profile: "I'm a designer..."
      }
    })
  },
  {
    name: "API Gateway wrapped (with body field)",
    response: JSON.stringify({
      statusCode: 200,
      body: JSON.stringify({
        score: 87,
        summary: "The date went well...",
        meta: {
          compatibility_factors: { shared_interests: "hiking" },
          potential_concerns: "none",
          candidate_profile: "I'm a designer..."
        }
      })
    })
  },
  {
    name: "Response with extra text before JSON",
    response: "Some log output\n" + JSON.stringify({
      score: 87,
      summary: "The date went well..."
    })
  },
  {
    name: "Response with extra text after JSON",
    response: JSON.stringify({
      score: 87,
      summary: "The date went well..."
    }) + "\nSome trailing text"
  },
  {
    name: "Multiple JSON objects (first one valid)",
    response: JSON.stringify({ score: 87, summary: "Good" }) + "\n" + JSON.stringify({ error: "extra" })
  },
  {
    name: "JSON with markdown code blocks",
    response: "```json\n" + JSON.stringify({
      score: 87,
      summary: "The date went well..."
    }) + "\n```"
  }
]

// Parsing function (simulating the improved parsing logic)
function parseLambdaResponse(responseText) {
  let parsed = null
  let parseError = null

  // Strategy 1: Try parsing entire response
  try {
    parsed = JSON.parse(responseText)
    return { success: true, data: parsed, strategy: "direct" }
  } catch (e) {
    parseError = e
  }

  // Strategy 2: Check for body field
  try {
    const temp = JSON.parse(responseText)
    if (temp.body && typeof temp.body === 'string') {
      try {
        parsed = JSON.parse(temp.body)
        return { success: true, data: parsed, strategy: "body_field" }
      } catch (e) {
        // Try extracting JSON from body
        const bodyMatch = temp.body.match(/\{[\s\S]*?\}(?=\s*$|\s*\{)/)
        if (bodyMatch) {
          parsed = JSON.parse(bodyMatch[0])
          return { success: true, data: parsed, strategy: "body_extraction" }
        }
      }
    }
    if (temp.statusCode && temp.body && typeof temp.body === 'string') {
      try {
        parsed = JSON.parse(temp.body)
        return { success: true, data: parsed, strategy: "lambda_structure" }
      } catch (e) {
        const bodyMatch = temp.body.match(/\{[\s\S]*?\}(?=\s*$|\s*\{)/)
        if (bodyMatch) {
          parsed = JSON.parse(bodyMatch[0])
          return { success: true, data: parsed, strategy: "lambda_extraction" }
        }
      }
    }
  } catch (e) {
    // Continue to next strategy
  }

  // Strategy 3: Extract first valid JSON object
  const jsonMatch = responseText.match(/\{[\s\S]*?\}(?=\s*$|\s*\{)/)
  if (jsonMatch) {
    try {
      parsed = JSON.parse(jsonMatch[0])
      return { success: true, data: parsed, strategy: "regex_extraction" }
    } catch (e) {
      // Continue
    }
  }

  // Strategy 4: Find JSON by brace matching
  const firstBrace = responseText.indexOf('{')
  if (firstBrace !== -1) {
    let jsonEnd = firstBrace
    let braceCount = 0
    let inString = false
    let escapeNext = false

    for (let i = firstBrace; i < responseText.length; i++) {
      const char = responseText[i]

      if (escapeNext) {
        escapeNext = false
        continue
      }

      if (char === '\\') {
        escapeNext = true
        continue
      }

      if (char === '"') {
        inString = !inString
        continue
      }

      if (!inString) {
        if (char === '{') braceCount++
        if (char === '}') {
          braceCount--
          if (braceCount === 0) {
            jsonEnd = i + 1
            break
          }
        }
      }
    }

    if (braceCount === 0 && jsonEnd > firstBrace) {
      try {
        const jsonStr = responseText.substring(firstBrace, jsonEnd)
        parsed = JSON.parse(jsonStr)
        return { success: true, data: parsed, strategy: "brace_matching" }
      } catch (e) {
        // Failed
      }
    }
  }

  // Clean markdown code blocks and try again
  const cleaned = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  try {
    parsed = JSON.parse(cleaned)
    return { success: true, data: parsed, strategy: "markdown_cleanup" }
  } catch (e) {
    // Final failure
  }

  return { success: false, error: parseError?.message || "All parsing strategies failed", strategy: "none" }
}

console.log("🧪 Test: JSON Parsing Edge Cases")
console.log("=" .repeat(70))

let passed = 0
let failed = 0

testCases.forEach((testCase, index) => {
  console.log(`\n📋 Test ${index + 1}: ${testCase.name}`)
  console.log("-".repeat(70))
  
  const result = parseLambdaResponse(testCase.response)
  
  if (result.success) {
    console.log(`✅ PASSED (Strategy: ${result.strategy})`)
    if (result.data.score !== undefined) {
      console.log(`   Extracted score: ${result.data.score}`)
    }
    passed++
  } else {
    console.log(`❌ FAILED: ${result.error}`)
    failed++
  }
})

console.log("\n" + "=" .repeat(70))
console.log("📊 Summary:")
console.log(`   - Total tests: ${testCases.length}`)
console.log(`   - Passed: ${passed} ✅`)
console.log(`   - Failed: ${failed} ${failed > 0 ? "❌" : ""}`)
console.log(`   - Success rate: ${((passed / testCases.length) * 100).toFixed(1)}%`)
console.log("=" .repeat(70))

if (failed === 0) {
  console.log("\n🎉 All JSON parsing tests passed!")
} else {
  console.log(`\n⚠️  ${failed} test(s) failed. Review the parsing logic.`)
  process.exit(1)
}
