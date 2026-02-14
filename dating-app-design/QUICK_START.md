# Quick Start: Voice-to-Text Setup

## What is a Lambda URL?

A **Lambda URL** is an HTTPS endpoint that triggers your AWS Lambda function. Think of it as a web address where you can send data to your serverless code.

**Example:** `https://abc123.lambda-url.us-east-1.on.aws/`

## You Have 3 Options:

### ✅ Option 1: Use Next.js API Route (Easiest - Already Set Up!)

**No AWS needed!** I've already created a Next.js API route for you.

**What to do:**
- **Nothing!** It's already set up at `/api/submit-form`
- Just use the code - it will automatically use this endpoint
- No configuration needed

**How it works:**
- Frontend sends data → Next.js API route (`/app/api/submit-form/route.ts`)
- You can add your processing logic there (save to database, etc.)

### Option 2: Use AWS Lambda (If You Have AWS)

**If you already have a Lambda function:**
1. Go to AWS Console → Lambda
2. Click your function → Configuration → Function URL
3. Create Function URL
4. Copy the URL
5. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_LAMBDA_URL=https://your-lambda-url.lambda-url.us-east-1.on.aws/
   ```

**If you need to create a Lambda:**
- See `LAMBDA_SETUP_GUIDE.md` for detailed instructions

### Option 3: Use Any Backend API

You can use **any backend** (Express, Flask, Rails, etc.):

1. Create an endpoint that accepts:
   ```json
   {
     "form_data": {...},
     "voice_transcript": "..."
   }
   ```

2. Add the URL to `.env.local`:
   ```env
   NEXT_PUBLIC_LAMBDA_URL=https://your-backend-api.com/submit
   ```

## How to Use (All Options)

The code automatically detects which option you're using:

```tsx
import { sendToBackend } from "@/lib/lambda-client"

// Automatically uses:
// 1. NEXT_PUBLIC_LAMBDA_URL if set in .env.local
// 2. Next.js API route (/api/submit-form) if not set
const result = await sendToBackend(formData, voiceTranscript)
```

## Testing

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Test the voice input:**
   - Click the microphone button
   - Speak something
   - See the transcript appear

3. **Submit the form:**
   - Fill in the form
   - Click submit
   - Check the browser console and server logs

## Summary

- **Lambda URL** = Web address for your AWS Lambda function
- **Easiest option** = Use the Next.js API route (already set up!)
- **No setup needed** = Just start using it!

The code is ready to use right now with the Next.js API route. You can switch to Lambda later if needed!
