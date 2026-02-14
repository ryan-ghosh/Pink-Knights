# Setup Instructions

## 1. Configure API Gateway URL

Create a `.env.local` file in the `dating-app-design` directory:

```env
NEXT_PUBLIC_API_GATEWAY_URL=https://33khcxehd2.execute-api.us-east-1.amazonaws.com/default/columbiahacks
```

**Important:** The URL is NOT hardcoded - it must be set in the environment variable. This allows you to:
- Use different endpoints for development/production
- Change the endpoint without modifying code
- Keep sensitive URLs out of version control

## 2. How It Works

### Data Collection Flow:

1. **Signup Form** → Collects all profile information (name, age, location, job, etc.)
2. **Voice Agent** → Collects voice responses to AI prompts using Web Speech API
3. **API Submission** → Combines form data + voice transcript into a profile description
4. **API Response** → Receives compatibility score, summary, and meta data
5. **Profile Result** → Displays the API response to the user

### API Payload Format:

The code automatically formats the data as:
```json
{
  "user_partner_profile": "Combined natural language description from form and voice"
}
```

### API Response Format:

Your API should return:
```json
{
  "score": 87,
  "summary": "The date started strong...",
  "meta": {
    "compatibility_factors": {
      "shared_interests": "hiking, indie music, coffee culture",
      "humor_alignment": "good but not perfect",
      "lifestyle_match": "high",
      "conversation_ease": "very good"
    },
    "potential_concerns": "slight differences in humor style...",
    "candidate_profile": "I'm a freelance graphic designer..."
  }
}
```

## 3. Testing

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Fill out the signup form** with all required fields

3. **Complete the voice agent** by responding to prompts (or skip)

4. **Check the browser console** for:
   - Form data being collected
   - Voice transcript
   - API request/response
   - Any errors

5. **Verify API call:**
   - Open browser DevTools → Network tab
   - Look for POST request to your API Gateway URL
   - Check the request payload and response

## 4. Troubleshooting

### "API Gateway URL not configured"
- Make sure `.env.local` exists in `dating-app-design/` directory
- Check that `NEXT_PUBLIC_API_GATEWAY_URL` is set correctly
- Restart the dev server after adding/changing `.env.local`

### Voice recognition not working
- Ensure you're on HTTPS or localhost
- Grant microphone permissions when prompted
- Use Chrome or Edge for best support

### API request fails
- Check the API Gateway URL is correct
- Verify CORS is enabled on your API Gateway
- Check browser console for error details
- Test the endpoint with curl to verify it works

## 5. Code Structure

- `app/page.tsx` - Main app flow, collects data and sends to API
- `components/signup/signup-form.tsx` - Collects form data
- `components/voice-agent-view.tsx` - Collects voice input using Web Speech API
- `lib/lambda-client.ts` - Handles API communication
- `hooks/use-speech-recognition.ts` - Web Speech API hook

## 6. Customization

### Change Profile Description Format

Edit `formatProfileDescription()` in `lib/lambda-client.ts` to customize how form data is converted to text.

### Change API Endpoint

Update `NEXT_PUBLIC_API_GATEWAY_URL` in `.env.local` - no code changes needed!

### Modify Voice Prompts

Edit `AI_PROMPTS` array in `components/voice-agent-view.tsx`
