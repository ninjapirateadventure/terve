import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DeclensionService, DeclensionExercise, DeclensionExerciseResult } from './declension.service';
import { Noun, NounCase } from './noun.entity';

@ApiTags('declension')
@Controller('declension')
export class DeclensionController {
  constructor(private readonly declensionService: DeclensionService) {}

  @Get('nouns')
  @ApiOperation({ summary: 'Get all nouns' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit number of results' })
  @ApiResponse({ status: 200, description: 'List of nouns', type: [Noun] })
  async getAllNouns(@Query('limit') limit?: number): Promise<Noun[]> {
    return this.declensionService.getAllNouns(limit);
  }

  @Get('noun/:nominative')
  @ApiOperation({ summary: 'Get specific noun information' })
  @ApiParam({ name: 'nominative', description: 'Noun in nominative case' })
  @ApiResponse({ status: 200, description: 'Noun information' })
  async getNoun(@Param('nominative') nominative: string): Promise<Noun | null> {
    return this.declensionService.getNounByNominative(nominative);
  }

  @Get('decline/:noun')
  @ApiOperation({ summary: 'Decline a noun to all cases or specific case' })
  @ApiParam({ name: 'noun', description: 'Noun to decline' })
  @ApiQuery({ name: 'case', required: false, enum: NounCase, description: 'Specific case to decline to' })
  @ApiResponse({ status: 200, description: 'Noun declensions' })
  async declineNoun(
    @Param('noun') noun: string,
    @Query('case') nounCase?: NounCase,
  ) {
    const caseNumber = nounCase ? parseInt(nounCase.toString()) : undefined;
    return this.declensionService.declineNoun(noun, caseNumber);
  }

  @Get('cases')
  @ApiOperation({ summary: 'Get information about all cases' })
  @ApiResponse({ status: 200, description: 'Case information and descriptions' })
  async getCaseTypes() {
    return this.declensionService.getCaseTypes();
  }

  @Get('exercise')
  @ApiOperation({ summary: 'Generate a declension exercise' })
  @ApiQuery({ name: 'cefrLevel', required: false, description: 'CEFR level (A1, A2, B1, B2)' })
  @ApiQuery({ name: 'difficulty', required: false, enum: ['easy', 'medium', 'hard'] })
  @ApiResponse({ status: 200, description: 'Generated exercise', type: 'DeclensionExercise' })
  async generateExercise(
    @Query('cefrLevel') cefrLevel: string = 'A1',
    @Query('difficulty') difficulty: 'easy' | 'medium' | 'hard' = 'easy',
  ): Promise<DeclensionExercise> {
    return this.declensionService.generateExercise(cefrLevel, difficulty);
  }

  @Post('exercise/check')
  @ApiOperation({ summary: 'Check exercise answer' })
  @ApiResponse({ status: 200, description: 'Exercise result', type: 'DeclensionExerciseResult' })
  async checkExerciseAnswer(
    @Body() body: { exercise: DeclensionExercise; userAnswer: string },
  ): Promise<DeclensionExerciseResult> {
    return this.declensionService.checkExerciseAnswer(body.exercise, body.userAnswer);
  }

  @Post('noun')
  @ApiOperation({ summary: 'Add a new noun' })
  @ApiResponse({ status: 201, description: 'Noun created successfully', type: Noun })
  async addNoun(@Body() nounData: Partial<Noun>): Promise<Noun> {
    return this.declensionService.addNoun(nounData);
  }
}
