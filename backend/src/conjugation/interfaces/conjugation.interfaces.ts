export interface ConjugationRequest {
  verb: string;
  person?: number;
  tense: number;
  voice?: number;
}

export interface ConjugationResult {
  verb: string;
  verbType: number;
  stem: string;
  conjugations: Record<string, string>;
  translation?: string;
  examples?: string[];
}

export interface VerbInfo {
  infinitive: string;
  type: number;
  stem: string;
  translation: string;
  examples: string[];
  frequency: number;
  cefrLevel: string;
}

export interface ConjugationExercise {
  id: string;
  verb: string;
  person: number;
  tense: number;
  voice: number;
  expectedAnswer: string;
  options?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  cefrLevel: string;
}

export interface ExerciseResult {
  exerciseId: string;
  userAnswer: string;
  correct: boolean;
  correctAnswer: string;
  explanation?: string;
}
