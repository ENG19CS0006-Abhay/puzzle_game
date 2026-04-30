import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend integration
  const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173').split(',');
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Global prefix for API
  app.setGlobalPrefix('');

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Puzzle Game API running on http://localhost:${port}`);
  console.log(`📝 API Documentation at http://localhost:${port}/api/puzzles/health`);
}

bootstrap();
