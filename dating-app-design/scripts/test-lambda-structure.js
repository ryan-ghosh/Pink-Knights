/**
 * Lambda Function Structure Verification
 * 
 * Verifies that the Lambda function has all required components:
 * - Proper error handling
 * - JSON parsing with fallbacks
 * - Profile validation
 * - Response structure
 */

const fs = require('fs');
const path = require('path');

const lambdaPath = path.join(__dirname, '../../lambda_files/lambda_function.py');

console.log("🔍 LAMBDA FUNCTION STRUCTURE VERIFICATION");
console.log("=".repeat(80));

if (!fs.existsSync(lambdaPath)) {
  console.error("❌ Lambda function file not found:", lambdaPath);
  process.exit(1);
}

const lambdaCode = fs.readFileSync(lambdaPath, 'utf8');

const checks = [
  {
    name: "JSON parsing with None handling",
    pattern: /if event_body is None:/,
    required: true
  },
  {
    name: "JSON parsing with string handling",
    pattern: /isinstance\(event_body, str\)/,
    required: true
  },
  {
    name: "JSON parsing with dict handling",
    pattern: /isinstance\(event_body, dict\)/,
    required: true
  },
  {
    name: "Profile validation (min length check)",
    pattern: /len\(user_partner_profile\.strip\(\)\) < 10/,
    required: true
  },
  {
    name: "Model 1: Candidate profile generation",
    pattern: /MODEL 1: GENERATE THE CANDIDATE PROFILE/,
    required: true
  },
  {
    name: "Model 2: Date simulation",
    pattern: /MODEL 2: SIMULATE THE DATE/,
    required: true
  },
  {
    name: "JSON extraction from AI response",
    pattern: /first_brace = response_text\.find\('{'\)/,
    required: true
  },
  {
    name: "Meta structure initialization",
    pattern: /if 'meta' not in final_simulation_data:/,
    required: true
  },
  {
    name: "Candidate profile in meta",
    pattern: /final_simulation_data\['meta'\]\['candidate_profile'\]/,
    required: true
  },
  {
    name: "Compatibility factors initialization",
    pattern: /if 'compatibility_factors' not in final_simulation_data\['meta'\]:/,
    required: true
  },
  {
    name: "Potential concerns initialization",
    pattern: /if 'potential_concerns' not in final_simulation_data\['meta'\]:/,
    required: true
  },
  {
    name: "Error handling with JSONDecodeError",
    pattern: /except json\.JSONDecodeError/,
    required: true
  },
  {
    name: "General exception handling",
    pattern: /except Exception as e:/,
    required: true
  },
  {
    name: "CORS headers in response",
    pattern: /Access-Control-Allow-Origin/,
    required: true
  },
  {
    name: "Clean JSON response body",
    pattern: /json\.dumps\(final_simulation_data/,
    required: true
  }
];

console.log("\n📋 Checking Lambda Function Components:\n");

let passed = 0;
let failed = 0;

checks.forEach((check, index) => {
  const found = check.pattern.test(lambdaCode);
  const status = found ? "✅" : (check.required ? "❌" : "⚠️ ");
  const result = found ? "FOUND" : (check.required ? "MISSING (REQUIRED)" : "MISSING (OPTIONAL)");
  
  console.log(`${status} ${index + 1}. ${check.name}: ${result}`);
  
  if (found) {
    passed++;
  } else if (check.required) {
    failed++;
  }
});

console.log("\n" + "=".repeat(80));
console.log("📊 VERIFICATION SUMMARY");
console.log("=".repeat(80));
console.log(`   Total Checks: ${checks.length}`);
console.log(`   Passed: ${passed} ✅`);
console.log(`   Failed: ${failed} ${failed > 0 ? "❌" : ""}`);
console.log(`   Success Rate: ${((passed / checks.length) * 100).toFixed(1)}%`);
console.log("=".repeat(80));

// Additional checks
console.log("\n📋 Additional Structure Checks:\n");

// Check for proper response structure
const hasResponseStructure = 
  lambdaCode.includes('"statusCode": 200') &&
  lambdaCode.includes('"Content-Type": "application/json"') &&
  lambdaCode.includes('final_simulation_data');

console.log(`${hasResponseStructure ? "✅" : "❌"} Response structure: ${hasResponseStructure ? "CORRECT" : "INCORRECT"}`);

// Check for proper error responses
const hasErrorHandling = 
  lambdaCode.includes('"statusCode": 400') &&
  lambdaCode.includes('"statusCode": 500');

console.log(`${hasErrorHandling ? "✅" : "❌"} Error handling: ${hasErrorHandling ? "COMPLETE" : "INCOMPLETE"}`);

// Check for logging
const hasLogging = 
  lambdaCode.includes('print(') &&
  lambdaCode.includes('user_partner_profile');

console.log(`${hasLogging ? "✅" : "⚠️ "} Debug logging: ${hasLogging ? "PRESENT" : "MINIMAL"}`);

if (failed === 0 && hasResponseStructure && hasErrorHandling) {
  console.log("\n🎉 Lambda function structure is correct!");
  console.log("\n✅ All required components present");
  console.log("✅ Error handling complete");
  console.log("✅ Response structure correct");
  console.log("✅ Profile validation implemented");
} else {
  console.log(`\n⚠️  ${failed} required component(s) missing. Review the issues above.`);
  process.exit(1);
}
