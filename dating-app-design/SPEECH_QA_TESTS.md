# Speech Input QA Test Suite

This document describes the comprehensive QA test suite for speech input simulation and validation.

## Test Scripts

### 1. `test-speech-simulation.js`
**Purpose**: Tests realistic speech input scenarios with various combinations of form data and voice responses.

**Test Cases**:
- ✅ Complete Profile - Rich Voice Responses (21 form fields + 3 detailed voice responses)
- ✅ Minimal Form - Rich Voice (3 form fields + 3 detailed voice responses)
- ✅ Rich Form - Short Voice (12 form fields + 3 brief voice responses)
- ✅ Very Short Responses (4 form fields + 3 minimal responses)
- ✅ Form Only - No Voice (12 form fields, no voice)
- ✅ Voice Heavy - Minimal Form (2 form fields + 3 extensive voice responses)

**Results**: 6/6 tests passed (100%)

### 2. `test-speech-edge-cases.js`
**Purpose**: Tests edge cases and boundary conditions for speech input.

**Edge Cases**:
- ✅ Single Word Responses (combined with form data)
- ✅ Very Long Responses (1327+ characters)
- ✅ Empty Voice Array (form data only)
- ✅ Special Characters in Voice (punctuation, symbols)
- ✅ Numbers in Voice Responses
- ✅ Mixed Case Responses (inconsistent capitalization)
- ✅ Whitespace Only Responses (filtered out correctly)
- ✅ Exactly 10 Characters (minimum threshold)
- ✅ Just Under 10 Characters (combined with form data)
- ✅ Multiple Short Responses (combined exceed minimum)

**Results**: 10/10 tests passed (100%)

### 3. `test-speech-integration.js`
**Purpose**: Tests the complete integration flow from voice collection to payload creation.

**Scenarios**:
- ✅ Realistic User Journey (complete form + detailed voice)
- ✅ Minimal Input Scenario (minimal form + moderate voice)
- ✅ Voice-Heavy Scenario (minimal form + extensive voice)

**Integration Steps Tested**:
1. Voice Response Collection
2. Profile Formatting
3. Profile Validation
4. Payload Creation
5. Final Integration Check

**Results**: 3/3 scenarios passed (100%)

## Running the Tests

### Run All Speech Tests
```bash
npm run test:speech              # Main simulation tests
npm run test:speech:edges        # Edge case tests
npm run test:speech:integration  # Integration tests
```

### Run All Tests
```bash
npm run test:all
```

## Test Coverage

### Voice Response Collection
- ✅ Multiple responses collected correctly
- ✅ Duplicate prevention
- ✅ Empty/whitespace filtering
- ✅ Response combination

### Profile Formatting
- ✅ Voice transcript included first
- ✅ Form data properly formatted
- ✅ Natural language combination
- ✅ All sections included (basic info, career, lifestyle, family)

### Validation
- ✅ Minimum length validation (10 characters)
- ✅ Empty profile detection
- ✅ Meaningful content check

### Payload Creation
- ✅ Correct JSON structure
- ✅ `user_partner_profile` field present
- ✅ Valid JSON format
- ✅ Size within limits

## Sample Test Output

```
🧪 QA Test: Speech Input Simulation
================================================================================

Test 1/6: Complete Profile - Rich Voice Responses
================================================================================
📋 Form Data Fields: 21
🎤 Voice Responses: 3
📝 Voice Transcript Length: 751 characters

🎤 Simulated Voice Responses:
   1. "I love hiking and spending time outdoors on weekends..."
   2. "Honesty and good communication are absolutely the most important..."
   3. "Dishonesty and lack of respect are definitely dealbreakers..."

📝 Formatted Profile Description:
   Length: 1054 characters
   Preview: "I love hiking and spending time outdoors on weekends..."

✅ Validation:
   - Has content: ✅ YES
   - Length >= 10: ✅ YES
   - Meets expected (200+): ✅ YES

📦 Payload:
   Size: 1082 bytes
   Valid JSON: ✅ YES

✅ TEST PASSED
```

## Key Findings

1. **Voice + Form Data Combination**: The system correctly combines voice responses with form data, ensuring profiles are meaningful even with minimal input.

2. **Validation Threshold**: The 10-character minimum is appropriate - it catches truly empty profiles while allowing minimal but valid input.

3. **Edge Case Handling**: 
   - Whitespace-only responses are correctly filtered
   - Special characters are handled properly
   - Numbers in voice are preserved
   - Mixed case is maintained

4. **Integration**: The complete flow from voice collection → formatting → validation → payload creation works correctly.

## Test Data Examples

### Rich Voice Response Example
```
"I love hiking and spending time outdoors on weekends. There's nothing better than getting up early on a Saturday morning, packing a backpack, and heading out to explore new trails. I've hiked all over California and I'm always looking for the next adventure."
```

### Minimal Voice Response Example
```
"I like reading. Honesty matters. No major dealbreakers."
```

### Form-Only Example
```
Form Data: {
  age: "30",
  location: "LA",
  jobTitle: "Engineer",
  education: "Bachelor's",
  lookingFor: "Relationship"
}
Result: "30 years old, lives in LA. Works as a Engineer. Has a Bachelor's. Looking for relationship."
```

## Continuous Testing

These tests should be run:
- Before deploying changes to voice collection logic
- After modifying profile formatting
- When updating validation rules
- As part of CI/CD pipeline

## Notes

- All tests simulate realistic user input scenarios
- Tests don't require a running server or Lambda function
- Tests verify logic and data flow, not actual API calls
- For integration testing with real APIs, use the development server
