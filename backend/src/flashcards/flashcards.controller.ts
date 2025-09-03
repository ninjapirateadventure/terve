import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FlashcardsService } from './flashcards.service';
import { FlashcardCategory } from './user-flashcard.entity';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@ApiTags('Flashcards')
@Controller('flashcards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FlashcardsController {
  constructor(private readonly flashcardsService: FlashcardsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user flashcards by category' })
  async getFlashcards(
    @Request() req,
    @Query('category') category?: FlashcardCategory
  ) {
    return this.flashcardsService.getUserFlashcards(req.user.id, category);
  }

  @Get('counts')
  @ApiOperation({ summary: 'Get flashcard counts by category' })
  async getCategoryCounts(@Request() req) {
    return this.flashcardsService.getCategoryCounts(req.user.id);
  }

  @Get('practice')
  @ApiOperation({ summary: 'Get a random card for practice' })
  async getPracticeCard(@Request() req) {
    return this.flashcardsService.getRandomLearningCard(req.user.id);
  }

  @Post('move')
  @ApiOperation({ summary: 'Move a word to a different category' })
  async moveToCategory(
    @Request() req,
    @Body() body: { wordId: string; category: FlashcardCategory }
  ) {
    const result = await this.flashcardsService.moveToCategory(req.user.id, body.wordId, body.category);
    
    // Only auto-refill if learning category drops significantly (below 90)
    const learningCount = await this.flashcardsService.getUserFlashcards(req.user.id, FlashcardCategory.LEARNING);
    if (learningCount.length < 90) {
      await this.flashcardsService.ensureLearningCategorySize(req.user.id);
    }
    
    return result;
  }

  @Post('review')
  @ApiOperation({ summary: 'Record a review result' })
  async recordReview(
    @Request() req,
    @Body() body: { flashcardId: string; wasCorrect: boolean }
  ) {
    return this.flashcardsService.updateReviewStats(body.flashcardId, body.wasCorrect);
  }

  @Post('initialize')
  @ApiOperation({ summary: 'Initialize flashcards for a user' })
  async initializeFlashcards(@Request() req) {
    await this.flashcardsService.ensureLearningCategorySize(req.user.id, 100);
    return { message: 'Flashcards initialized' };
  }

  @Post('refill-learning')
  @ApiOperation({ summary: 'Manually refill learning category to 100 words' })
  async refillLearning(@Request() req) {
    const beforeCount = await this.flashcardsService.getUserFlashcards(req.user.id, FlashcardCategory.LEARNING);
    await this.flashcardsService.ensureLearningCategorySize(req.user.id, 100);
    const afterCount = await this.flashcardsService.getUserFlashcards(req.user.id, FlashcardCategory.LEARNING);
    
    return { 
      message: 'Learning category refilled',
      before: beforeCount.length,
      after: afterCount.length,
      added: afterCount.length - beforeCount.length
    };
  }

  @Post('cleanup-duplicates')
  @ApiOperation({ summary: 'Clean up duplicate flashcards for user' })
  async cleanupDuplicates(@Request() req) {
    const result = await this.flashcardsService.cleanupDuplicates(req.user.id);
    return {
      message: 'Duplicate cleanup completed',
      duplicatesRemoved: result.removed
    };
  }
}
