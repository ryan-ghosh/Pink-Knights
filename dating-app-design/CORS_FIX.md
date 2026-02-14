# Fixing "Failed to fetch" / CORS Error

## The Problem

You're getting a "Failed to fetch" error when trying to send data to your API Gateway. This is typically a **CORS (Cross-Origin Resource Sharing)** issue.

## What is CORS?

CORS is a browser security feature that blocks requests from one origin (your frontend at `localhost:3000`) to another origin (your API Gateway) unless the server explicitly allows it.

## Solution: Enable CORS on Your API Gateway

Your API Gateway needs to send CORS headers to allow requests from your frontend.

### Option 1: Enable CORS in API Gateway Console

1. Go to [AWS API Gateway Console](https://console.aws.amazon.com/apigateway/)
2. Find your API: `columbiahacks`
3. Click on it → Go to "Actions" → "Enable CORS"
4. Configure:
   - **Access-Control-Allow-Origin**: `*` (or `http://localhost:3000` for development)
   - **Access-Control-Allow-Methods**: `POST, OPTIONS`
   - **Access-Control-Allow-Headers**: `Content-Type`
5. Click "Enable CORS and replace existing CORS headers"
6. **Important**: Deploy your API after enabling CORS!

### Option 2: Add CORS Headers in Your Lambda Function

If you control the Lambda function, add CORS headers in the response:

**Python:**
```python
def lambda_handler(event, context):
    # Your existing code...
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',  # or 'http://localhost:3000'
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
        'body': json.dumps({
            'score': 87,
            'summary': '...',
            'meta': {...}
        })
    }
```

**Node.js:**
```javascript
exports.handler = async (event) => {
    // Your existing code...
    
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',  // or 'http://localhost:3000'
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({
            score: 87,
            summary: '...',
            meta: {...}
        })
    };
};
```

**Important**: Also handle OPTIONS requests (preflight):

```python
def lambda_handler(event, context):
    # Handle preflight OPTIONS request
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            'body': ''
        }
    
    # Your existing POST handling...
```

### Option 3: Use a Proxy (Quick Fix for Development)

If you can't modify the API Gateway immediately, you can use a Next.js API route as a proxy:

1. The code already has `/app/api/submit-form/route.ts`
2. Update `lib/lambda-client.ts` to use the proxy by default in development
3. The Next.js API route will call your Lambda (server-to-server, no CORS)

## Testing CORS

After enabling CORS, test with:

```bash
curl -X POST "https://33khcxehd2.execute-api.us-east-1.amazonaws.com/default/columbiahacks" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -v
```

Look for `Access-Control-Allow-Origin` in the response headers.

## Quick Test

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try submitting the form
4. Click on the failed request
5. Check the "Response Headers" - you should see `Access-Control-Allow-Origin`

## Common Issues

### "Still getting CORS error after enabling"
- Make sure you **deployed** the API after enabling CORS
- Check that the headers are actually in the response (use Network tab)
- Try clearing browser cache

### "Works with curl but not in browser"
- This confirms it's a CORS issue (curl doesn't enforce CORS)
- Enable CORS on your API Gateway

### "Works in Postman but not browser"
- Same as above - Postman doesn't enforce CORS
- Enable CORS on your API Gateway

## For Production

When deploying to production:
- Change `Access-Control-Allow-Origin` from `*` to your actual domain
- Example: `'Access-Control-Allow-Origin': 'https://yourdomain.com'`

## Need Help?

If you still have issues:
1. Check browser console for the exact CORS error
2. Check Network tab for response headers
3. Verify API Gateway CORS is enabled and deployed
4. Test the endpoint with curl to confirm it works
