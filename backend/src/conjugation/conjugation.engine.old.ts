import { Injectable } from '@nestjs/common';
import { VerbType, Tense, Voice, Person } from './verb.entity';

@Injectable()
export class ConjugationEngine {
  private verbPatterns = new Map<VerbType, RegExp>([
    [VerbType.TYPE_I, /[aä]$/],                    // sanoa, puhua
    [VerbType.TYPE_II, /[dt][aä]$/],               // syödä, juoda
    [VerbType.TYPE_III, /([ln][aä]|[rt][aä]|t[aä])$/], // tulla, mennä, purra, haluta
    [VerbType.TYPE_IV, /[aä]t[aä]$/],              // tavata, hypätä
    [VerbType.TYPE_V, /it[aä]$/],                  // tarvita, valita
    [VerbType.TYPE_VI, /et[aä]$/],                 // vanheta, kylmetä
  ]);

  /**
   * Classifies a Finnish verb by its conjugation type
   */
  classifyVerb(verb: string): VerbType {
    const cleanVerb = verb.toLowerCase().trim();
    
    for (const [type, pattern] of this.verbPatterns) {
      if (pattern.test(cleanVerb)) {
        return type;
      }
    }
    
    // Default to Type I if no match
    return VerbType.TYPE_I;
  }

  // Completely irregular verb conjugations
  private irregularConjugations = new Map<string, Record<string, Record<string, string>>>([
    ['olla', {
      [Tense.PRESENT]: {
        '1s': 'olen',
        '2s': 'olet', 
        '3s': 'on',
        '1p': 'olemme',
        '2p': 'olette',
        '3p': 'ovat'
      }
    }],
    ['tehdä', {
      [Tense.PRESENT]: {
        '1s': 'teen',
        '2s': 'teet',
        '3s': 'tekee',
        '1p': 'teemme',
        '2p': 'teette',
        '3p': 'tekevät'
      }
    }]
  ]);

  // Irregular verb stems that need special handling
  private irregularStems = new Map<string, string>([
    ['olla', 'ole'],
    ['tehdä', 'tee'],
    ['nähdä', 'näe'],
    ['voida', 'voi'],
    ['saada', 'saa'],
  ]);

  /**
   * Extracts the stem from a Finnish verb based on its type
   */
  extractStem(verb: string, verbType?: VerbType): string {
    const cleanVerb = verb.toLowerCase().trim();
    
    // Check for irregular verbs first
    if (this.irregularStems.has(cleanVerb)) {
      return this.irregularStems.get(cleanVerb)!;
    }
    
    const type = verbType || this.classifyVerb(cleanVerb);
    
    switch (type) {
      case VerbType.TYPE_I:
        // Remove final vowel: sanoa -> sano, puhua -> puhu
        return cleanVerb.slice(0, -1);
        
      case VerbType.TYPE_II:
        // Remove -da/-dä: syödä -> syö, juoda -> juo
        if (cleanVerb.endsWith('da') || cleanVerb.endsWith('dä')) {
          return cleanVerb.slice(0, -2);
        }
        return cleanVerb.slice(0, -1);
        
      case VerbType.TYPE_III:
        // Complex rules for Type III verbs
        if (cleanVerb.endsWith('nna') || cleanVerb.endsWith('nnä')) {
          // mennä -> mene (not men)
          const baseRoot = cleanVerb.slice(0, -3);
          return baseRoot + 'e';
        } else if (cleanVerb.endsWith('lla') || cleanVerb.endsWith('llä')) {
          // tulla -> tule 
          const baseRoot = cleanVerb.slice(0, -3);
          return baseRoot + 'e';
        } else if (cleanVerb.endsWith('rra') || cleanVerb.endsWith('rrä')) {
          return cleanVerb.slice(0, -2); // purra -> pur
        } else if (cleanVerb.endsWith('ta') || cleanVerb.endsWith('tä')) {
          return cleanVerb.slice(0, -2) + 'ua'; // haluta -> halua (with consonant gradation)
        }
        return cleanVerb.slice(0, -1);
        
      case VerbType.TYPE_IV:
        // Remove -ata/-ätä: tavata -> tava, hypätä -> hypä
        if (cleanVerb.endsWith('ata') || cleanVerb.endsWith('ätä')) {
          return cleanVerb.slice(0, -3);
        }
        return cleanVerb.slice(0, -1);
        
      case VerbType.TYPE_V:
        // Remove -ita/-itä and add -tse: tarvita -> tarvitse, valita -> valitse
        if (cleanVerb.endsWith('ita') || cleanVerb.endsWith('itä')) {
          return cleanVerb.slice(0, -3) + 'tse';
        }
        return cleanVerb.slice(0, -1);
        
      case VerbType.TYPE_VI:
        // Remove -eta/-etä and add -ne: vanheta -> vanhene, kylmetä -> kylmene
        if (cleanVerb.endsWith('eta') || cleanVerb.endsWith('etä')) {
          return cleanVerb.slice(0, -3) + 'ne';
        }
        return cleanVerb.slice(0, -1);
        
      default:
        return cleanVerb.slice(0, -1);
    }
  }

  /**
   * Determines vowel harmony (front/back vowels)
   */
  private getVowelHarmony(word: string): 'front' | 'back' {
    // Front vowels: ä, ö, y
    const frontVowelPattern = /[äöy]/;
    return frontVowelPattern.test(word) ? 'front' : 'back';
  }

  /**
   * Applies Finnish vowel harmony to endings
   */
  private applyVowelHarmony(ending: string, word: string): string {
    const harmony = this.getVowelHarmony(word);
    
    if (harmony === 'front') {
      return ending
        .replace(/a/g, 'ä')
        .replace(/o/g, 'ö')
        .replace(/u/g, 'y');
    }
    
    return ending;
  }

  /**
   * Conjugates a verb for all persons in a specific tense and voice
   */
  conjugateVerb(verb: string, tense: Tense, voice: Voice = Voice.ACTIVE): Record<string, string> {
    const cleanVerb = verb.toLowerCase().trim();
    
    // Check for completely irregular verbs first
    if (this.irregularConjugations.has(cleanVerb)) {
      const irregularConjugation = this.irregularConjugations.get(cleanVerb)!;
      if (irregularConjugation[tense] && voice === Voice.ACTIVE) {
        return irregularConjugation[tense];
      }
    }
    
    const verbType = this.classifyVerb(verb);
    const stem = this.extractStem(verb, verbType);
    
    const persons = [
      Person.FIRST_SINGULAR,
      Person.SECOND_SINGULAR,
      Person.THIRD_SINGULAR,
      Person.FIRST_PLURAL,
      Person.SECOND_PLURAL,
      Person.THIRD_PLURAL,
    ];
    
    const personKeys = ['1s', '2s', '3s', '1p', '2p', '3p'];
    const conjugations: Record<string, string> = {};
    
    if (voice === Voice.PASSIVE) {
      conjugations['passive'] = this.conjugatePassive(stem, verbType, tense, verb);
    } else {
      persons.forEach((person, index) => {
        conjugations[personKeys[index]] = this.conjugateForPerson(
          stem, verbType, person, tense, verb
        );
      });
    }
    
    return conjugations;
  }

  /**
   * Conjugates a verb for a specific person
   */
  private conjugateForPerson(
    stem: string,
    verbType: VerbType,
    person: Person,
    tense: Tense,
    originalVerb: string,
  ): string {
    switch (tense) {
      case Tense.PRESENT:
        return this.conjugatePresent(stem, verbType, person, originalVerb);
      case Tense.IMPERFECT:
        return this.conjugateImperfect(stem, verbType, person, originalVerb);
      case Tense.CONDITIONAL:
        return this.conjugateConditional(stem, verbType, person, originalVerb);
      case Tense.IMPERATIVE:
        return this.conjugateImperative(stem, verbType, person, originalVerb);
      default:
        throw new Error(`Tense ${tense} not implemented`);
    }
  }

  /**
   * Conjugates present tense
   */
  private conjugatePresent(
    stem: string,
    verbType: VerbType,
    person: Person,
    originalVerb: string,
  ): string {
    let ending = '';
    let modifiedStem = stem;

    switch (person) {
      case Person.FIRST_SINGULAR:
        ending = 'n';
        break;
      case Person.SECOND_SINGULAR:
        ending = 't';
        break;
      case Person.THIRD_SINGULAR:
        // Type-specific third person endings
        switch (verbType) {
          case VerbType.TYPE_I:
            ending = '';
            break;
          case VerbType.TYPE_II:
            ending = '';
            break;
          case VerbType.TYPE_III:
            // For Type III verbs, 3rd person singular adds 'e'
            ending = 'e';
            break;
          case VerbType.TYPE_IV:
            ending = 'a';
            break;
          case VerbType.TYPE_V:
          case VerbType.TYPE_VI:
            // Remove 'se'/'ne' from stem for 3rd person singular
            if (modifiedStem.endsWith('se') || modifiedStem.endsWith('ne')) {
              modifiedStem = modifiedStem.slice(0, -2);
            }
            ending = '';
            break;
        }
        break;
      case Person.FIRST_PLURAL:
        ending = 'mme';
        break;
      case Person.SECOND_PLURAL:
        ending = 'tte';
        break;
      case Person.THIRD_PLURAL:
        switch (verbType) {
          case VerbType.TYPE_I:
          case VerbType.TYPE_II:
          case VerbType.TYPE_III:
          case VerbType.TYPE_V:
          case VerbType.TYPE_VI:
            ending = 'vat';
            break;
          case VerbType.TYPE_IV:
            ending = 'avat';
            break;
        }
        break;
    }

    const harmonizedEnding = this.applyVowelHarmony(ending, originalVerb);
    return modifiedStem + harmonizedEnding;
  }

  /**
   * Conjugates imperfect (past) tense
   */
  private conjugateImperfect(
    stem: string,
    verbType: VerbType,
    person: Person,
    originalVerb: string,
  ): string {
    let imperfectStem = stem;

    // Add imperfect marker based on verb type
    switch (verbType) {
      case VerbType.TYPE_I:
      case VerbType.TYPE_II:
      case VerbType.TYPE_III:
        imperfectStem += 'i';
        break;
      case VerbType.TYPE_IV:
        imperfectStem += 'si';
        break;
      case VerbType.TYPE_V:
        imperfectStem = stem.slice(0, -2) + 'si'; // Remove 'se' and add 'si'
        break;
      case VerbType.TYPE_VI:
        imperfectStem = stem.slice(0, -2) + 'ni'; // Remove 'ne' and add 'ni'
        break;
    }

    let ending = '';
    switch (person) {
      case Person.FIRST_SINGULAR:
        ending = 'n';
        break;
      case Person.SECOND_SINGULAR:
        ending = 't';
        break;
      case Person.THIRD_SINGULAR:
        ending = '';
        break;
      case Person.FIRST_PLURAL:
        ending = 'mme';
        break;
      case Person.SECOND_PLURAL:
        ending = 'tte';
        break;
      case Person.THIRD_PLURAL:
        ending = 'vat';
        break;
    }

    const harmonizedEnding = this.applyVowelHarmony(ending, originalVerb);
    return imperfectStem + harmonizedEnding;
  }

  /**
   * Conjugates conditional mood
   */
  private conjugateConditional(
    stem: string,
    verbType: VerbType,
    person: Person,
    originalVerb: string,
  ): string {
    let conditionalStem = stem;

    // Add conditional marker 'isi'
    switch (verbType) {
      case VerbType.TYPE_I:
      case VerbType.TYPE_II:
      case VerbType.TYPE_III:
      case VerbType.TYPE_IV:
        conditionalStem += 'isi';
        break;
      case VerbType.TYPE_V:
        conditionalStem = stem.slice(0, -2) + 'isi'; // Remove 'se' and add 'isi'
        break;
      case VerbType.TYPE_VI:
        conditionalStem = stem.slice(0, -2) + 'isi'; // Remove 'ne' and add 'isi'
        break;
    }

    let ending = '';
    switch (person) {
      case Person.FIRST_SINGULAR:
        ending = 'n';
        break;
      case Person.SECOND_SINGULAR:
        ending = 't';
        break;
      case Person.THIRD_SINGULAR:
        ending = '';
        break;
      case Person.FIRST_PLURAL:
        ending = 'mme';
        break;
      case Person.SECOND_PLURAL:
        ending = 'tte';
        break;
      case Person.THIRD_PLURAL:
        ending = 'vat';
        break;
    }

    const harmonizedEnding = this.applyVowelHarmony(ending, originalVerb);
    return conditionalStem + harmonizedEnding;
  }

  /**
   * Conjugates imperative mood
   */
  private conjugateImperative(
    stem: string,
    verbType: VerbType,
    person: Person,
    originalVerb: string,
  ): string {
    switch (person) {
      case Person.SECOND_SINGULAR:
        // Usually just the stem, but handle special cases
        switch (verbType) {
          case VerbType.TYPE_V:
          case VerbType.TYPE_VI:
            return stem.slice(0, -2); // Remove 'se'/'ne'
          default:
            return stem;
        }
      case Person.SECOND_PLURAL:
        const ending = this.applyVowelHarmony('kaa', originalVerb);
        return stem + ending;
      default:
        throw new Error('Imperative only available for 2nd person');
    }
  }

  /**
   * Conjugates passive voice
   */
  private conjugatePassive(
    stem: string,
    verbType: VerbType,
    tense: Tense,
    originalVerb: string,
  ): string {
    let passiveStem = stem;
    let ending = '';

    // Modify stem for passive
    switch (verbType) {
      case VerbType.TYPE_V:
        passiveStem = stem.slice(0, -2); // Remove 'se'
        break;
      case VerbType.TYPE_VI:
        passiveStem = stem.slice(0, -2); // Remove 'ne'
        break;
    }

    // Add tense-specific passive endings
    switch (tense) {
      case Tense.PRESENT:
        ending = 'taan';
        break;
      case Tense.IMPERFECT:
        ending = 'tiin';
        break;
      case Tense.CONDITIONAL:
        ending = 'taisiin';
        break;
      default:
        throw new Error(`Passive tense ${tense} not implemented`);
    }

    const harmonizedEnding = this.applyVowelHarmony(ending, originalVerb);
    return passiveStem + harmonizedEnding;
  }
}
