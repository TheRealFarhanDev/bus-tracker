import axios from 'axios';

const GEMINI_PROXY_URL = '/api/gemini/chat';

export const sendGeminiPrompt = async (prompt) => {
  const response = await axios.post(GEMINI_PROXY_URL, { prompt });
  return response.data.text;
}; 