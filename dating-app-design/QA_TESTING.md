# QA Testing Guide

This document describes the comprehensive test suite for the dating app's voice-to-text and API integration features.

## Test Suite Overview

The QA test suite includes 4 main test scripts that verify different aspects of the application:

1. **Voice Response Collection** - Tests voice response gathering and combination
2. **Profile Formatting** - Tests form data + voice transcript formatting
3. **JSON Parsing Edge Cases** - Tests various Lambda response formats
4. **Full Data Flow** - Tests end-to-end data flow

## Running Tests

### Run All Tests
```bash
npm run test:all
```

### Run Individual Tests
```bash
# Test voice response collection
npm run test:voice

# Test profile formatting
npm run test:formatting

# Test JSON parsing
npm run test:parsing

# Test full data flow
npm run test:flow
```

## Test Details

### 1. Voice Response Collection (`test-voice-collection.js`)

**Purpose**: Verifies that voice responses are properly collected, deduplicated, and combined.

**Tests**:
- ✅ Response collection from multiple prompts
- ✅ Duplicate prevention
- ✅ Empty response filtering
- ✅ Final combined output validation

**Expected Behavior**:
- Each voice response is collected into an array
- Duplicates are prevented
- Empty responses are filtered out
- All responses are joined with spaces

**Example Output**:
```
✅ Response 1 collected: "I love hiking..."
✅ Response 2 collected: "Honesty is important..."
✅ Response 3 collected: "Dishonesty is a dealbreaker"

Combined: "I love hiking... Honesty is important... Dishonesty is a dealbreaker"
```

### 2. Profile Formatting (`test-profile-formatting.js`)

**Purpose**: Verifies that form data and voice transcript are properly combined into a natural language profile description.

**Tests**:
- ✅ Full profile formatting with all fields
- ✅ Voice transcript inclusion
- ✅ Form data inclusion (age, location, job, education, etc.)
- ✅ Empty voice transcript handling
- ✅ Minimal form data handling
- ✅ Payload format validation

**Expected Behavior**:
- Voice transcript appears first in the formatted profile
- All form fields are included in natural language
- Profile is formatted as a readable string
- Payload has correct `user_partner_profile` structure

**Example Output**:
```
Formatted Profile:
"I love hiking... 28 years old, lives in San Francisco, CA. Works as a Software Engineer..."
```

### 3. JSON Parsing Edge Cases (`test-json-parsing.js`)

**Purpose**: Tests the robust JSON parsing logic that handles various Lambda/API Gateway response formats.

**Test Cases**:
1. ✅ Direct JSON response
2. ✅ API Gateway wrapped (with `body` field)
3. ✅ Response with extra text before JSON
4. ✅ Response with extra text after JSON
5. ✅ Multiple JSON objects (extracts first valid)
6. ✅ JSON with markdown code blocks

**Parsing Strategies**:
- Direct JSON parsing
- Body field extraction
- Regex extraction
- Brace matching
- Markdown cleanup

**Expected Behavior**:
- All response formats are successfully parsed
- First valid JSON object is extracted
- Extra text is ignored
- Score and other fields are correctly extracted

### 4. Full Data Flow (`test-full-flow.js`)

**Purpose**: Tests the complete end-to-end flow from voice collection → formatting → API payload → response validation.

**Flow Steps**:
1. ✅ Voice responses collected
2. ✅ Profile formatted (form data + voice)
3. ✅ API payload created
4. ✅ Lambda response structure validated

**Expected Behavior**:
- Voice responses are collected correctly
- Profile includes both form data and voice
- Payload has correct structure
- Response has all required fields (score, summary, meta)

## Test Results

All tests are currently **PASSING** ✅

```
Total Tests: 4
Passed: 4 ✅
Failed: 0
Success Rate: 100.0%
```

## What These Tests Verify

### ✅ Voice Response Collection
- Multiple voice responses are collected
- Responses are deduplicated
- Empty responses are filtered
- Final transcript is properly combined

### ✅ Profile Formatting
- Voice transcript is included
- All form fields are included
- Natural language formatting works
- Edge cases (empty voice, minimal data) are handled

### ✅ JSON Parsing
- Handles direct JSON responses
- Handles API Gateway wrapped responses
- Extracts JSON from responses with extra text
- Handles multiple JSON objects
- Cleans markdown code blocks

### ✅ Full Data Flow
- Complete flow from voice → format → API → response
- All data is preserved through the flow
- Response structure matches expectations

## Continuous Testing

These tests should be run:
- Before deploying to production
- After making changes to voice collection logic
- After modifying profile formatting
- After updating API integration code
- When debugging issues with data flow

## Debugging Failed Tests

If a test fails:

1. **Check the test output** - It will show which specific check failed
2. **Review the test script** - Look at the test logic in `scripts/`
3. **Compare expected vs actual** - The output shows what was expected vs what was received
4. **Check related code** - Review the actual implementation in:
   - `components/voice-agent-view.tsx` (voice collection)
   - `lib/lambda-client.ts` (profile formatting)
   - `app/api/submit-form/route.ts` (JSON parsing)

## Adding New Tests

To add a new test:

1. Create a new test file in `scripts/test-*.js`
2. Follow the pattern of existing tests
3. Add a script to `package.json`
4. Add it to `run-all-tests.js`
5. Run `npm run test:all` to verify

## Notes

- Tests use mock data to simulate real scenarios
- Tests don't require a running server or Lambda function
- Tests verify logic and data flow, not actual API calls
- For integration testing with real APIs, use the development server
