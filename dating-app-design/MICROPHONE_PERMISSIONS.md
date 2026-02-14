# Microphone Permissions Guide

## Why You're Getting Permission Errors

The Web Speech API requires microphone access to work. Browsers require explicit user permission before allowing microphone access for security reasons.

## How to Fix Microphone Permission Errors

### Option 1: Grant Permission in Browser (Recommended)

1. **Look for the permission prompt:**
   - When you click the microphone button, your browser should show a popup asking for microphone permission
   - Click "Allow" or "Allow" in the popup

2. **If you accidentally denied permission:**
   - **Chrome/Edge:**
     - Click the lock icon (🔒) in the address bar (left of the URL)
     - Find "Microphone" in the list
     - Change it from "Block" to "Allow"
     - Refresh the page
   
   - **Safari:**
     - Go to Safari → Settings → Websites → Microphone
     - Find `localhost:3000` or your site
     - Change to "Allow"
     - Refresh the page

   - **Firefox:**
     - Click the lock icon in the address bar
     - Click "More Information"
     - Go to "Permissions" tab
     - Find "Use the Microphone" and click "Allow"
     - Refresh the page

### Option 2: Check Browser Settings

**Chrome:**
1. Go to `chrome://settings/content/microphone`
2. Make sure "Ask before accessing" is enabled
3. Check that `localhost` or your site is not blocked

**Edge:**
1. Go to `edge://settings/content/microphone`
2. Same as Chrome

**Safari:**
1. Safari → Settings → Websites → Microphone
2. Ensure your site is allowed

### Option 3: Use HTTPS

The Web Speech API requires:
- ✅ HTTPS (secure connection)
- ✅ OR localhost (for development)

If you're not on localhost, make sure you're using HTTPS (`https://` not `http://`).

## Common Error Messages

### "Microphone permission denied"
**Solution:** Follow Option 1 above to grant permission

### "No microphone found"
**Solution:** 
- Check that your device has a microphone
- Check that the microphone is not being used by another app
- Try refreshing the page

### "Speech recognition is not supported"
**Solution:**
- Use Chrome or Edge browser
- Make sure you're on HTTPS or localhost
- Update your browser to the latest version

### "Failed to start speech recognition"
**Solution:**
- Grant microphone permission first
- Make sure no other app is using the microphone
- Try refreshing the page

## Testing Microphone Access

You can test if your browser has microphone access:

1. Open browser console (F12)
2. Run this command:
   ```javascript
   navigator.mediaDevices.getUserMedia({ audio: true })
     .then(() => console.log("✅ Microphone access granted"))
     .catch(err => console.error("❌ Microphone access denied:", err))
   ```

## Troubleshooting Steps

1. ✅ **Check browser compatibility** - Use Chrome or Edge
2. ✅ **Check HTTPS/localhost** - Must be on secure connection
3. ✅ **Grant permission** - Allow microphone in browser settings
4. ✅ **Check other apps** - Close apps using the microphone
5. ✅ **Refresh page** - After changing permissions
6. ✅ **Check browser version** - Update to latest version

## For Development

If you're testing locally:
- ✅ `http://localhost:3000` works (localhost is always allowed)
- ✅ Make sure you click "Allow" when the browser prompts you
- ✅ If you denied permission, follow Option 1 above to re-enable it

## Still Having Issues?

1. **Clear browser cache and cookies** for localhost
2. **Try incognito/private mode** (sometimes permissions work better there)
3. **Restart your browser**
4. **Check system microphone settings** (macOS System Preferences or Windows Settings)
