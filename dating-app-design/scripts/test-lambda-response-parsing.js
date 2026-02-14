/**
 * Test Lambda Response Parsing
 * 
 * Tests all the parsing strategies used in app/api/submit-form/route.ts
 * to ensure Lambda responses are correctly parsed regardless of format
 */

// Simulate the parsing logic from the API route
function parseLambdaResponse(responseText) {
  let lambdaData = null
  let parseError = null
  
  // Strategy 1: Try parsing the entire response as JSON
  let parsed = null
  try {
    parsed = JSON.parse(responseText)
    console.log("✅ Strategy 1: Parsed entire response as JSON")
  } catch (e) {
    parseError = e
    console.log("❌ Strategy 1 failed:", parseError.message)
  }
  
  // Strategy 2: If parsed, check if it has a 'body' field (Lambda proxy format)
  if (parsed) {
    // Lambda returns: { statusCode: 200, body: "{\"score\": 87, ...}" }
    if (parsed.statusCode !== undefined && parsed.body && typeof parsed.body === 'string') {
      console.log("✅ Strategy 2: Found Lambda proxy response (statusCode + body), extracting body...")
      const bodyString = parsed.body
      try {
        const bodyData = JSON.parse(bodyString)
        console.log("✅ Strategy 2: Successfully parsed body JSON")
        lambdaData = bodyData
      } catch (e) {
        console.log("⚠️  Strategy 2: Direct parse failed, trying extraction from body string...")
        const firstBrace = bodyString.indexOf('{')
        const lastBrace = bodyString.lastIndexOf('}')
        if (firstBrace !== -1 && lastBrace > firstBrace) {
          try {
            const extracted = bodyString.substring(firstBrace, lastBrace + 1)
            lambdaData = JSON.parse(extracted)
            console.log("✅ Strategy 2: Successfully extracted and parsed JSON from body")
          } catch (e2) {
            console.error("❌ Strategy 2: Failed to extract JSON from body:", e2.message)
          }
        }
      }
    } else if (parsed.body && typeof parsed.body === 'string' && !parsed.statusCode) {
      console.log("✅ Strategy 2b: Found 'body' field without statusCode, parsing...")
      try {
        lambdaData = JSON.parse(parsed.body)
        console.log("✅ Strategy 2b: Successfully parsed body")
      } catch (e) {
        console.log("❌ Strategy 2b: Failed")
      }
    }
    
    // If we haven't set lambdaData yet, check if parsed is already the data
    if (!lambdaData) {
      if (parsed.score !== undefined || parsed.summary) {
        console.log("✅ Parsed data is already the Lambda response (has score/summary)")
        lambdaData = parsed
      } else if (!parsed.statusCode && !parsed.body) {
        console.log("✅ Parsed data has no Lambda structure, using as-is")
        lambdaData = parsed
      } else {
        console.error("❌ Warning: Parsed data still has Lambda structure but body extraction failed")
        lambdaData = parsed
      }
    }
  } else {
    // Strategy 4: Extract first valid JSON object from the response text
    console.log("⚠️  Strategy 4: Attempting to extract JSON from response text...")
    // Find the first { and last } to extract valid JSON
    const firstBrace = responseText.indexOf('{')
    const lastBrace = responseText.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        const extracted = responseText.substring(firstBrace, lastBrace + 1)
        const extractedParsed = JSON.parse(extracted)
        console.log("✅ Strategy 4: Successfully extracted and parsed JSON")
        
        // If extracted object has Lambda proxy format, extract body
        if (extractedParsed.statusCode !== undefined && extractedParsed.body && typeof extractedParsed.body === 'string') {
          console.log("✅ Strategy 4: Found Lambda proxy in extracted JSON, extracting body...")
          try {
            lambdaData = JSON.parse(extractedParsed.body)
            console.log("✅ Strategy 4: Successfully parsed body from extracted Lambda proxy")
          } catch (e) {
            console.log("⚠️  Strategy 4: Body parse failed, using extracted object")
            lambdaData = extractedParsed
          }
        } else if (extractedParsed.score !== undefined || extractedParsed.summary) {
          // Already has the data
          lambdaData = extractedParsed
        } else {
          lambdaData = extractedParsed
        }
      } catch (e) {
        console.error("❌ Strategy 4: Failed to parse extracted JSON:", e.message)
        // Try regex as fallback
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          try {
            const regexParsed = JSON.parse(jsonMatch[0])
            // Check if it's Lambda proxy format
            if (regexParsed.statusCode !== undefined && regexParsed.body && typeof regexParsed.body === 'string') {
              lambdaData = JSON.parse(regexParsed.body)
              console.log("✅ Strategy 4b: Successfully extracted using regex and parsed body")
            } else {
              lambdaData = regexParsed
              console.log("✅ Strategy 4b: Successfully extracted using regex fallback")
            }
          } catch (e2) {
            console.error("❌ Strategy 4b: Regex fallback also failed:", e2.message)
          }
        }
      }
    }
  }
  
  return lambdaData
}

// Test cases
const testCases = [
  {
    name: "Standard Lambda Proxy Format",
    response: JSON.stringify({
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        score: 87,
        summary: "The date went well...",
        meta: {
          compatibility_factors: { shared_interests: "hiking" },
          potential_concerns: "none",
          candidate_profile: "I'm a designer..."
        }
      })
    }),
    expected: {
      hasScore: true,
      hasSummary: true,
      hasMeta: true,
      score: 87
    }
  },
  {
    name: "Direct JSON Response (no Lambda wrapper)",
    response: JSON.stringify({
      score: 87,
      summary: "The date went well...",
      meta: {
        compatibility_factors: { shared_interests: "hiking" },
        potential_concerns: "none"
      }
    }),
    expected: {
      hasScore: true,
      hasSummary: true,
      hasMeta: true,
      score: 87
    }
  },
  {
    name: "Lambda Response with Extra Text",
    response: `Some extra text before {"statusCode": 200, "body": "{\\"score\\": 87, \\"summary\\": \\"The date...\\"}"} some extra text after`,
    expected: {
      hasScore: true,
      hasSummary: true,
      score: 87
    }
  },
  {
    name: "Lambda Response with Escaped JSON in Body",
    response: JSON.stringify({
      statusCode: 200,
      body: "{\"score\": 87, \"summary\": \"The date went well\", \"meta\": {\"compatibility_factors\": {\"shared_interests\": \"hiking\"}}}"
    }),
    expected: {
      hasScore: true,
      hasSummary: true,
      hasMeta: true,
      score: 87
    }
  },
  {
    name: "API Gateway Wrapped Response",
    response: JSON.stringify({
      statusCode: 200,
      headers: {},
      body: JSON.stringify({
        score: 87,
        summary: "The date went well...",
        meta: {
          compatibility_factors: { shared_interests: "hiking" },
          potential_concerns: "none"
        }
      }),
      isBase64Encoded: false
    }),
    expected: {
      hasScore: true,
      hasSummary: true,
      hasMeta: true,
      score: 87
    }
  },
  {
    name: "Response with Only Body Field",
    response: JSON.stringify({
      body: JSON.stringify({
        score: 87,
        summary: "The date went well...",
        meta: {}
      })
    }),
    expected: {
      hasScore: true,
      hasSummary: true,
      score: 87
    }
  },
  {
    name: "Empty Response (should fail gracefully)",
    response: JSON.stringify({}),
    expected: {
      hasScore: false,
      hasSummary: false,
      shouldBeEmpty: true
    }
  },
  {
    name: "Response with Extra Whitespace",
    response: `   \n\n   ${JSON.stringify({
      statusCode: 200,
      body: JSON.stringify({
        score: 87,
        summary: "The date went well...",
        meta: {}
      })
    })}   \n\n   `,
    expected: {
      hasScore: true,
      hasSummary: true,
      score: 87
    }
  }
]

console.log("🧪 TESTING LAMBDA RESPONSE PARSING")
console.log("=".repeat(80))

let passed = 0
let failed = 0

testCases.forEach((testCase, index) => {
  console.log(`\n${"=".repeat(80)}`)
  console.log(`Test ${index + 1}/${testCases.length}: ${testCase.name}`)
  console.log("=".repeat(80))
  
  const result = parseLambdaResponse(testCase.response)
  
  console.log("\n📊 Results:")
  console.log(`   Parsed result:`, result ? JSON.stringify(result).substring(0, 100) + "..." : "null/undefined")
  
  if (result) {
    const hasScore = 'score' in result && result.score !== undefined
    const hasSummary = 'summary' in result && typeof result.summary === 'string'
    const hasMeta = 'meta' in result && typeof result.meta === 'object'
    const score = result.score
    
    console.log(`   Has score: ${hasScore ? "✅" : "❌"} (${score})`)
    console.log(`   Has summary: ${hasSummary ? "✅" : "❌"}`)
    console.log(`   Has meta: ${hasMeta ? "✅" : "❌"}`)
    
    // Validate expectations
    let testPassed = true
    if (testCase.expected.hasScore !== undefined && testCase.expected.hasScore !== hasScore) {
      console.log(`   ❌ Expected hasScore: ${testCase.expected.hasScore}, got: ${hasScore}`)
      testPassed = false
    }
    if (testCase.expected.hasSummary !== undefined && testCase.expected.hasSummary !== hasSummary) {
      console.log(`   ❌ Expected hasSummary: ${testCase.expected.hasSummary}, got: ${hasSummary}`)
      testPassed = false
    }
    if (testCase.expected.hasMeta !== undefined && testCase.expected.hasMeta !== hasMeta) {
      console.log(`   ❌ Expected hasMeta: ${testCase.expected.hasMeta}, got: ${hasMeta}`)
      testPassed = false
    }
    if (testCase.expected.score !== undefined && testCase.expected.score !== score) {
      console.log(`   ❌ Expected score: ${testCase.expected.score}, got: ${score}`)
      testPassed = false
    }
    if (testCase.expected.shouldBeEmpty && result && Object.keys(result).length > 0) {
      console.log(`   ❌ Expected empty result, got: ${Object.keys(result).length} keys`)
      testPassed = false
    }
    
    if (testPassed) {
      console.log(`\n   ✅ TEST PASSED`)
      passed++
    } else {
      console.log(`\n   ❌ TEST FAILED`)
      failed++
    }
  } else {
    if (testCase.expected.shouldBeEmpty) {
      console.log(`\n   ✅ TEST PASSED (correctly returned null/undefined)`)
      passed++
    } else {
      console.log(`\n   ❌ TEST FAILED (expected data but got null/undefined)`)
      failed++
    }
  }
})

console.log(`\n${"=".repeat(80)}`)
console.log("📊 TEST SUMMARY")
console.log("=".repeat(80))
console.log(`   Total Tests: ${testCases.length}`)
console.log(`   Passed: ${passed} ✅`)
console.log(`   Failed: ${failed} ${failed > 0 ? "❌" : ""}`)
console.log(`   Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`)
console.log("=".repeat(80))

if (failed === 0) {
  console.log("\n🎉 All Lambda response parsing tests passed!")
} else {
  console.log(`\n⚠️  ${failed} test(s) failed. Review the issues above.`)
  process.exit(1)
}
