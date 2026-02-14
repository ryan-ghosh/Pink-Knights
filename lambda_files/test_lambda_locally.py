"""
Test script to test Lambda function locally with sample input
Run this to verify the Lambda function works correctly
"""

import json
from lambda_function import lambda_handler

# Sample event that mimics API Gateway
sample_event = {
    "body": json.dumps({
        "user_partner_profile": "I'm a 28-year-old software engineer living in San Francisco. I love hiking, indie music, and spending weekends exploring coffee shops. I value honesty, good communication, and someone who can make me laugh. I'm looking for a long-term relationship with someone who shares my love for the outdoors and appreciates dry humor. I work as a Software Engineer at Tech Corp and have a Bachelor's degree. I'm a non-smoker, drink socially, and am politically moderate. I want children in the future and am somewhat religious (Christian)."
    })
}

# Sample context (minimal, not used by our function)
class MockContext:
    pass

context = MockContext()

print("=" * 80)
print("🧪 Testing Lambda Function Locally")
print("=" * 80)
print("\n📥 Input Event:")
print(json.dumps(sample_event, indent=2))
print("\n🚀 Running Lambda Handler...\n")

try:
    result = lambda_handler(sample_event, context)
    
    print("=" * 80)
    print("✅ Lambda Response:")
    print("=" * 80)
    print(f"Status Code: {result['statusCode']}")
    print(f"Headers: {result.get('headers', {})}")
    
    if result['statusCode'] == 200:
        response_body = json.loads(result['body'])
        print("\n📊 Response Body:")
        print(json.dumps(response_body, indent=2))
        
        # Validate structure
        print("\n🔍 Validation:")
        has_score = 'score' in response_body
        has_summary = 'summary' in response_body
        has_meta = 'meta' in response_body
        
        print(f"  ✅ Has score: {has_score} (value: {response_body.get('score', 'N/A')})")
        print(f"  ✅ Has summary: {has_summary} (length: {len(response_body.get('summary', ''))} chars)")
        print(f"  ✅ Has meta: {has_meta}")
        
        if has_meta:
            meta = response_body['meta']
            print(f"  ✅ Has compatibility_factors: {'compatibility_factors' in meta}")
            print(f"  ✅ Has potential_concerns: {'potential_concerns' in meta}")
            print(f"  ✅ Has candidate_profile: {'candidate_profile' in meta}")
    else:
        print(f"\n❌ Error Response:")
        print(result['body'])
        
except Exception as e:
    print(f"\n❌ Error running Lambda: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 80)
