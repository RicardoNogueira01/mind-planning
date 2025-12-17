/**
 * Image Analysis Service using Google Gemini Vision API
 * Analyzes images to extract mind map structure
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent';

/**
 * Analyzes an image and extracts mind map structure
 * @param {string} imageDataUrl - Base64 encoded image data URL
 * @returns {Promise<Object>} Mind map structure with central node and branches
 */
export const analyzeImage = async (imageDataUrl) => {
  if (!GEMINI_API_KEY) {
    throw new Error('No Gemini API key configured. Please add VITE_GEMINI_API_KEY to your .env file. Get a free API key at https://makersuite.google.com/app/apikey');
  }

  console.log('Starting image analysis with Gemini API...');
  console.log('API Key present:', GEMINI_API_KEY ? 'Yes' : 'No');

  try {
    // Remove data URL prefix to get base64 string
    const base64Data = imageDataUrl.split(',')[1];
    const mimeType = imageDataUrl.match(/data:(.*?);/)?.[1] || 'image/jpeg';

    const prompt = `Analyze this image which contains a mind map, diagram, sketch, or hand-drawn notes. 
    
Extract the following information:
    1. Identify the CENTRAL/MAIN topic or idea (usually in the center or at the top)
    2. Identify all BRANCH topics that connect to the central idea
    3. For each branch, note its relative position if visible (top, right, bottom, left)
    
Return ONLY a JSON object (no markdown, no code blocks) with this exact structure:
{
  "centralNode": {
    "text": "Main topic text",
    "bgColor": "#ffffff",
    "fontColor": "#2d3748"
  },
  "nodes": [
    {
      "text": "Branch topic text",
      "bgColor": "#EFF6FF",
      "fontColor": "#1E40AF",
      "relativePosition": { "angle": 0, "distance": 250 }
    }
  ]
}

Guidelines:
- Extract the actual text from the image as accurately as possible
- If text is unclear, make a reasonable interpretation
- Use angles: 0° (right), 90° (bottom), 180° (left), 270° (top), or distribute evenly
- Use different bgColors for variety: #EFF6FF (blue), #F0FDF4 (green), #FEF3C7 (yellow), #FCE7F3 (pink), #EDE9FE (purple)
- Match fontColor to bgColor theme
- Distance should be 250-300 pixels
- Return ONLY the JSON object, nothing else`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText;
      console.error('Gemini API error details:', {
        status: response.status,
        statusText: response.statusText,
        errorData: errorData,
        apiKey: GEMINI_API_KEY ? `${GEMINI_API_KEY.substring(0, 10)}...` : 'not set'
      });
      throw new Error(`Gemini API error: ${response.status} - ${errorMessage}`);
    }

    const data = await response.json();

    // Extract the text response from Gemini
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      throw new Error('No response from Gemini API');
    }

    // Parse the JSON response (remove markdown code blocks if present)
    let jsonText = textResponse.trim();
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const mindMapData = JSON.parse(jsonText);

    // Validate the structure
    if (!mindMapData.centralNode || !mindMapData.nodes || !Array.isArray(mindMapData.nodes)) {
      throw new Error('Invalid mind map structure returned from AI');
    }

    return mindMapData;

  } catch (error) {
    console.error('Error analyzing image:', error);

    // If API fails, return mock data as fallback
    console.warn('Falling back to mock data due to error:', error.message);
    return generateMockMindMapData();
  }
};

/**
 * Generates mock mind map data as fallback
 * @returns {Object} Mock mind map structure
 */
const generateMockMindMapData = () => {
  return {
    centralNode: {
      text: 'Main Idea',
      bgColor: '#ffffff',
      fontColor: '#2d3748'
    },
    nodes: [
      { text: 'Idea 1', bgColor: '#EFF6FF', fontColor: '#1E40AF', relativePosition: { angle: 0, distance: 250 } },
      { text: 'Idea 2', bgColor: '#F0FDF4', fontColor: '#166534', relativePosition: { angle: 72, distance: 250 } },
      { text: 'Idea 3', bgColor: '#FEF3C7', fontColor: '#92400E', relativePosition: { angle: 144, distance: 250 } },
      { text: 'Idea 4', bgColor: '#FCE7F3', fontColor: '#9F1239', relativePosition: { angle: 216, distance: 250 } },
      { text: 'Idea 5', bgColor: '#EDE9FE', fontColor: '#6B21A8', relativePosition: { angle: 288, distance: 250 } }
    ]
  };
};

export default {
  analyzeImage,
  generateMockMindMapData
};