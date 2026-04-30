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
    const prompt = `You are creating a murder mystery case for Detective Jency Infentica, a brilliant finance expert who left Wall Street to solve crimes. She has an exceptional eye for detail and logical prowess.

Generate a noir murder mystery puzzle JSON.
    Return ONLY JSON.
    Structure: { 
      "title": "...", 
      "description": "...", 
      "categories": [{"name": "Suspects", "items": [...]}, {"name": "Weapons", "items": [...]}],
      "clues": [{"text": "..."}],
      "solution": {"Suspects": ["Name1", "Name2"...], "Weapons": ["WeaponForName1", "WeaponForName2"...]}
    }
    Size: ${size} suspects and weapons.`;

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