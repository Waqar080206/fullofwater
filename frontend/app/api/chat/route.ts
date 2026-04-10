import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Initialize the Groq API using the key from environment variables
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export async function POST(req: NextRequest) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: 'GROQ_API_KEY is not configured in the environment.' },
      { status: 500 }
    );
  }

  try {
    const { messages } = await req.json();

    // Map UI chat roles (user | model) to Groq/OpenAI format (user | assistant)
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.content,
    }));

    // Add the system prompt at the beginning of the array to instruct the model's persona
    formattedMessages.unshift({
      role: 'system',
      content: "You are a specialized F1 Race Engineer AI. Answer questions about F1, strategies, tire wear, and LapLogic prediction strategies concisely and accurately. Maintain a professional, encouraging pit wall tone."
    });

    const completion = await groq.chat.completions.create({
      messages: formattedMessages,
      model: 'llama-3.1-8b-instant',
    });

    const textResponse = completion.choices[0]?.message?.content || "No response received";

    return NextResponse.json({ reply: textResponse });
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    return NextResponse.json(
      { error: 'Failed to generate response. Please try again later.' },
      { status: 500 }
    );
  }
}
