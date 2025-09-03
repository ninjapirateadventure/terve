import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestSessionEntity, TestType, TestQuestion, TestResult, TestSession } from './test.entity';
import { TestQuestionGenerator } from './test-generator.service';

export interface CreateTestRequest {
  testType: TestType;
  cefrLevel: string;
  questionCount?: number;
  timeLimitMinutes?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface SubmitAnswerRequest {
  testId: string;
  questionId: string;
  userAnswer: string;
  timeTaken?: number;
}

@Injectable()
export class TestService {
  constructor(
    @InjectRepository(TestSessionEntity)
    private testRepository: Repository<TestSessionEntity>,
    private questionGenerator: TestQuestionGenerator,
  ) {}

  async createTest(request: CreateTestRequest): Promise<TestSession> {
    const {
      testType,
      cefrLevel,
      questionCount = 10,
      timeLimitMinutes,
      difficulty = 'medium'
    } = request;

    let questions: TestQuestion[] = [];

    // Generate questions based on test type
    switch (testType) {
      case TestType.VERB_CONJUGATION:
        questions = await this.questionGenerator.generateVerbConjugationQuestions(
          questionCount,
          cefrLevel,
          difficulty
        );
        break;
      
      case TestType.NOUN_DECLENSION:
        questions = await this.questionGenerator.generateNounDeclensionQuestions(
          questionCount,
          cefrLevel,
          difficulty
        );
        break;
      
      case TestType.MIXED_GRAMMAR:
        questions = await this.questionGenerator.generateMixedGrammarQuestions(
          questionCount,
          cefrLevel,
          difficulty
        );
        break;
      
      case TestType.VOCABULARY:
        questions = this.questionGenerator.generateVocabularyQuestions(
          questionCount,
          cefrLevel,
          difficulty
        );
        break;
      
      default:
        throw new Error(`Unsupported test type: ${testType}`);
    }

    if (questions.length === 0) {
      throw new Error('Failed to generate any questions for the test');
    }

    // Calculate max score
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0);

    // Create test session
    const testSession = this.testRepository.create({
      testType,
      cefrLevel,
      questions,
      results: [],
      startTime: new Date(),
      totalScore: 0,
      maxScore,
      percentageScore: 0,
      passed: false,
      timeLimitMinutes
    });

    const savedSession = await this.testRepository.save(testSession);

    return this.mapToTestSession(savedSession);
  }

  async getTest(testId: string): Promise<TestSession | null> {
    const testSession = await this.testRepository.findOne({
      where: { id: testId }
    });

    return testSession ? this.mapToTestSession(testSession) : null;
  }

  async submitAnswer(request: SubmitAnswerRequest): Promise<TestResult> {
    const { testId, questionId, userAnswer, timeTaken } = request;

    const testSession = await this.testRepository.findOne({
      where: { id: testId }
    });

    if (!testSession) {
      throw new Error('Test session not found');
    }

    if (testSession.endTime) {
      throw new Error('Test has already been completed');
    }

    // Find the question
    const question = testSession.questions.find(q => q.id === questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    // Check if already answered
    const existingResult = testSession.results.find(r => r.questionId === questionId);
    if (existingResult) {
      throw new Error('Question has already been answered');
    }

    // Check answer
    const correct = this.checkAnswer(userAnswer, question.correctAnswer);
    const points = correct ? question.points : 0;

    const result: TestResult = {
      questionId,
      userAnswer: userAnswer.trim(),
      correct,
      points,
      timeTaken
    };

    // Update test session
    testSession.results.push(result);
    testSession.totalScore += points;
    testSession.percentageScore = Number(((testSession.totalScore / testSession.maxScore) * 100).toFixed(2));

    await this.testRepository.save(testSession);

    return result;
  }

  async completeTest(testId: string): Promise<TestSession> {
    const testSession = await this.testRepository.findOne({
      where: { id: testId }
    });

    if (!testSession) {
      throw new Error('Test session not found');
    }

    if (testSession.endTime) {
      throw new Error('Test has already been completed');
    }

    // Mark as completed
    testSession.endTime = new Date();
    
    // Determine if passed (70% threshold)
    testSession.passed = testSession.percentageScore >= 70;

    await this.testRepository.save(testSession);

    return this.mapToTestSession(testSession);
  }

  async getTestHistory(limit: number = 10): Promise<TestSession[]> {
    const sessions = await this.testRepository.find({
      order: { createdAt: 'DESC' },
      take: limit
    });

    return sessions.map(session => this.mapToTestSession(session));
  }

  async getTestStats(cefrLevel?: string): Promise<{
    totalTests: number;
    passedTests: number;
    averageScore: number;
    testsByType: Record<string, number>;
  }> {
    const query = this.testRepository.createQueryBuilder('test')
      .where('test.endTime IS NOT NULL');

    if (cefrLevel) {
      query.andWhere('test.cefrLevel = :cefrLevel', { cefrLevel });
    }

    const completedTests = await query.getMany();

    const totalTests = completedTests.length;
    const passedTests = completedTests.filter(t => t.passed).length;
    const averageScore = totalTests > 0 
      ? completedTests.reduce((sum, t) => sum + Number(t.percentageScore), 0) / totalTests 
      : 0;

    const testsByType = completedTests.reduce((acc, test) => {
      acc[test.testType] = (acc[test.testType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTests,
      passedTests,
      averageScore: Number(averageScore.toFixed(2)),
      testsByType
    };
  }

  private checkAnswer(userAnswer: string, correctAnswer: string): boolean {
    const userClean = userAnswer.toLowerCase().trim();
    const correctClean = correctAnswer.toLowerCase().trim();
    return userClean === correctClean;
  }

  private mapToTestSession(entity: TestSessionEntity): TestSession {
    return {
      id: entity.id,
      testType: entity.testType,
      cefrLevel: entity.cefrLevel,
      questions: entity.questions,
      results: entity.results,
      startTime: entity.startTime,
      endTime: entity.endTime,
      totalScore: entity.totalScore,
      maxScore: entity.maxScore,
      percentageScore: Number(entity.percentageScore),
      passed: entity.passed
    };
  }
}
