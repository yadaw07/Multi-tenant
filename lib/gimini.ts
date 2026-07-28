import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) throw new Error('Api key is missing!');

const genAI = new GoogleGenAI({ apiKey });

export async function analyzeWithGemini(
  text: string,
  analysisType: 'summary' | 'qa' | 'sentiment' | 'entities' | 'extract',
) {
  const prompts = {
    summary: `Please provide a comprehensive summary of the following document. Include main points, key findings, and conclusions:\n\n${text}`,
    qa: `Based on the following document, generate 5 important questions and their answers:\n\n${text}`,
    sentiment: `Analyze the sentiment of this document (positive/negative/neutral) and explain briefly:\n\n${text}`,
    entities: `Extract key entities (people, organizations, dates, locations) from this document as a list:\n\n${text}`,
    extract: `Extract key information from the following document in structured format:\n\n${text}`,
  };

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompts[analysisType],
    });

    process.env.NODE_ENV === 'development' &&
      console.log('response:::', response);

    return response.text;
  } catch (error) {
    console.error(`Gemini ${analysisType} analysis failed:`, error);
    throw new Error(`Failed to analyze document (${analysisType})`);
  }
}
