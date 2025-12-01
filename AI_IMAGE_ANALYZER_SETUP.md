# AI Image Analyzer Setup Guide

## Overview
The AI Image Analyzer feature allows you to upload hand-drawn mind maps, sketches, or photos and automatically convert them into editable digital mind maps.

## Setup Instructions

### 1. Get a Google Gemini API Key (Free)

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key" or "Get API Key"
4. **IMPORTANT**: Make sure the API key has access to Gemini API
   - The API should automatically be enabled, but if you get errors:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable "Generative Language API" for your project
5. Copy your API key

### 2. Configure the Application

1. Create a `.env` file in the project root (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

3. Restart the development server:
   ```bash
   npm run dev
   ```

## How It Works

1. **Upload an Image**: Click the camera icon in the toolbar and select an image containing a mind map
2. **AI Analysis**: The Google Gemini Vision API analyzes the image to:
   - Detect the central/main topic
   - Identify branch topics
   - Extract text from the image
   - Determine the structure and relationships
3. **Mind Map Creation**: The extracted data is automatically converted into an editable mind map

## Supported Image Types

- Hand-drawn mind maps
- Whiteboard diagrams
- Sketch notes
- Printed mind maps
- Digital screenshots
- Photos of physical mind maps

## Tips for Best Results

- **Clear Text**: Ensure text is legible and well-lit
- **Good Contrast**: Use clear contrast between text and background
- **Simple Structure**: Works best with clear hierarchical structures
- **Avoid Clutter**: Remove unnecessary background elements
- **Proper Framing**: Center the mind map in the photo

## Fallback Mode

If no API key is configured, the feature will work in **mock mode** with sample data. This is useful for:
- Testing the interface
- Demonstrations
- Development without API costs

## API Costs

Google Gemini API offers a generous free tier:
- **Free Tier**: 15 requests per minute, 1,500 requests per day
- **Cost**: Free for most personal use cases
- More info: [Google AI Pricing](https://ai.google.dev/pricing)

## Troubleshooting

### "Analysis Failed" - API key may be invalid or restricted

**Most Common Issue**: The API key needs proper permissions

1. **Verify API Key Format**: 
   - Should look like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
   - No extra spaces or quotes in `.env` file

2. **Enable Generative Language API**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Search for "Generative Language API"
   - Click "Enable" if not already enabled
   - Wait 1-2 minutes for activation

3. **Check API Key Restrictions**:
   - Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials)
   - Find your API key
   - Click "Edit API key"
   - Under "API restrictions", either:
     - Select "Don't restrict key" (for development), OR
     - Select "Restrict key" and add "Generative Language API"
   - Save changes

4. **Test Your API Key**:
   - Open browser console (F12)
   - Try uploading an image
   - Check console for detailed error messages
   - Look for specific error codes (403, 400, 429)

### Error Code Meanings

- **403 Forbidden**: API key invalid or doesn't have permission
  - Solution: Enable Generative Language API or check API restrictions
  
- **400 Bad Request**: Invalid request format or unsupported image
  - Solution: Try a different image format (PNG, JPG)
  
- **429 Too Many Requests**: Rate limit exceeded
  - Solution: Wait a moment and try again (15 requests/minute limit)

### "No API key found" warning
- Ensure `.env` file exists in project root
- Check that the variable is named exactly `VITE_GEMINI_API_KEY`
- Restart the dev server after adding the key

### "Analysis Failed" error
- Check your internet connection
- Verify the API key is valid
- Ensure the image file is not corrupted
- Try a different image format (PNG, JPG)

### Poor extraction quality
- Use higher resolution images
- Ensure better lighting in photos
- Make text more legible
- Simplify the mind map structure

## Privacy & Security

- Images are sent to Google's Gemini API for processing
- No images are stored on our servers
- API keys should never be committed to version control
- Keep your `.env` file in `.gitignore`

## Alternative: OpenAI Vision API

To use OpenAI Vision API instead:

1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Modify `src/services/imageAnalysisService.js` to use OpenAI SDK
3. Update environment variable to `VITE_OPENAI_API_KEY`

## Support

For issues or questions about the AI Image Analyzer:
- Check the console for detailed error messages
- Verify API key configuration
- Test with the provided sample images
- Open an issue on GitHub with error details
