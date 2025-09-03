import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Noun, NounCase, DeclensionType } from './noun.entity';
import { DeclensionEngine } from './declension.engine';

export interface DeclensionExercise {
  id: string;
  noun: string;
  case: NounCase;
  expectedAnswer: string;
  options?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  cefrLevel: string;
}

export interface DeclensionExerciseResult {
  exerciseId: string;
  userAnswer: string;
  correct: boolean;
  correctAnswer: string;
  explanation?: string;
}

@Injectable()
export class DeclensionService {
  constructor(
    @InjectRepository(Noun)
    private nounRepository: Repository<Noun>,
    private declensionEngine: DeclensionEngine,
  ) {}

  async getAllNouns(limit?: number): Promise<Noun[]> {
    const query = this.nounRepository
      .createQueryBuilder('noun')
      .orderBy('noun.frequency', 'ASC');

    if (limit) {
      query.limit(limit);
    }

    return query.getMany();
  }

  async getNounByNominative(nominative: string): Promise<Noun | null> {
    return this.nounRepository.findOne({
      where: { nominative: nominative.toLowerCase() }
    });
  }

  async declineNoun(nominative: string, nounCase?: NounCase) {
    const noun = await this.getNounByNominative(nominative);
    
    if (!noun) {
      // Try with declension engine even if not in database
      if (this.declensionEngine.isNounSupported(nominative)) {
        const declensionType = this.declensionEngine.classifyNoun(nominative);
        const stem = this.declensionEngine.extractStem(nominative);
        
        if (nounCase) {
          const declined = this.declensionEngine.declineNoun(nominative, nounCase);
          return {
            noun: nominative,
            declensionType,
            stem,
            case: nounCase,
            declined,
            translation: 'Translation not available'
          };
        } else {
          const declensions = this.declensionEngine.getAllDeclensions(nominative);
          return {
            noun: nominative,
            declensionType,
            stem,
            declensions,
            translation: 'Translation not available'
          };
        }
      }
      
      throw new Error(`Noun "${nominative}" not found`);
    }

    if (nounCase) {
      const declined = this.declensionEngine.declineNoun(nominative, nounCase);
      return {
        noun: noun.nominative,
        declensionType: noun.declensionType,
        stem: noun.stem,
        case: nounCase,
        declined,
        translation: noun.translation,
        examples: noun.examples
      };
    } else {
      const declensions = this.declensionEngine.getAllDeclensions(nominative);
      return {
        noun: noun.nominative,
        declensionType: noun.declensionType,
        stem: noun.stem,
        declensions,
        translation: noun.translation,
        examples: noun.examples
      };
    }
  }

  async generateExercise(cefrLevel: string = 'A1', difficulty: 'easy' | 'medium' | 'hard' = 'easy'): Promise<DeclensionExercise> {
    // Get nouns appropriate for CEFR level
    const availableNouns = await this.getNounsForLevel(cefrLevel);
    
    if (availableNouns.length === 0) {
      throw new Error(`No nouns available for CEFR level ${cefrLevel}`);
    }

    // Select random noun
    const randomNoun = availableNouns[Math.floor(Math.random() * availableNouns.length)];
    
    // Select random case (focus on basic cases for easier levels)
    const cases = this.getCasesForLevel(cefrLevel);
    const randomCase = cases[Math.floor(Math.random() * cases.length)];
    
    // Get correct answer
    const correctAnswer = this.declensionEngine.declineNoun(randomNoun.nominative, randomCase);
    
    // Generate exercise ID
    const exerciseId = `${randomNoun.nominative}-${randomCase}-${difficulty}-${Date.now()}`;

    const exercise: DeclensionExercise = {
      id: exerciseId,
      noun: randomNoun.nominative,
      case: randomCase,
      expectedAnswer: correctAnswer,
      difficulty,
      cefrLevel
    };

    // Generate multiple choice options for easy/medium difficulty
    if (difficulty === 'easy' || difficulty === 'medium') {
      exercise.options = this.generateMultipleChoiceOptions(
        randomNoun.nominative,
        randomCase,
        correctAnswer
      );
    }

    return exercise;
  }

  async checkExerciseAnswer(exercise: DeclensionExercise, userAnswer: string): Promise<DeclensionExerciseResult> {
    const cleanUserAnswer = userAnswer.toLowerCase().trim();
    const cleanExpectedAnswer = exercise.expectedAnswer.toLowerCase().trim();
    const correct = cleanUserAnswer === cleanExpectedAnswer;

    const result: DeclensionExerciseResult = {
      exerciseId: exercise.id,
      userAnswer,
      correct,
      correctAnswer: exercise.expectedAnswer
    };

    // Add explanation for incorrect answers
    if (!correct) {
      const caseDescriptions = this.declensionEngine.getCaseDescriptions();
      const caseKey = this.getCaseKeyFromEnum(exercise.case);
      const caseInfo = caseDescriptions[caseKey];
      
      result.explanation = `The ${caseInfo.english} case (${caseInfo.finnish}) is used for: ${caseInfo.description}. 
        For "${exercise.noun}", the correct form is "${exercise.expectedAnswer}".`;
    }

    return result;
  }

  async addNoun(nounData: Partial<Noun>): Promise<Noun> {
    // Classify the noun and extract stem using the engine
    const declensionType = this.declensionEngine.classifyNoun(nounData.nominative!);
    const stem = this.declensionEngine.extractStem(nounData.nominative!);

    const noun = this.nounRepository.create({
      ...nounData,
      nominative: nounData.nominative!.toLowerCase(),
      declensionType,
      stem,
    });

    return this.nounRepository.save(noun);
  }

  async getCaseTypes() {
    return this.declensionEngine.getCaseDescriptions();
  }

  async seedBasicNouns(): Promise<void> {
    // Check if we already have nouns
    const existingCount = await this.nounRepository.count();
    if (existingCount > 0) {
      console.log(`📚 Nouns already seeded (${existingCount} nouns exist)`);
      return;
    }

    console.log('🌱 Seeding basic Finnish nouns...');

    const basicNouns = [
      { nominative: 'talo', translation: 'house', examples: ['Talo on iso', 'Asun talossa'], cefrLevel: 'A1', frequency: 1 },
      { nominative: 'katu', translation: 'street', examples: ['Katu on pitkä', 'Kävelen kadulla'], cefrLevel: 'A1', frequency: 2 },
      { nominative: 'auto', translation: 'car', examples: ['Auto on nopea', 'Ajan autolla'], cefrLevel: 'A1', frequency: 3 },
      { nominative: 'koti', translation: 'home', examples: ['Koti on mukava', 'Olen kotona'], cefrLevel: 'A1', frequency: 4 },
      { nominative: 'lintu', translation: 'bird', examples: ['Lintu laulaa', 'Linnun pesä'], cefrLevel: 'A1', frequency: 5 },
      { nominative: 'käsi', translation: 'hand', examples: ['Käsi on vahva', 'Pidin kädestä'], cefrLevel: 'A1', frequency: 6 },
      { nominative: 'sydän', translation: 'heart', examples: ['Sydän lyö', 'Sydämeni särkee'], cefrLevel: 'A2', frequency: 7 },
      { nominative: 'nainen', translation: 'woman', examples: ['Nainen on kaunis', 'Puhun naisen kanssa'], cefrLevel: 'A1', frequency: 8 },
      { nominative: 'mies', translation: 'man', examples: ['Mies on vanha', 'Miehen nimi'], cefrLevel: 'A1', frequency: 9 },
      { nominative: 'lapsi', translation: 'child', examples: ['Lapsi leikkii', 'Lapsen äiti'], cefrLevel: 'A1', frequency: 10 },
      { nominative: 'vesi', translation: 'water', examples: ['Vesi on kylmää', 'Juon vettä'], cefrLevel: 'A1', frequency: 11 },
      { nominative: 'kirja', translation: 'book', examples: ['Kirja on mielenkiintoinen', 'Luen kirjaa'], cefrLevel: 'A1', frequency: 12 },
      { nominative: 'ruoka', translation: 'food', examples: ['Ruoka on hyvää', 'Syön ruokaa'], cefrLevel: 'A1', frequency: 13 },
      { nominative: 'pää', translation: 'head', examples: ['Pää särkee', 'Päässäni on ajatuksia'], cefrLevel: 'A1', frequency: 14 },
      { nominative: 'yö', translation: 'night', examples: ['Yö on pimeä', 'Nukun yöllä'], cefrLevel: 'A1', frequency: 15 },
      { nominative: 'päivä', translation: 'day', examples: ['Päivä on lämmin', 'Päivän aikana'], cefrLevel: 'A1', frequency: 16 },
      { nominative: 'aika', translation: 'time', examples: ['Aika kuluu', 'Aikaa on vähän'], cefrLevel: 'A2', frequency: 17 },
      { nominative: 'työ', translation: 'work', examples: ['Työ on tärkeää', 'Työhön meneminen'], cefrLevel: 'A2', frequency: 18 },
      { nominative: 'koulu', translation: 'school', examples: ['Koulu alkaa', 'Koulussa opiskelen'], cefrLevel: 'A1', frequency: 19 },
      { nominative: 'maa', translation: 'country/land', examples: ['Maa on kaunis', 'Maan raja'], cefrLevel: 'A1', frequency: 20 }
    ];

    for (const nounData of basicNouns) {
      try {
        await this.addNoun(nounData);
      } catch (error) {
        console.error(`Failed to add noun ${nounData.nominative}:`, error);
      }
    }

    const count = await this.nounRepository.count();
    console.log(`✅ Successfully seeded ${count} basic Finnish nouns`);
  }

  private async getNounsForLevel(cefrLevel: string): Promise<Noun[]> {
    // Get all nouns from database, fallback to supported nouns from engine
    let nouns = await this.nounRepository.find({
      where: { cefrLevel },
      order: { frequency: 'ASC' }
    });

    // If no nouns in database, create temporary noun objects from engine
    if (nouns.length === 0) {
      const supportedNouns = this.declensionEngine.getSupportedNouns();
      nouns = supportedNouns.slice(0, 10).map((nominative, index) => ({
        id: index,
        nominative,
        translation: 'Translation not available',
        examples: [],
        declensionType: this.declensionEngine.classifyNoun(nominative),
        stem: this.declensionEngine.extractStem(nominative),
        cefrLevel: 'A1',
        frequency: index + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
    }

    return nouns;
  }

  private getCasesForLevel(cefrLevel: string): NounCase[] {
    switch (cefrLevel) {
      case 'A1':
        return [NounCase.NOMINATIVE, NounCase.GENITIVE, NounCase.PARTITIVE];
      case 'A2':
        return [
          NounCase.NOMINATIVE, NounCase.GENITIVE, NounCase.PARTITIVE,
          NounCase.INESSIVE, NounCase.ELATIVE, NounCase.ILLATIVE
        ];
      case 'B1':
      case 'B2':
      default:
        return [
          NounCase.NOMINATIVE, NounCase.GENITIVE, NounCase.PARTITIVE,
          NounCase.INESSIVE, NounCase.ELATIVE, NounCase.ILLATIVE,
          NounCase.ADESSIVE, NounCase.ABLATIVE, NounCase.ALLATIVE
        ];
    }
  }

  private generateMultipleChoiceOptions(noun: string, correctCase: NounCase, correctAnswer: string): string[] {
    const options = [correctAnswer];
    
    // Generate wrong answers by using other cases of the same noun
    const allDeclensions = this.declensionEngine.getAllDeclensions(noun);
    const otherForms = Object.values(allDeclensions).filter(form => form !== correctAnswer);
    
    // Add 2-3 other forms as wrong answers
    while (options.length < 4 && otherForms.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherForms.length);
      const wrongAnswer = otherForms.splice(randomIndex, 1)[0];
      if (!options.includes(wrongAnswer)) {
        options.push(wrongAnswer);
      }
    }

    // If we need more options, add variations (this is a fallback)
    while (options.length < 4) {
      options.push(correctAnswer + 'x'); // Obviously wrong option
    }

    // Shuffle the options
    return options.sort(() => Math.random() - 0.5);
  }

  private getCaseKeyFromEnum(nounCase: NounCase): string {
    const caseMap = {
      [NounCase.NOMINATIVE]: 'nominative',
      [NounCase.GENITIVE]: 'genitive',
      [NounCase.PARTITIVE]: 'partitive',
      [NounCase.ACCUSATIVE]: 'accusative',
      [NounCase.INESSIVE]: 'inessive',
      [NounCase.ELATIVE]: 'elative',
      [NounCase.ILLATIVE]: 'illative',
      [NounCase.ADESSIVE]: 'adessive',
      [NounCase.ABLATIVE]: 'ablative',
      [NounCase.ALLATIVE]: 'allative'
    };
    
    return caseMap[nounCase] || 'unknown';
  }
}
