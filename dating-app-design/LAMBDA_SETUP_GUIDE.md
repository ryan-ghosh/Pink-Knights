# Lambda URL Setup Guide

## What is a Lambda URL?

A **Lambda Function URL** is a simple HTTPS endpoint that directly invokes your AWS Lambda function. It's like having a web API endpoint that runs your serverless code.

**Example Lambda URL:**
```
https://abc123xyz.lambda-url.us-east-1.on.aws/
```

When you send a POST request to this URL with your JSON data, it triggers your Lambda function.

## Do You Already Have a Lambda Function?

### Option 1: You Already Have AWS Lambda Set Up

If you already have a Lambda function, you just need to add a Function URL to it:

1. Go to AWS Console → Lambda
2. Click on your function
3. Go to "Configuration" tab → "Function URL"
4. Click "Create function URL"
5. Choose:
   - **Auth type**: `NONE` (for public access) or `AWS_IAM` (for authenticated)
   - **CORS**: Enable if calling from browser
6. Click "Save"
7. Copy the Function URL (looks like: `https://abc123.lambda-url.us-east-1.on.aws/`)

### Option 2: You Don't Have Lambda Yet (Quick Setup)

If you don't have AWS Lambda set up, here are your options:

#### A. Create a Simple Lambda Function (Recommended)

**Step 1: Create Lambda Function in AWS Console**

1. Go to [AWS Lambda Console](https://console.aws.amazon.com/lambda/)
2. Click "Create function"
3. Choose "Author from scratch"
4. Name it: `pink-knights-form-handler`
5. Runtime: Choose `Python 3.12` or `Node.js 20.x`
6. Click "Create function"

**Step 2: Add Function Code**

**For Python:**
```python
import json

def lambda_handler(event, context):
    # Parse the request body
    body = json.loads(event.get('body', '{}'))
    
    form_data = body.get('form_data', {})
    voice_transcript = body.get('voice_transcript', '')
    
    # Your processing logic here
    print(f"Received form data: {form_data}")
    print(f"Received voice transcript: {voice_transcript}")
    
    # Example: Save to database, process with AI, etc.
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',  # For CORS
        },
        'body': json.dumps({
            'success': True,
            'message': 'Data received successfully',
            'form_data': form_data,
            'voice_transcript': voice_transcript
        })
    }
```

**For Node.js:**
```javascript
exports.handler = async (event) => {
    const body = JSON.parse(event.body || '{}');
    
    const formData = body.form_data || {};
    const voiceTranscript = body.voice_transcript || '';
    
    console.log('Received form data:', formData);
    console.log('Received voice transcript:', voiceTranscript);
    
    // Your processing logic here
    
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',  // For CORS
        },
        body: JSON.stringify({
            success: true,
            message: 'Data received successfully',
            form_data: formData,
            voice_transcript: voiceTranscript
        })
    };
};
```

**Step 3: Add Function URL**

1. In your Lambda function, go to "Configuration" → "Function URL"
2. Click "Create function URL"
3. Auth type: `NONE` (or `AWS_IAM` if you want security)
4. CORS: Enable it
5. Click "Save"
6. **Copy the Function URL** - this is what you'll use in your frontend!

**Step 4: Add to Your Frontend**

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_LAMBDA_URL=https://your-actual-lambda-url.lambda-url.us-east-1.on.aws/
```

#### B. Use a Next.js API Route Instead (No AWS Needed)

If you don't want to use AWS Lambda, you can create a Next.js API route:

**Create `app/api/submit-form/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const formData = body.form_data
    const voiceTranscript = body.voice_transcript
    
    console.log('Form data:', formData)
    console.log('Voice transcript:', voiceTranscript)
    
    // Your processing logic here
    // e.g., save to database, call external API, etc.
    
    return NextResponse.json({
      success: true,
      message: 'Data received successfully',
      form_data: formData,
      voice_transcript: voiceTranscript
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    )
  }
}
```

Then update `lib/lambda-client.ts` to use your API route:

```typescript
export async function sendToLambda(
  formData: Record<string, any>,
  voiceTranscript: string
): Promise<LambdaResponse> {
  // Use Next.js API route instead
  return sendToLambda('/api/submit-form', formData, voiceTranscript)
}
```

#### C. Use Any Backend API Endpoint

You can use **any backend** that accepts POST requests:

- **Express.js server**
- **Flask/FastAPI (Python)**
- **Rails (Ruby)**
- **Any REST API**

Just make sure it:
1. Accepts POST requests
2. Expects JSON with `form_data` and `voice_transcript`
3. Has CORS enabled (if calling from browser)

## Quick Start: Using Next.js API Route (Easiest)

If you want to get started **right now** without AWS, here's the simplest approach:

1. **Create the API route** (see Option B above)
2. **Update the client** to use the API route instead of Lambda URL
3. **No AWS setup needed!**

Let me know if you want me to set this up for you!

## Testing Your Lambda/API Endpoint

You can test with curl:

```bash
curl -X POST https://your-lambda-url.lambda-url.us-east-1.on.aws/ \
  -H "Content-Type: application/json" \
  -d '{
    "form_data": {"firstName": "John", "age": "28"},
    "voice_transcript": "I love hiking"
  }'
```

Or use Postman/Insomnia to test the endpoint.

## Security Considerations

1. **For Production**: Use `AWS_IAM` auth type and add proper authentication
2. **CORS**: Configure allowed origins properly
3. **Rate Limiting**: Add rate limiting to prevent abuse
4. **Input Validation**: Validate and sanitize all inputs

## Summary

- **Lambda URL** = HTTPS endpoint that triggers your AWS Lambda function
- **If you have Lambda**: Just add a Function URL in AWS Console
- **If you don't have Lambda**: 
  - Create one in AWS (Option A)
  - Or use Next.js API route (Option B - easier!)
  - Or use any backend API (Option C)

The frontend code I created works with **any** of these options - just change the URL!
