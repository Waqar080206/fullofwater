import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generatePredictionQuestions(
  raceName: string,
  circuit: string,
  country: string,
  round: number
): Promise<{ question: string; optionA: string; optionB: string; multiplierWin: number }[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
You are generating prediction questions for an F1 fantasy game called OffGrid.
The upcoming race is: ${raceName} at ${circuit}, ${country} (Round ${round}).

Generate exactly 3 prediction questions that F1 fans would find exciting to bet on.
Each question must be a binary yes/no style question about something that will happen in the race.

Respond ONLY with a valid JSON array, no markdown, no explanation:
[
  {
    "question": "Will there be a Safety Car during the race?",
    "optionA": "Yes, Safety Car deployed",
    "optionB": "No Safety Car",
    "multiplierWin": 3
  },
  ...
]

Rules:
- multiplierWin must be either 3 or 4 (use 4 for less likely outcomes, 3 for more likely)
- Questions must be specific to this race/circuit
- Avoid questions about specific driver wins (too obvious)
- Focus on: safety cars, overtakes, weather, DNFs, fastest lap holders, qualifying surprises
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Strip markdown fences if present
  const clean = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(clean);
  return parsed;
}