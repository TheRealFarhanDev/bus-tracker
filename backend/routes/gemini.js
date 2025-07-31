// routes/gemini.js
import express from 'express';
import axios from 'axios';

const router = express.Router();

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const SYSTEM_CONTEXT = `You are a helpful AI assistant for BusTracker, a navkis college bus tracking system in Hassan, Karnataka, India. 

You can help students with:
- Route information and schedules
- Bus timing queries
- General questions about using the BusTracker system
- Directions to bus stops in Hassan
- College transport policies

Be concise, friendly, and focus on bus-related queries. If asked about topics outside of bus tracking, politely redirect to bus-related topics.

Current routes available:
- Route 01: N.R Circle → Santhepete → College (8 stops)
- Route 02: Ringroad Junction → New Bus Stand → College (10 stops)  
- Route 03: Shankarmutt Road → M.C.E → College (13 stops)
- Route 04: Ganapathi Temple → Sparsh Hospital → College (12 stops)
- Route 05: Pruthvi Theatre → Gorur Circle → College (12 stops)

All routes end at the college campus and run primarily in the morning from 8:30 AM - 10:00 AM.`;

router.post('/chat', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({
      error: 'Prompt is required',
      timestamp: new Date().toISOString()
    });
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    return res.status(500).json({
      error: 'Server configuration error: missing Gemini API key',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const enhancedPrompt = `${SYSTEM_CONTEXT}\n\nUser Question: ${prompt}`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${geminiApiKey}`,
      {
        contents: [{ parts: [{ text: enhancedPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'BusTracker-MVP/1.0'
        },
        timeout: 10000
      }
    );

    const botText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Sorry, I could not generate a response. Please try again.';

    res.json({
      text: botText,
      timestamp: new Date().toISOString(),
      tokensUsed: response.data?.usageMetadata?.totalTokenCount || 0
    });

  } catch (err) {
    console.error('Gemini API error:', err.response?.data || err.message);

    let errorMessage = 'Failed to get response from Gemini';
    let statusCode = 500;

    if (err.response?.status === 400) {
      errorMessage = 'Bad request to Gemini API';
    } else if (err.response?.status === 403) {
      errorMessage = 'Access denied or API quota exceeded';
      statusCode = 403;
    } else if (err.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout - please try again';
      statusCode = 408;
    }

    res.status(statusCode).json({
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;