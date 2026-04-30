import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { GroqService } from './groq.service';

// Exporting the missing member required by the controller
export interface PuzzleResponse {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  categories: any[];
  clues: any[];
  solution: any[];
}

@Injectable()
export class PuzzleService {
  private puzzles: Map<string, any> = new Map();

  constructor(private groqService: GroqService) {}

  async generatePuzzle(difficulty: 'easy' | 'medium' | 'hard'): Promise<PuzzleResponse> {
    try {
      const puzzleJson = await this.groqService.generatePuzzle(difficulty);
      const parsed = JSON.parse(puzzleJson);
      const id = Math.random().toString(36).substring(7);
      
      const puzzle: PuzzleResponse = {
        id,
        title: parsed.title,
        description: parsed.description,
        difficulty,
        categories: parsed.categories,
        clues: parsed.clues,
        solution: parsed.solution, // Store the solution for internal use
      };

      // Store the solution privately
      this.puzzles.set(id, { ...puzzle, solution: parsed.solution });
      return puzzle;
    } catch (error) {
      throw new BadRequestException('Case file corrupted.');
    }
  }

  /**
   * getHint now accepts two arguments to match the controller's implementation.
   * @param puzzleId Unique ID of the current case.
   * @param category (Optional) The specific category to provide a hint for.
   */
  getHint(puzzleId: string, category?: string): string {
    const puzzle = this.puzzles.get(puzzleId);
    if (!puzzle) {
      throw new NotFoundException('Case file not found.');
    }
    
    // Select a random correct pairing from the solution to act as a hint
    const solution = puzzle.solution;
    const randomIndex = Math.floor(Math.random() * solution.Suspects.length);
    const suspect = solution.Suspects[randomIndex];
    const weapon = solution.Weapons[randomIndex];
    
    const context = category ? ` regarding ${category}` : '';
    return `Forensic leak${context}: We have confirmed that ${suspect} handled the ${weapon}.`;
  }

  validateSolution(puzzleId: string, userSolution: { Suspects: string[], Weapons: string[] }): boolean {
    const puzzle = this.puzzles.get(puzzleId);
    if (!puzzle) return false;
    
    const expected = puzzle.solution;
    
    // Check if at least ONE of the user's pairings exists in the expected solution
    for (let i = 0; i < userSolution.Suspects.length; i++) {
      const userSuspect = userSolution.Suspects[i];
      const userWeapon = userSolution.Weapons[i];

      // Find the index of this suspect in the master solution
      const expectedIndex = expected.Suspects.indexOf(userSuspect);

      // If suspect exists and their weapon matches the master solution, it's a win
      if (expectedIndex !== -1 && expected.Weapons[expectedIndex] === userWeapon) {
        return true; 
      }
    }

    // If we finished the loop and no single pair matched
    return false;
}
}