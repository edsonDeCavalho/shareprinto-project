import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

/**
 * Google AI Genkit configuration
 * 
 * The googleAI() plugin automatically reads API key from:
 * - GOOGLE_GENAI_API_KEY environment variable, or
 * - Google Cloud service account credentials (GOOGLE_APPLICATION_CREDENTIALS)
 * 
 * Never hardcode API keys in this file. Always use environment variables.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
