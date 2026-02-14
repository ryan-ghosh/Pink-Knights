# Lambda Response Parsing Tests

## Overview

This test suite verifies that the API route (`app/api/submit-form/route.ts`) correctly parses Lambda function responses regardless of the response format.

## Test Coverage

The tests cover 8 different Lambda response formats:

1. **Standard Lambda Proxy Format** - `{ statusCode: 200, body: "..." }`
2. **Direct JSON Response** - `{ score: 87, summary: "...", meta: {...} }`
3. **Lambda Response with Extra Text** - Text before/after JSON
4. **Lambda Response with Escaped JSON in Body** - Properly escaped JSON strings
5. **API Gateway Wrapped Response** - Full API Gateway format
6. **Response with Only Body Field** - `{ body: "..." }` without statusCode
7. **Empty Response** - `{}` (should fail gracefully)
8. **Response with Extra Whitespace** - Whitespace before/after JSON

## Running Tests

```bash
# Run Lambda response parsing tests only
npm run test:lambda

# Run all tests (including Lambda response tests)
npm run test:all
```

## Test Results

All 8 test cases pass with 100% success rate.

## What Gets Tested

Each test verifies:
- ✅ Response is correctly parsed
- ✅ `score` field is present and correct
- ✅ `summary` field is present
- ✅ `meta` field is present (when applicable)
- ✅ Edge cases are handled gracefully

## Parsing Strategies

The API route uses multiple parsing strategies:

1. **Strategy 1**: Direct JSON parse of entire response
2. **Strategy 2**: Extract and parse `body` field from Lambda proxy format
3. **Strategy 2b**: Handle `body` field without `statusCode`
4. **Strategy 4**: Extract JSON from text with extra content
5. **Strategy 5**: Brace matching for complex nested structures

## Expected Lambda Response Format

The Lambda function should return:
```json
{
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  },
  "body": "{\"score\": 87, \"summary\": \"...\", \"meta\": {...}}"
}
```

The API route will extract the `body` field and parse it to get:
```json
{
  "score": 87,
  "summary": "...",
  "meta": {
    "compatibility_factors": {...},
    "potential_concerns": "...",
    "candidate_profile": "..."
  }
}
```

## Troubleshooting

If tests fail, check:
1. Lambda function is returning the correct format
2. API route parsing logic matches the test logic
3. Response has proper JSON structure
4. No extra text or formatting issues
