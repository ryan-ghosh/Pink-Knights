# Testing Guide

## ✅ API Endpoint Verified

Your API Gateway endpoint is working correctly! Test response received:
- **Status**: ✅ Working
- **Response Format**: Correct (score, summary, candidate_profile)
- **URL**: `https://33khcxehd2.execute-api.us-east-1.amazonaws.com/default/columbiahacks`

## 🧪 How to Test the Full Flow

### 1. Start the Dev Server (if not running)

```bash
cd dating-app-design
npm run dev
```

The app will be available at: **http://localhost:3000**

### 2. Test the Complete Flow

#### Step 1: Fill Out Signup Form
- Navigate to http://localhost:3000
- Fill in all required fields:
  - First Name
  - Age
  - Gender
  - Sexual Orientation
  - Location
  - Height
  - Religion
  - Looking For
  - Education
  - Job Title
  - Smoking/Drinking preferences
  - Politics
  - Religion Importance
  - Want/Have Children
- Click "Get Started" when complete

#### Step 2: Voice Agent (Optional)
- The AI (Hailey) will ask you questions
- Click the microphone button to start recording
- Speak your responses
- Click the microphone again to stop and move to next question
- Or click "Skip" to skip voice input

#### Step 3: API Submission
- After voice agent completes, the app automatically:
  1. Combines form data + voice transcript
  2. Formats it as `user_partner_profile`
  3. Sends POST request to your API Gateway
  4. Displays the response (score, summary, meta)

### 3. Check Browser Console

Open DevTools (F12 or Cmd+Option+I) and check:

**Console Tab:**
- Look for: `📤 Sending to API Gateway: ...`
- Look for: `📝 Profile description: ...`
- Check for any errors

**Network Tab:**
- Filter by "columbiahacks" or "execute-api"
- Find the POST request
- Check:
  - Request payload (should have `user_partner_profile`)
  - Response (should have `score`, `summary`, `meta`)

### 4. Expected Behavior

✅ **Success Flow:**
1. Form data collected
2. Voice transcript collected (or empty if skipped)
3. Data sent to API
4. Response received and displayed
5. Profile result page shows:
   - Compatibility Score (0-100)
   - Summary text
   - Compatibility Factors
   - Potential Concerns (if any)

❌ **Error Handling:**
- If API URL not configured: Error message shown
- If API request fails: Error displayed in UI
- If voice not supported: Fallback to text-only

### 5. Test Scenarios

#### Scenario 1: Full Flow with Voice
1. Complete signup form
2. Answer all voice prompts
3. Verify API receives combined data
4. Check response display

#### Scenario 2: Skip Voice Input
1. Complete signup form
2. Click "Skip" on voice agent
3. Verify API receives form data only
4. Check response display

#### Scenario 3: Test API Directly
```bash
curl -X POST "https://33khcxehd2.execute-api.us-east-1.amazonaws.com/default/columbiahacks" \
  -H "Content-Type: application/json" \
  -d '{"user_partner_profile": "Test profile description"}'
```

### 6. Debugging

**If API request fails:**
1. Check `.env.local` exists and has correct URL
2. Restart dev server after changing `.env.local`
3. Check browser console for error details
4. Verify CORS is enabled on API Gateway

**If voice recognition doesn't work:**
1. Ensure you're on HTTPS or localhost
2. Grant microphone permissions
3. Use Chrome or Edge browser
4. Check browser console for errors

**If form data not collected:**
1. Verify all required fields are filled
2. Check browser console for validation errors
3. Look for `canSubmit()` function output

### 7. Expected API Request

The app sends:
```json
{
  "user_partner_profile": "I love hiking and coffee. Works as a Software Engineer. Lives in New York. Looking for long-term relationship. drinks socially, politically liberal."
}
```

### 8. Expected API Response

Your API returns:
```json
{
  "score": 87,
  "summary": "The date started strong...",
  "meta": {
    "compatibility_factors": {...},
    "potential_concerns": "...",
    "candidate_profile": "..."
  }
}
```

## 🎯 Quick Test Checklist

- [ ] Dev server running on http://localhost:3000
- [ ] `.env.local` file exists with API Gateway URL
- [ ] Can fill out signup form completely
- [ ] Voice agent prompts appear (or can skip)
- [ ] API request appears in Network tab
- [ ] API response received successfully
- [ ] Profile result page displays score and summary
- [ ] No errors in browser console

## 📝 Notes

- The API URL is **NOT hardcoded** - it comes from `.env.local`
- Voice input uses Web Speech API (free, browser-native)
- Form data and voice transcript are automatically combined
- All data is sent in a single API call
- Response is displayed in a user-friendly format
