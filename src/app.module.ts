import { Module } from '@nestjs/common';
import { PuzzleController } from './controllers/puzzle.controller';
import { PuzzleService } from './services/puzzle.service';
import { GroqService } from './services/groq.service';

@Module({
  controllers: [PuzzleController],
  providers: [PuzzleService, GroqService],
})
export class AppModule {}
