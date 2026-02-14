#!/usr/bin/env node

/**
 * Test Runner: Runs all QA tests
 * 
 * Usage: node scripts/run-all-tests.js
 */

const { execSync } = require('child_process')
const path = require('path')

console.log("🧪 Running All QA Tests")
console.log("=" .repeat(70))
console.log()

const tests = [
  { name: "Voice Response Collection", file: "test-voice-collection.js" },
  { name: "Profile Formatting", file: "test-profile-formatting.js" },
  { name: "JSON Parsing Edge Cases", file: "test-json-parsing.js" },
  { name: "Full Data Flow", file: "test-full-flow.js" },
  { name: "Lambda Response Parsing", file: "test-lambda-response-parsing.js" }
]

let totalPassed = 0
let totalFailed = 0

tests.forEach((test, index) => {
  console.log(`\n${"=".repeat(70)}`)
  console.log(`Test ${index + 1}/${tests.length}: ${test.name}`)
  console.log("=".repeat(70))
  
  try {
    const testPath = path.join(__dirname, test.file)
    execSync(`node "${testPath}"`, { 
      stdio: 'inherit',
      cwd: __dirname 
    })
    totalPassed++
    console.log(`\n✅ ${test.name}: PASSED`)
  } catch (error) {
    totalFailed++
    console.log(`\n❌ ${test.name}: FAILED`)
    if (error.message) {
      console.log(`   Error: ${error.message}`)
    }
  }
})

console.log("\n" + "=".repeat(70))
console.log("📊 Final Summary")
console.log("=".repeat(70))
console.log(`   Total Tests: ${tests.length}`)
console.log(`   Passed: ${totalPassed} ✅`)
console.log(`   Failed: ${totalFailed} ${totalFailed > 0 ? "❌" : ""}`)
console.log(`   Success Rate: ${((totalPassed / tests.length) * 100).toFixed(1)}%`)
console.log("=".repeat(70))

if (totalFailed === 0) {
  console.log("\n🎉 All tests passed!")
  process.exit(0)
} else {
  console.log(`\n⚠️  ${totalFailed} test suite(s) failed.`)
  process.exit(1)
}
