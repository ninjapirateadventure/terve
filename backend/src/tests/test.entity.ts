import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum TestType {
  VERB_CONJUGATION = 'verb_conjugation',
  NOUN_DECLENSION = 'noun_declension', 
  MIXED_GRAMMAR = 'mixed_grammar',
  VOCABULARY = 'vocabulary'
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TEXT_INPUT = 'text_input',
  DRAG_DROP = 'drag_drop'
}

export interface TestQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  points: number;
  skill: string; // 'conjugation', 'declension', 'vocabulary'
  cefrLevel: string;
}

export interface TestResult {
  questionId: string;
  userAnswer: string;
  correct: boolean;
  points: number;
  timeTaken?: number; // in seconds
}

export interface TestSession {
  id: string;
  testType: TestType;
  cefrLevel: string;
  questions: TestQuestion[];
  results: TestResult[];
  startTime: Date;
  endTime?: Date;
  totalScore: number;
  maxScore: number;
  percentageScore: number;
  passed: boolean;
}

@Entity('test_sessions')
export class TestSessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TestType,
    default: TestType.MIXED_GRAMMAR
  })
  testType: TestType;

  @Column({ name: 'cefr_level', default: 'A1' })
  cefrLevel: string;

  @Column('jsonb')
  questions: TestQuestion[];

  @Column('jsonb', { default: [] })
  results: TestResult[];

  @Column({ name: 'start_time' })
  startTime: Date;

  @Column({ name: 'end_time', nullable: true })
  endTime?: Date;

  @Column({ name: 'total_score', default: 0 })
  totalScore: number;

  @Column({ name: 'max_score', default: 0 })
  maxScore: number;

  @Column({ name: 'percentage_score', type: 'decimal', precision: 5, scale: 2, default: 0 })
  percentageScore: number;

  @Column({ default: false })
  passed: boolean;

  @Column({ name: 'time_limit_minutes', nullable: true })
  timeLimitMinutes?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
