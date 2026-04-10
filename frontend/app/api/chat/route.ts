import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API using the key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not configured in the environment.' },
      { status: 500 }
    );
  }

  try {
    const { messages } = await req.json();

    // Grab the latest user message
    const latestMessage = messages[messages.length - 1].content;

    // Use the gemini-2.5-flash model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Format the history for the model (Google's format: { role: 'user' | 'model', parts: [{ text: string }] })
    // We ignore the very first message from the frontend because it's just the hardcoded UI welcome message,
    // which would cause consecutive 'model' turns and crash the Gemini API.
    const history = messages.slice(1, -1).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Start a chat session with the formatted history
    const chatSession = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: "You are a specialized F1 Race Engineer AI. Answer questions about F1, strategies, tire wear, and LapLogic prediction strategies concisely and accurately. Maintain a professional, encouraging pit wall tone." }],
        },
        {
          role: 'model',
          parts: [{ text: "Welcome to the pit wall. I've analyzed the historical data for the upcoming Grand Prix. Weather models suggest a 40% chance of rain. How can I assist your prediction strategy today?" }],
        },
        ...history,
      ],
    });

    const result = await chatSession.sendMessage(latestMessage);
    const textResponse = result.response.text();

    return NextResponse.json({ reply: textResponse });
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    return NextResponse.json(
      { error: 'Failed to generate response. Please try again later.' },
      { status: 500 }
    );
  }
}
