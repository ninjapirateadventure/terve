import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TestService, CreateTestRequest, SubmitAnswerRequest } from './test.service';
import { TestType } from './test.entity';

@ApiTags('tests')
@Controller('tests')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new test' })
  @ApiResponse({ status: 201, description: 'Test created successfully' })
  async createTest(@Body() request: CreateTestRequest) {
    return this.testService.createTest(request);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get test by ID' })
  @ApiParam({ name: 'id', description: 'Test ID' })
  @ApiResponse({ status: 200, description: 'Test details' })
  async getTest(@Param('id') id: string) {
    const test = await this.testService.getTest(id);
    if (!test) {
      throw new Error('Test not found');
    }
    return test;
  }

  @Post(':id/answer')
  @ApiOperation({ summary: 'Submit an answer for a question' })
  @ApiParam({ name: 'id', description: 'Test ID' })
  @ApiResponse({ status: 200, description: 'Answer submitted successfully' })
  async submitAnswer(
    @Param('id') testId: string,
    @Body() body: Omit<SubmitAnswerRequest, 'testId'>
  ) {
    return this.testService.submitAnswer({ testId, ...body });
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete a test' })
  @ApiParam({ name: 'id', description: 'Test ID' })
  @ApiResponse({ status: 200, description: 'Test completed successfully' })
  async completeTest(@Param('id') id: string) {
    return this.testService.completeTest(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get test history' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit number of results' })
  @ApiResponse({ status: 200, description: 'List of completed tests' })
  async getTestHistory(@Query('limit') limit?: number) {
    return this.testService.getTestHistory(limit);
  }

  @Get('stats/summary')
  @ApiOperation({ summary: 'Get test statistics' })
  @ApiQuery({ name: 'cefrLevel', required: false, description: 'Filter by CEFR level' })
  @ApiResponse({ status: 200, description: 'Test statistics' })
  async getTestStats(@Query('cefrLevel') cefrLevel?: string) {
    return this.testService.getTestStats(cefrLevel);
  }

  @Get('types/available')
  @ApiOperation({ summary: 'Get available test types' })
  @ApiResponse({ status: 200, description: 'Available test types and descriptions' })
  getAvailableTestTypes() {
    return {
      testTypes: [
        {
          type: TestType.VERB_CONJUGATION,
          name: 'Verb Conjugation',
          description: 'Test your knowledge of Finnish verb conjugations across different tenses and persons.',
          estimatedTime: '10-15 minutes',
          skills: ['Grammar', 'Verb Forms']
        },
        {
          type: TestType.NOUN_DECLENSION,
          name: 'Noun Declension', 
          description: 'Practice Finnish noun cases and declension patterns.',
          estimatedTime: '10-15 minutes',
          skills: ['Grammar', 'Noun Cases']
        },
        {
          type: TestType.MIXED_GRAMMAR,
          name: 'Mixed Grammar',
          description: 'Combined test covering both verb conjugations and noun declensions.',
          estimatedTime: '15-20 minutes',
          skills: ['Grammar', 'Verb Forms', 'Noun Cases']
        },
        {
          type: TestType.VOCABULARY,
          name: 'Vocabulary',
          description: 'Test your knowledge of Finnish vocabulary and word meanings.',
          estimatedTime: '5-10 minutes',
          skills: ['Vocabulary', 'Translation']
        }
      ],
      cefrLevels: [
        { level: 'A1', name: 'Beginner', description: 'Basic words and simple grammar' },
        { level: 'A2', name: 'Elementary', description: 'Common expressions and everyday vocabulary' },
        { level: 'B1', name: 'Intermediate', description: 'More complex grammar and varied vocabulary' },
        { level: 'B2', name: 'Upper Intermediate', description: 'Advanced structures and nuanced meanings' }
      ],
      difficulties: [
        { level: 'easy', name: 'Easy', description: 'Multiple choice questions with clear options' },
        { level: 'medium', name: 'Medium', description: 'Mixed question types with moderate difficulty' },
        { level: 'hard', name: 'Hard', description: 'Text input questions requiring precise answers' }
      ]
    };
  }
}
