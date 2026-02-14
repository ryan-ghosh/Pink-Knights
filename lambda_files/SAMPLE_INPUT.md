# Sample Input for Lambda Function

## Expected Input Format

The Lambda function expects a JSON payload with this structure:

```json
{
  "user_partner_profile": "A natural language description combining form data and voice transcript"
}
```

## Sample Input 1: Complete Profile

```json
{
  "user_partner_profile": "I'm a 28-year-old software engineer living in San Francisco, CA, from Seattle, WA, 6'0\" tall, looking for long-term relationship, somewhat religious (christian). Works as a Software Engineer at Tech Corp. Has a Bachelor's degree. non-smoker, drinks: socially. wants children: yes. I love hiking and spending time outdoors on weekends. Honesty and good communication are most important to me. Dishonesty and lack of respect are dealbreakers."
}
```

## Sample Input 2: Minimal Profile

```json
{
  "user_partner_profile": "25 years old, lives in New York, NY. Works as a teacher. I enjoy reading and cooking. Looking for someone kind and adventurous."
}
```

## Sample Input 3: Voice-Heavy Profile

```json
{
  "user_partner_profile": "I love hiking and spending time outdoors on weekends. Honesty and good communication are most important to me. Dishonesty and lack of respect are dealbreakers. 28 years old, lives in San Francisco, CA. Works as a Software Engineer."
}
```

## Testing with cURL

```bash
curl -X POST "https://33khcxehd2.execute-api.us-east-1.amazonaws.com/default/columbiahacks" \
  -H "Content-Type: application/json" \
  -d '{
    "user_partner_profile": "I'\''m a 28-year-old software engineer living in San Francisco. I love hiking, indie music, and spending weekends exploring coffee shops. I value honesty, good communication, and someone who can make me laugh. I'\''m looking for a long-term relationship with someone who shares my love for the outdoors and appreciates dry humor."
  }'
```

## What the Lambda Does

1. **Receives** `user_partner_profile` from the request body
2. **Model 1**: Generates a candidate profile based on the user's profile
3. **Model 2**: Simulates a date between the user and candidate
4. **Returns** JSON with:
   - `score`: Compatibility score (1-100)
   - `summary`: Date simulation summary
   - `meta.compatibility_factors`: Shared interests, humor, lifestyle, conversation
   - `meta.potential_concerns`: Any concerns or friction points
   - `meta.candidate_profile`: The generated candidate profile

## Common Issues

### Issue: "Unable to simulate date due to missing profile information"

**Cause**: The `user_partner_profile` is empty, too short, or not being passed correctly.

**Solution**: 
1. Check CloudWatch logs to see what was received
2. Verify the profile description is at least 50+ characters
3. Ensure the payload structure is correct: `{"user_partner_profile": "..."}`

### Issue: Empty or placeholder profile

**Cause**: Form data or voice transcript might be empty.

**Solution**: 
1. Check frontend logs to see what's being sent
2. Verify form data is being collected
3. Verify voice transcript is being captured

## Debugging

Check CloudWatch logs for:
- `Event body type`: Should be `<class 'str'>`
- `Parsed body type`: Should be `<class 'dict'>`
- `Body keys`: Should include `['user_partner_profile']`
- `user_partner_profile length`: Should be > 0
- `user_partner_profile (full)`: Should show the actual profile text
