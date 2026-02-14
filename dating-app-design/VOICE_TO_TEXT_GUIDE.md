# Voice-to-Text with Web Speech API - Implementation Guide

This guide explains how to implement voice-to-text conversion on the frontend using the browser's built-in Web Speech API and send both form data and voice transcript to your Lambda function.

## Overview

**Web Speech API Benefits:**
- ✅ **Completely free** - No API costs
- ✅ **Instant** - Real-time transcription
- ✅ **Zero backend setup** - Works entirely in the browser
- ✅ **No API keys needed** - Browser-native feature

## Browser Support

- ✅ Chrome/Edge (full support)
- ✅ Safari (with polyfill)
- ⚠️ Firefox (limited support)

## Step-by-Step Implementation

### 1. Use the Custom Hook

The `useSpeechRecognition` hook handles all the Web Speech API complexity:

```tsx
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"

const {
  transcript,        // Current transcript text
  isListening,       // Whether recording is active
  isSupported,       // Browser support check
  error,             // Any errors
  startListening,    // Start recording
  stopListening,     // Stop recording
  reset,             // Clear transcript
} = useSpeechRecognition({
  continuous: true,        // Keep listening after pause
  interimResults: true,    // Show partial results
  lang: "en-US",          // Language code
  onResult: (text, isFinal) => {
    // Called when new text is transcribed
    console.log("Transcript:", text, "Final:", isFinal)
  },
  onError: (error) => {
    // Handle errors
    console.error("Speech error:", error)
  },
})
```

### 2. Add Voice Input to Your Form

```tsx
function MyForm() {
  const [formData, setFormData] = useState({ name: "", age: "" })
  const { transcript, isListening, startListening, stopListening } = useSpeechRecognition()

  return (
    <div>
      {/* Regular form fields */}
      <input value={formData.name} onChange={...} />
      
      {/* Voice recording button */}
      <button onClick={isListening ? stopListening : startListening}>
        {isListening ? "Stop" : "Start"} Recording
      </button>
      
      {/* Show transcript */}
      <div>{transcript}</div>
    </div>
  )
}
```

### 3. Send to Lambda

When submitting the form, send both `form_data` and `voice_transcript`:

```tsx
import { sendToLambda } from "@/lib/lambda-client"

const handleSubmit = async () => {
  const result = await sendToLambda(
    "https://your-lambda-url.lambda-url.us-east-1.on.aws/",
    formData,           // Your form data object
    transcript.trim()    // The voice transcript
  )
  
  if (result.success) {
    console.log("Success!", result.data)
  }
}
```

### 4. Lambda Function Payload

Your Lambda will receive a JSON payload like this:

```json
{
  "form_data": {
    "firstName": "John",
    "age": "28",
    "location": "New York"
  },
  "voice_transcript": "I love hiking and coffee. Looking for someone adventurous."
}
```

### 5. Lambda Function Example (Python)

```python
import json

def lambda_handler(event, context):
    # Parse the payload
    body = json.loads(event['body'])
    
    form_data = body['form_data']
    voice_transcript = body['voice_transcript']
    
    # Process the data
    print(f"Form data: {form_data}")
    print(f"Voice transcript: {voice_transcript}")
    
    # Your business logic here
    # e.g., save to database, process with AI, etc.
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'success': True,
            'message': 'Data received successfully'
        })
    }
```

## Integration with Existing Signup Form

To integrate with your existing `SignupForm` component:

1. **Add voice recording state:**
```tsx
const { transcript, isListening, startListening, stopListening } = useSpeechRecognition()
```

2. **Add a voice input section** (can be on any step or a separate step)

3. **On form completion**, send to Lambda:
```tsx
const handleComplete = async () => {
  await sendToLambda(LAMBDA_URL, formData, transcript)
  onComplete?.()
}
```

## Environment Variables

Add your Lambda URL to `.env.local`:

```env
NEXT_PUBLIC_LAMBDA_URL=https://your-lambda-url.lambda-url.us-east-1.on.aws/
```

## Advanced Features

### Auto-fill Form from Voice

You can parse the voice transcript to auto-fill form fields:

```tsx
useSpeechRecognition({
  onResult: (text, isFinal) => {
    if (isFinal) {
      // Extract age
      const ageMatch = text.match(/\b(\d{2})\b/)
      if (ageMatch) {
        setFormData(prev => ({ ...prev, age: ageMatch[1] }))
      }
      
      // Extract location
      const locationMatch = text.match(/from (\w+)/i)
      if (locationMatch) {
        setFormData(prev => ({ ...prev, location: locationMatch[1] }))
      }
    }
  }
})
```

### Multiple Language Support

```tsx
const { transcript, startListening } = useSpeechRecognition({
  lang: "es-ES"  // Spanish
  // or "fr-FR" for French, etc.
})
```

### Error Handling

```tsx
const { error, isSupported } = useSpeechRecognition()

if (!isSupported) {
  return <div>Voice input not supported in this browser</div>
}

if (error) {
  return <div>Error: {error}</div>
}
```

## Security Considerations

1. **HTTPS Required**: Web Speech API only works over HTTPS (or localhost)
2. **User Permission**: Browser will prompt for microphone permission
3. **Lambda Authentication**: Add API keys or AWS IAM authentication to your Lambda

## Troubleshooting

**"Speech recognition is not supported"**
- Use Chrome or Edge
- Ensure you're on HTTPS or localhost

**"Microphone permission denied"**
- User needs to grant microphone permission
- Check browser settings

**"No speech detected"**
- Check microphone is working
- Ensure microphone is not muted
- Try speaking louder

## Example Files

- `hooks/use-speech-recognition.ts` - The custom hook
- `lib/lambda-client.ts` - Lambda integration
- `components/signup/signup-form-with-voice.tsx` - Complete example

## Next Steps

1. Replace `LAMBDA_URL` with your actual Lambda function URL
2. Integrate voice input into your signup flow
3. Test microphone permissions
4. Deploy and test on HTTPS
