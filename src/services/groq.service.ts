import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class GroqService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  async generatePuzzle(difficulty: 'easy' | 'medium' | 'hard'): Promise<string> {
    const size = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5;
    const prompt = `
You are creating a murder mystery case for Detective Jency Infentica, a brilliant finance expert who left Wall Street to solve crimes. She has an exceptional eye for detail and logical prowess.

STRICT RULES:
- Return ONLY valid JSON (no markdown, no explanation)
- Follow the schema EXACTLY
- All arrays must match size = ${size}
- No missing fields
- Keep descriptions concise but vivid

SCHEMA:
{
  "title": "string",
  "description": "string",
  "categories": [
    {
      "name": "Suspects",
      "items": [
        {
          "name": "string",
          "alias": "string",
          "occupation": "string",
          "description": "string",
          "motive": "string"
        }
      ]
    },
    {
      "name": "Weapons",
      "items": [
        {
          "name": "string",
          "description": "string",
          "evidence": boolean
        }
      ]
    }
  ],
  "clues": [
    {
      "text": "string"
    }
  ],
  "solution": {
    "Suspects": ["string"],
    "Weapons": ["string"],
    "Justification": "string"
  }
}

CONSTRAINTS:
- Exactly ${size} suspects
- Exactly ${size} weapons
- At least ${size} clues
- Each suspect must have a unique motive
- At least one weapon must have evidence=true
- Style: noir, dark, investigative tone
- Set in a unique location each time

Generate now.
`;

    const res = await this.client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const content = res.choices[0].message.content;
    if (!content) {
      throw new Error('AI failed to generate forensic data.');
    }
    
    return content;
  }
}