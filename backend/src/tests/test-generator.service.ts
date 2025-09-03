import { Injectable } from '@nestjs/common';
import { ConjugationService } from '../conjugation/conjugation.service';
import { DeclensionService } from '../declension/declension.service';
import { TestQuestion, QuestionType, TestType } from './test.entity';

@Injectable()
export class TestQuestionGenerator {
  constructor(
    private conjugationService: ConjugationService,
    private declensionService: DeclensionService,
  ) {}

  async generateVerbConjugationQuestions(
    count: number,
    cefrLevel: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<TestQuestion[]> {
    const questions: TestQuestion[] = [];

    for (let i = 0; i < count; i++) {
      try {
        // Generate a conjugation exercise
        const exercise = await this.conjugationService.generateExercise(cefrLevel, difficulty);
        
        const question: TestQuestion = {
          id: `verb-${exercise.id}-${i}`,
          type: exercise.options ? QuestionType.MULTIPLE_CHOICE : QuestionType.TEXT_INPUT,
          question: this.formatConjugationQuestion(exercise),
          options: exercise.options,
          correctAnswer: exercise.expectedAnswer,
          explanation: `Conjugate "${exercise.verb}" for the specified person and tense.`,
          points: difficulty === 'hard' ? 3 : difficulty === 'medium' ? 2 : 1,
          skill: 'conjugation',
          cefrLevel: exercise.cefrLevel
        };

        questions.push(question);
      } catch (error) {
        console.warn(`Failed to generate verb question ${i}:`, error);
      }
    }

    return questions;
  }

  async generateNounDeclensionQuestions(
    count: number,
    cefrLevel: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<TestQuestion[]> {
    const questions: TestQuestion[] = [];

    for (let i = 0; i < count; i++) {
      try {
        // Generate a declension exercise
        const exercise = await this.declensionService.generateExercise(cefrLevel, difficulty);
        
        const question: TestQuestion = {
          id: `noun-${exercise.id}-${i}`,
          type: exercise.options ? QuestionType.MULTIPLE_CHOICE : QuestionType.TEXT_INPUT,
          question: this.formatDeclensionQuestion(exercise),
          options: exercise.options,
          correctAnswer: exercise.expectedAnswer,
          explanation: `Decline "${exercise.noun}" to the specified case.`,
          points: difficulty === 'hard' ? 3 : difficulty === 'medium' ? 2 : 1,
          skill: 'declension',
          cefrLevel: exercise.cefrLevel
        };

        questions.push(question);
      } catch (error) {
        console.warn(`Failed to generate noun question ${i}:`, error);
      }
    }

    return questions;
  }

  async generateMixedGrammarQuestions(
    count: number,
    cefrLevel: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<TestQuestion[]> {
    const verbCount = Math.ceil(count / 2);
    const nounCount = count - verbCount;

    const [verbQuestions, nounQuestions] = await Promise.all([
      this.generateVerbConjugationQuestions(verbCount, cefrLevel, difficulty),
      this.generateNounDeclensionQuestions(nounCount, cefrLevel, difficulty)
    ]);

    // Shuffle the questions
    const allQuestions = [...verbQuestions, ...nounQuestions];
    return this.shuffleArray(allQuestions);
  }

  generateVocabularyQuestions(
    count: number,
    cefrLevel: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): TestQuestion[] {
    // Basic vocabulary questions - can be expanded
    const vocabularyBank = this.getVocabularyBank(cefrLevel);
    const questions: TestQuestion[] = [];

    for (let i = 0; i < Math.min(count, vocabularyBank.length); i++) {
      const vocab = vocabularyBank[i];
      
      const question: TestQuestion = {
        id: `vocab-${i}-${Date.now()}`,
        type: QuestionType.MULTIPLE_CHOICE,
        question: `What does "${vocab.finnish}" mean in English?`,
        options: this.generateVocabularyOptions(vocab.english, vocabularyBank),
        correctAnswer: vocab.english,
        explanation: `"${vocab.finnish}" means "${vocab.english}" in English.`,
        points: 1,
        skill: 'vocabulary',
        cefrLevel
      };

      questions.push(question);
    }

    return questions;
  }

  private formatConjugationQuestion(exercise: any): string {
    const persons = ['minä', 'sinä', 'hän', 'me', 'te', 'he'];
    const tenses = {
      1: 'present tense',
      2: 'past tense',
      5: 'conditional mood',
      7: 'imperative mood'
    };

    const person = persons[exercise.person - 1];
    const tense = tenses[exercise.tense as keyof typeof tenses] || 'specified tense';

    return `Conjugate the verb "${exercise.verb}" for "${person}" in ${tense}.`;
  }

  private formatDeclensionQuestion(exercise: any): string {
    const cases = {
      1: 'nominative',
      2: 'genitive', 
      3: 'partitive',
      4: 'accusative',
      5: 'inessive',
      6: 'elative',
      7: 'illative',
      8: 'adessive',
      9: 'ablative',
      10: 'allative'
    };

    const caseName = cases[exercise.case as keyof typeof cases] || 'specified case';
    return `Decline the noun "${exercise.noun}" to the ${caseName} case.`;
  }

  private getVocabularyBank(cefrLevel: string) {
    const vocabularyBanks = {
      A1: [
        { finnish: 'kissa', english: 'cat' },
        { finnish: 'koira', english: 'dog' },
        { finnish: 'talo', english: 'house' },
        { finnish: 'auto', english: 'car' },
        { finnish: 'kirja', english: 'book' },
        { finnish: 'vesi', english: 'water' },
        { finnish: 'ruoka', english: 'food' },
        { finnish: 'työ', english: 'work' },
        { finnish: 'koulu', english: 'school' },
        { finnish: 'maa', english: 'country' }
      ],
      A2: [
        { finnish: 'ystävä', english: 'friend' },
        { finnish: 'perhe', english: 'family' },
        { finnish: 'kaupunki', english: 'city' },
        { finnish: 'matka', english: 'trip' },
        { finnish: 'sieni', english: 'mushroom' },
        { finnish: 'järvi', english: 'lake' },
        { finnish: 'metsä', english: 'forest' },
        { finnish: 'sää', english: 'weather' }
      ],
      B1: [
        { finnish: 'yhteiskunta', english: 'society' },
        { finnish: 'kulttuuri', english: 'culture' },
        { finnish: 'talous', english: 'economy' },
        { finnish: 'politiikka', english: 'politics' }
      ],
      B2: [
        { finnish: 'kestävyys', english: 'sustainability' },
        { finnish: 'innovaatio', english: 'innovation' }
      ]
    };

    return vocabularyBanks[cefrLevel as keyof typeof vocabularyBanks] || vocabularyBanks.A1;
  }

  private generateVocabularyOptions(correct: string, bank: any[]): string[] {
    const options = [correct];
    const otherOptions = bank
      .map(item => item.english)
      .filter(english => english !== correct)
      .slice(0, 3);
    
    options.push(...otherOptions);
    
    // If we don't have enough options, add some generic wrong answers
    while (options.length < 4) {
      options.push('unknown word');
    }

    return this.shuffleArray(options);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
