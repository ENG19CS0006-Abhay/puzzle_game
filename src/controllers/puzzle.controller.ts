import { Controller, Get, Post, Body, Param, Query, HttpCode } from '@nestjs/common';
import { PuzzleService, PuzzleResponse } from '../services/puzzle.service';

@Controller('api/puzzles')
export class PuzzleController {
  constructor(private puzzleService: PuzzleService) {}

  @Post('generate')
  @HttpCode(201)
  async generatePuzzle(
    @Body('difficulty') difficulty: 'easy' | 'medium' | 'hard' = 'easy',
  ): Promise<PuzzleResponse> {
    return this.puzzleService.generatePuzzle(difficulty);
  }

  @Get(':id/hint')
  async getHint(
    @Param('id') puzzleId: string,
    @Query('solvedCells') solvedCells?: string,
  ): Promise<{ hint: string }> {
    const parsedCells = solvedCells ? JSON.parse(solvedCells) : {};
    const hint = await this.puzzleService.getHint(puzzleId, parsedCells);
    return { hint };
  }

  @Post(':id/validate')
  async validateSolution(
    @Param('id') puzzleId: string,
    @Body('solution') solution: { Suspects: string[], Weapons: string[] },
  ): Promise<{ isCorrect: boolean; message: string; status: 'won' | 'lost' }> {
    const isCorrect = this.puzzleService.validateSolution(puzzleId, solution);
    return {
      isCorrect,
      status: isCorrect ? 'won' : 'lost',
      message: isCorrect 
        ? 'Case Closed. The truth is revealed and the killer is in custody.' 
        : 'The evidence doesn’t add up. Your deduction is flawed, Detective.',
    };
  }

  @Get('health')
  healthCheck(): { status: string } {
    return { status: 'API is healthy and ready to serve puzzles.' };
  }
}