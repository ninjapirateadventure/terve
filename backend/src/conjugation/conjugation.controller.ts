import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConjugationService } from './conjugation.service';
import { Tense, Voice } from './verb.entity';
import {
  ConjugationRequest,
  ConjugationExercise,
  ExerciseResult,
} from './interfaces/conjugation.interfaces';

@Controller('conjugation')
export class ConjugationController {
  constructor(private readonly conjugationService: ConjugationService) {}

  /**
   * Get all verbs, optionally filtered by CEFR level
   */
  @Get('verbs')
  async getVerbs(
    @Query('cefrLevel') cefrLevel?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.conjugationService.getVerbs(cefrLevel, limitNum);
  }

  /**
   * Get information about a specific verb
   */
  @Get('verb/:infinitive')
  async getVerb(@Param('infinitive') infinitive: string) {
    const verb = await this.conjugationService.getVerb(infinitive);
    if (!verb) {
      throw new NotFoundException(`Verb '${infinitive}' not found`);
    }
    return verb;
  }

  /**
   * Conjugate a verb for all persons in specified tense and voice
   */
  @Get('conjugate/:verb')
  async conjugateVerb(
    @Param('verb') verb: string,
    @Query('tense') tense?: string,
    @Query('voice') voice?: string,
  ) {
    const tenseNum = tense ? parseInt(tense, 10) : Tense.PRESENT;
    const voiceNum = voice ? parseInt(voice, 10) : Voice.ACTIVE;

    // Validate tense
    if (!Object.values(Tense).includes(tenseNum)) {
      throw new BadRequestException('Invalid tense parameter');
    }

    // Validate voice
    if (!Object.values(Voice).includes(voiceNum)) {
      throw new BadRequestException('Invalid voice parameter');
    }

    return this.conjugationService.conjugateVerb(verb, tenseNum, voiceNum);
  }

  /**
   * Add a new verb to the database
   */
  @Post('verb')
  async addVerb(@Body() verbData: any) {
    return this.conjugationService.addVerb(verbData);
  }

  /**
   * Get information about conjugation types, tenses, etc.
   */
  @Get('types')
  getConjugationTypes() {
    return this.conjugationService.getConjugationTypes();
  }

  /**
   * Generate a new conjugation exercise
   */
  @Get('exercise')
  async generateExercise(
    @Query('cefrLevel') cefrLevel: string = 'A1',
    @Query('difficulty') difficulty: 'easy' | 'medium' | 'hard' = 'easy',
  ): Promise<ConjugationExercise> {
    return this.conjugationService.generateExercise(cefrLevel, difficulty);
  }

  /**
   * Check an exercise answer
   */
  @Post('exercise/check')
  checkAnswer(
    @Body() body: { exercise: ConjugationExercise; userAnswer: string },
  ): ExerciseResult {
    const { exercise, userAnswer } = body;
    
    if (!exercise || !userAnswer) {
      throw new BadRequestException('Exercise and userAnswer are required');
    }

    return this.conjugationService.checkAnswer(exercise, userAnswer);
  }

  /**
   * Get multiple exercises for practice
   */
  @Get('exercises')
  async generateExercises(
    @Query('count') count: string = '5',
    @Query('cefrLevel') cefrLevel: string = 'A1',
    @Query('difficulty') difficulty: 'easy' | 'medium' | 'hard' = 'easy',
  ): Promise<ConjugationExercise[]> {
    const exerciseCount = parseInt(count, 10);
    const exercises = [];

    for (let i = 0; i < exerciseCount; i++) {
      const exercise = await this.conjugationService.generateExercise(cefrLevel, difficulty);
      exercises.push(exercise);
    }

    return exercises;
  }
}
