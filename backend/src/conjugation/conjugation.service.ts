import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Verb, VerbType, Tense, Voice } from './verb.entity';
import { ConjugationEngine } from './conjugation.engine';
import { 
  ConjugationResult, 
  VerbInfo, 
  ConjugationExercise, 
  ExerciseResult 
} from './interfaces/conjugation.interfaces';

@Injectable()
export class ConjugationService implements OnModuleInit {
  constructor(
    @InjectRepository(Verb)
    private verbRepository: Repository<Verb>,
    private conjugationEngine: ConjugationEngine,
  ) {}

  async onModuleInit() {
    await this.seedCommonVerbs();
  }

  /**
   * Get all verbs, optionally filtered by CEFR level
   */
  async getVerbs(cefrLevel?: string, limit?: number): Promise<Verb[]> {
    const query = this.verbRepository.createQueryBuilder('verb')
      .orderBy('verb.frequency', 'ASC');

    if (cefrLevel) {
      query.where('verb.cefrLevel = :cefrLevel', { cefrLevel });
    }

    if (limit) {
      query.limit(limit);
    }

    return query.getMany();
  }

  /**
   * Get a specific verb by infinitive
   */
  async getVerb(infinitive: string): Promise<Verb | null> {
    return this.verbRepository.findOne({
      where: { infinitive: infinitive.toLowerCase() },
    });
  }

  /**
   * Add a new verb to the database
   */
  async addVerb(verbInfo: Partial<Verb>): Promise<Verb> {
    const verb = this.verbRepository.create(verbInfo);
    
    // Auto-classify if type not provided
    if (!verb.type) {
      verb.type = this.conjugationEngine.classifyVerb(verb.infinitive);
    }
    
    // Auto-extract stem if not provided
    if (!verb.stem) {
      verb.stem = this.conjugationEngine.extractStem(verb.infinitive, verb.type);
    }
    
    return this.verbRepository.save(verb);
  }

  /**
   * Conjugate a verb for all persons in specified tense and voice
   */
  async conjugateVerb(
    verb: string, 
    tense: Tense, 
    voice: Voice = Voice.ACTIVE
  ): Promise<ConjugationResult> {
    // Try to get verb from database first
    const verbEntity = await this.getVerb(verb);
    
    let verbType: VerbType;
    let stem: string;
    let translation: string | undefined;
    let examples: string[] | undefined;

    if (verbEntity) {
      verbType = verbEntity.type;
      // Always use fresh stem extraction to ensure correctness
      stem = this.conjugationEngine.extractStem(verb, verbType);
      translation = verbEntity.translation;
      examples = verbEntity.examples;
    } else {
      // Classify and extract stem for unknown verb
      verbType = this.conjugationEngine.classifyVerb(verb);
      stem = this.conjugationEngine.extractStem(verb, verbType);
    }

    const conjugations = this.conjugationEngine.conjugateVerb(verb, tense, voice);

    return {
      verb,
      verbType,
      stem,
      conjugations,
      translation,
      examples,
    };
  }

  /**
   * Generate a conjugation exercise
   */
  async generateExercise(
    cefrLevel: string = 'A1',
    difficulty: 'easy' | 'medium' | 'hard' = 'easy'
  ): Promise<ConjugationExercise> {
    // Get appropriate verbs for the level
    const verbs = await this.getVerbs(cefrLevel, 20);
    
    if (verbs.length === 0) {
      throw new Error(`No verbs found for CEFR level ${cefrLevel}`);
    }

    // Select random verb
    const verb = verbs[Math.floor(Math.random() * verbs.length)];
    
    // Select appropriate tense based on difficulty
    const availableTenses = this.getTensesForDifficulty(difficulty);
    const tense = availableTenses[Math.floor(Math.random() * availableTenses.length)];
    
    // Select random person (1-6)
    const person = Math.floor(Math.random() * 6) + 1;
    
    // Select voice (mostly active for easier exercises)
    const voice = difficulty === 'hard' && Math.random() < 0.3 ? Voice.PASSIVE : Voice.ACTIVE;
    
    // Get the correct conjugation
    const conjugationResult = await this.conjugateVerb(verb.infinitive, tense, voice);
    
    let expectedAnswer: string;
    if (voice === Voice.PASSIVE) {
      expectedAnswer = conjugationResult.conjugations['passive'];
    } else {
      const personKeys = ['1s', '2s', '3s', '1p', '2p', '3p'];
      expectedAnswer = conjugationResult.conjugations[personKeys[person - 1]];
    }

    // Generate multiple choice options for easier exercises
    let options: string[] | undefined;
    if (difficulty === 'easy' || difficulty === 'medium') {
      options = await this.generateOptions(expectedAnswer, verb, tense, person, voice);
    }

    return {
      id: `${verb.id}-${tense}-${person}-${voice}-${Date.now()}`,
      verb: verb.infinitive,
      person,
      tense,
      voice,
      expectedAnswer,
      options,
      difficulty,
      cefrLevel,
    };
  }

  /**
   * Check an exercise answer
   */
  checkAnswer(exercise: ConjugationExercise, userAnswer: string): ExerciseResult {
    const correct = userAnswer.toLowerCase().trim() === exercise.expectedAnswer.toLowerCase().trim();
    
    let explanation: string | undefined;
    if (!correct) {
      explanation = this.generateExplanation(exercise);
    }

    return {
      exerciseId: exercise.id,
      userAnswer,
      correct,
      correctAnswer: exercise.expectedAnswer,
      explanation,
    };
  }

  /**
   * Get verb conjugation types info
   */
  getConjugationTypes() {
    return {
      verbTypes: {
        1: 'Type I (-a/-ä verbs)',
        2: 'Type II (-da/-dä verbs)',
        3: 'Type III (-la/-lä, -na/-nä, -ra/-rä, -ta/-tä verbs)',
        4: 'Type IV (-ata/-ätä verbs)',
        5: 'Type V (-ita/-itä verbs)',
        6: 'Type VI (-eta/-etä verbs)',
      },
      tenses: {
        1: 'Present',
        2: 'Imperfect',
        3: 'Perfect',
        4: 'Pluperfect',
        5: 'Conditional',
        6: 'ConditionalPerfect',
        7: 'Imperative',
      },
      voices: {
        1: 'Active',
        2: 'Passive',
      },
      persons: {
        '1s': '1st person singular (minä)',
        '2s': '2nd person singular (sinä)',
        '3s': '3rd person singular (hän)',
        '1p': '1st person plural (me)',
        '2p': '2nd person plural (te)',
        '3p': '3rd person plural (he)',
      },
    };
  }

  /**
   * Get available tenses based on difficulty level
   */
  private getTensesForDifficulty(difficulty: string): Tense[] {
    switch (difficulty) {
      case 'easy':
        return [Tense.PRESENT];
      case 'medium':
        return [Tense.PRESENT, Tense.IMPERFECT];
      case 'hard':
        return [Tense.PRESENT, Tense.IMPERFECT, Tense.CONDITIONAL, Tense.IMPERATIVE];
      default:
        return [Tense.PRESENT];
    }
  }

  /**
   * Generate multiple choice options
   */
  private async generateOptions(
    correctAnswer: string, 
    verb: Verb, 
    tense: Tense, 
    person: number, 
    voice: Voice
  ): Promise<string[]> {
    const options = [correctAnswer];
    
    // Generate incorrect but plausible options
    // Get conjugations from similar verbs or different persons/tenses
    const similarVerbs = await this.getVerbs(verb.cefrLevel, 10);
    
    while (options.length < 4) {
      // Try different strategies to generate wrong answers
      let wrongAnswer: string;
      
      if (Math.random() < 0.5) {
        // Use wrong person conjugation
        const wrongPerson = ((person + Math.floor(Math.random() * 5)) % 6) + 1;
        const conjugationResult = await this.conjugateVerb(verb.infinitive, tense, voice);
        const personKeys = ['1s', '2s', '3s', '1p', '2p', '3p'];
        wrongAnswer = conjugationResult.conjugations[personKeys[wrongPerson - 1]];
      } else {
        // Use conjugation from a similar verb
        const randomVerb = similarVerbs[Math.floor(Math.random() * similarVerbs.length)];
        const conjugationResult = await this.conjugateVerb(randomVerb.infinitive, tense, voice);
        const personKeys = ['1s', '2s', '3s', '1p', '2p', '3p'];
        wrongAnswer = voice === Voice.PASSIVE 
          ? conjugationResult.conjugations['passive']
          : conjugationResult.conjugations[personKeys[person - 1]];
      }
      
      if (wrongAnswer && !options.includes(wrongAnswer)) {
        options.push(wrongAnswer);
      }
    }
    
    // Shuffle options
    return options.sort(() => Math.random() - 0.5);
  }

  /**
   * Generate explanation for wrong answers
   */
  private generateExplanation(exercise: ConjugationExercise): string {
    const personNames = ['minä', 'sinä', 'hän', 'me', 'te', 'he'];
    const tenseNames = {
      [Tense.PRESENT]: 'present tense',
      [Tense.IMPERFECT]: 'past tense',
      [Tense.CONDITIONAL]: 'conditional mood',
      [Tense.IMPERATIVE]: 'imperative mood',
    };
    
    const personName = personNames[exercise.person - 1];
    const tenseName = tenseNames[exercise.tense] || 'unknown tense';
    const voiceName = exercise.voice === Voice.PASSIVE ? 'passive' : 'active';
    
    return `The correct conjugation of "${exercise.verb}" for ${personName} in ${tenseName} (${voiceName} voice) is "${exercise.expectedAnswer}".`;
  }

  /**
   * Seed common Finnish verbs
   */
  private async seedCommonVerbs(): Promise<void> {
    const commonVerbs = [
      {
        infinitive: 'olla',
        type: VerbType.TYPE_III,
        stem: 'ol',
        translation: 'to be',
        examples: ['Minä olen suomalainen', 'Sinä olet kaunis', 'Hän on opettaja'],
        frequency: 1,
        cefrLevel: 'A1',
      },
      {
        infinitive: 'sanoa',
        type: VerbType.TYPE_I,
        stem: 'sano',
        translation: 'to say',
        examples: ['Minä sanon jotain', 'Hän sanoo totuuden', 'Me sanomme kiitos'],
        frequency: 2,
        cefrLevel: 'A1',
      },
      {
        infinitive: 'tehdä',
        type: VerbType.TYPE_II,
        stem: 'tee',
        translation: 'to do, to make',
        examples: ['Minä teen työtä', 'Me teemme ruokaa', 'He tekevät kotitehtäviä'],
        frequency: 3,
        cefrLevel: 'A1',
      },
      {
        infinitive: 'mennä',
        type: VerbType.TYPE_III,
        stem: 'mene',
        translation: 'to go',
        examples: ['Minä menen kotiin', 'He menevät kauppaan', 'Sinä menet kouluun'],
        frequency: 4,
        cefrLevel: 'A1',
      },
      {
        infinitive: 'tulla',
        type: VerbType.TYPE_III,
        stem: 'tule',
        translation: 'to come',
        examples: ['Minä tulen huomenna', 'Sinä tulet mukaan', 'Hän tulee myöhemmin'],
        frequency: 5,
        cefrLevel: 'A1',
      },
      {
        infinitive: 'antaa',
        type: VerbType.TYPE_I,
        stem: 'anna',
        translation: 'to give',
        examples: ['Minä annan lahjan', 'Hän antaa neuvoja', 'Me annamme apua'],
        frequency: 6,
        cefrLevel: 'A1',
      },
      {
        infinitive: 'ottaa',
        type: VerbType.TYPE_I,
        stem: 'otta',
        translation: 'to take',
        examples: ['Minä otan kirjan', 'Sinä otat bussin', 'He ottavat kuvia'],
        frequency: 7,
        cefrLevel: 'A1',
      },
      {
        infinitive: 'nähdä',
        type: VerbType.TYPE_II,
        stem: 'näe',
        translation: 'to see',
        examples: ['Minä näen sinut', 'Hän näkee elokuvan', 'Me näemme meren'],
        frequency: 8,
        cefrLevel: 'A1',
      },
      {
        infinitive: 'tietää',
        type: VerbType.TYPE_I,
        stem: 'tiedä',
        translation: 'to know',
        examples: ['Minä tiedän vastauksen', 'Sinä tiedät totuuden', 'Hän tietää salaisuuden'],
        frequency: 9,
        cefrLevel: 'A2',
      },
      {
        infinitive: 'voida',
        type: VerbType.TYPE_II,
        stem: 'voi',
        translation: 'to be able to, can',
        examples: ['Minä voin auttaa', 'Sinä voit tulla', 'Hän voi puhua suomea'],
        frequency: 10,
        cefrLevel: 'A2',
      },
      {
        infinitive: 'tavata',
        type: VerbType.TYPE_IV,
        stem: 'tapa',
        translation: 'to meet',
        examples: ['Minä tapaan ystävän', 'Me tapaamme huomenna', 'He tapaavat usein'],
        frequency: 15,
        cefrLevel: 'A2',
      },
      {
        infinitive: 'tarvita',
        type: VerbType.TYPE_V,
        stem: 'tarvitse',
        translation: 'to need',
        examples: ['Minä tarvitsen apua', 'Hän tarvitsee rahaa', 'Me tarvitsemme aikaa'],
        frequency: 20,
        cefrLevel: 'A2',
      },
      {
        infinitive: 'haluta',
        type: VerbType.TYPE_III,
        stem: 'halua',
        translation: 'to want',
        examples: ['Minä haluan kahvia', 'Sinä haluat oppia', 'Hän haluaa matkustaa'],
        frequency: 11,
        cefrLevel: 'A2',
      },
      {
        infinitive: 'vanheta',
        type: VerbType.TYPE_VI,
        stem: 'vanhene',
        translation: 'to age, to get old',
        examples: ['Ihmiset vanhenevat', 'Viini vanhenee hyvin', 'Rakennukset vanhenevat'],
        frequency: 50,
        cefrLevel: 'B1',
      },
    ];

    for (const verbData of commonVerbs) {
      let existing = await this.verbRepository.findOne({
        where: { infinitive: verbData.infinitive },
      });
      
      if (!existing) {
        // Create new verb
        await this.verbRepository.save(this.verbRepository.create(verbData));
      } else {
        // Update existing verb with correct stem and other data
        await this.verbRepository.update(
          { infinitive: verbData.infinitive },
          {
            stem: verbData.stem,
            type: verbData.type,
            translation: verbData.translation,
            examples: verbData.examples,
            frequency: verbData.frequency,
            cefrLevel: verbData.cefrLevel,
          }
        );
      }
    }
  }
}
