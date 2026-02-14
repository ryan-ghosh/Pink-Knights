# API Integration - Your API Gateway Endpoint

## Your Endpoint

Your API Gateway endpoint is already configured:
```
https://33khcxehd2.execute-api.us-east-1.amazonaws.com/default/columbiahacks
```

## How It Works

The code automatically:
1. ✅ Combines form data and voice transcript into a natural language description
2. ✅ Sends it in the format your API expects: `{ "user_partner_profile": "..." }`
3. ✅ Uses your API Gateway endpoint by default

## Example Payload

When you call `sendToBackend(formData, voiceTranscript)`, it sends:

```json
{
  "user_partner_profile": "I love hiking and coffee. Looking for someone adventurous. Works as a Software Engineer at Google. Has a Bachelor's. Lives in New York. Looking for long-term relationship. drinks socially, politically liberal."
}
```

The description combines:
- **Voice transcript** (most natural/personal) - e.g., "I love hiking and coffee"
- **Form fields** (structured data) - e.g., job, education, location, lifestyle

## Usage

```tsx
import { sendToBackend } from "@/lib/lambda-client"

// In your form submission handler
const result = await sendToBackend(formData, voiceTranscript)

if (result.success) {
  console.log("✅ Success!", result.data)
} else {
  console.error("❌ Error:", result.message)
}
```

## Testing

You can test with curl (same format the code uses):

```bash
curl -X POST "https://33khcxehd2.execute-api.us-east-1.amazonaws.com/default/columbiahacks" \
  -H "Content-Type: application/json" \
  -d '{
    "user_partner_profile": "Loves hiking, indie music, and dry humor. Works in tech but hates talking about it off the clock."
  }'
```

## Customizing the Profile Description

The `formatProfileDescription()` function in `lib/lambda-client.ts` controls how form data is converted to text. You can customize it to:

- Change the order of information
- Add/remove fields
- Change the formatting style
- Add custom logic

## Overriding the Endpoint

If you need to use a different endpoint, set it in `.env.local`:

```env
NEXT_PUBLIC_LAMBDA_URL=https://your-custom-endpoint.com/api
```

Or pass it directly:

```tsx
await sendToBackend(formData, transcript, "https://custom-url.com/endpoint")
```
