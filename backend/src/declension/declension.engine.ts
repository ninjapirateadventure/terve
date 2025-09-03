import { Injectable } from '@nestjs/common';
import { NounCase, DeclensionType } from './noun.entity';

@Injectable()
export class DeclensionEngine {
  // Complete noun declension lookup tables - no algorithmic generation
  // This ensures 100% accuracy for the most common Finnish nouns
  private nounDeclensions = new Map<string, Record<number, string>>([
    ['talo', {
      [NounCase.NOMINATIVE]: 'talo',
      [NounCase.GENITIVE]: 'talon',
      [NounCase.PARTITIVE]: 'taloa',
      [NounCase.ACCUSATIVE]: 'talon',
      [NounCase.INESSIVE]: 'talossa',
      [NounCase.ELATIVE]: 'talosta',
      [NounCase.ILLATIVE]: 'taloon',
      [NounCase.ADESSIVE]: 'talolla',
      [NounCase.ABLATIVE]: 'talolta',
      [NounCase.ALLATIVE]: 'talolle'
    }],
    
    ['katu', {
      [NounCase.NOMINATIVE]: 'katu',
      [NounCase.GENITIVE]: 'kadun',
      [NounCase.PARTITIVE]: 'katua',
      [NounCase.ACCUSATIVE]: 'kadun',
      [NounCase.INESSIVE]: 'kadussa',
      [NounCase.ELATIVE]: 'kadusta',
      [NounCase.ILLATIVE]: 'katuun',
      [NounCase.ADESSIVE]: 'kadulla',
      [NounCase.ABLATIVE]: 'kadulta',
      [NounCase.ALLATIVE]: 'kadulle'
    }],
    
    ['auto', {
      [NounCase.NOMINATIVE]: 'auto',
      [NounCase.GENITIVE]: 'auton',
      [NounCase.PARTITIVE]: 'autoa',
      [NounCase.ACCUSATIVE]: 'auton',
      [NounCase.INESSIVE]: 'autossa',
      [NounCase.ELATIVE]: 'autosta',
      [NounCase.ILLATIVE]: 'autoon',
      [NounCase.ADESSIVE]: 'autolla',
      [NounCase.ABLATIVE]: 'autolta',
      [NounCase.ALLATIVE]: 'autolle'
    }],
    
    ['koti', {
      [NounCase.NOMINATIVE]: 'koti',
      [NounCase.GENITIVE]: 'kodin',
      [NounCase.PARTITIVE]: 'kotia',
      [NounCase.ACCUSATIVE]: 'kodin',
      [NounCase.INESSIVE]: 'kotona',
      [NounCase.ELATIVE]: 'kotoa',
      [NounCase.ILLATIVE]: 'kotiin',
      [NounCase.ADESSIVE]: 'kodilla',
      [NounCase.ABLATIVE]: 'kodilta',
      [NounCase.ALLATIVE]: 'kodille'
    }],
    
    ['lintu', {
      [NounCase.NOMINATIVE]: 'lintu',
      [NounCase.GENITIVE]: 'linnun',
      [NounCase.PARTITIVE]: 'lintua',
      [NounCase.ACCUSATIVE]: 'linnun',
      [NounCase.INESSIVE]: 'linnussa',
      [NounCase.ELATIVE]: 'linnusta',
      [NounCase.ILLATIVE]: 'lintuun',
      [NounCase.ADESSIVE]: 'linnulla',
      [NounCase.ABLATIVE]: 'linnulta',
      [NounCase.ALLATIVE]: 'linnulle'
    }],
    
    ['käsi', {
      [NounCase.NOMINATIVE]: 'käsi',
      [NounCase.GENITIVE]: 'käden',
      [NounCase.PARTITIVE]: 'kättä',
      [NounCase.ACCUSATIVE]: 'käden',
      [NounCase.INESSIVE]: 'kädessä',
      [NounCase.ELATIVE]: 'kädestä',
      [NounCase.ILLATIVE]: 'käteen',
      [NounCase.ADESSIVE]: 'kädellä',
      [NounCase.ABLATIVE]: 'kädeltä',
      [NounCase.ALLATIVE]: 'kädelle'
    }],
    
    ['sydän', {
      [NounCase.NOMINATIVE]: 'sydän',
      [NounCase.GENITIVE]: 'sydämen',
      [NounCase.PARTITIVE]: 'sydäntä',
      [NounCase.ACCUSATIVE]: 'sydämen',
      [NounCase.INESSIVE]: 'sydämessä',
      [NounCase.ELATIVE]: 'sydämestä',
      [NounCase.ILLATIVE]: 'sydämeen',
      [NounCase.ADESSIVE]: 'sydämellä',
      [NounCase.ABLATIVE]: 'sydämeltä',
      [NounCase.ALLATIVE]: 'sydämelle'
    }],
    
    ['nainen', {
      [NounCase.NOMINATIVE]: 'nainen',
      [NounCase.GENITIVE]: 'naisen',
      [NounCase.PARTITIVE]: 'naista',
      [NounCase.ACCUSATIVE]: 'naisen',
      [NounCase.INESSIVE]: 'naisessa',
      [NounCase.ELATIVE]: 'naisesta',
      [NounCase.ILLATIVE]: 'naiseen',
      [NounCase.ADESSIVE]: 'naisella',
      [NounCase.ABLATIVE]: 'naiselta',
      [NounCase.ALLATIVE]: 'naiselle'
    }],
    
    ['mies', {
      [NounCase.NOMINATIVE]: 'mies',
      [NounCase.GENITIVE]: 'miehen',
      [NounCase.PARTITIVE]: 'miestä',
      [NounCase.ACCUSATIVE]: 'miehen',
      [NounCase.INESSIVE]: 'miehessä',
      [NounCase.ELATIVE]: 'miehestä',
      [NounCase.ILLATIVE]: 'mieheen',
      [NounCase.ADESSIVE]: 'miehellä',
      [NounCase.ABLATIVE]: 'mieheltä',
      [NounCase.ALLATIVE]: 'miehelle'
    }],
    
    ['lapsi', {
      [NounCase.NOMINATIVE]: 'lapsi',
      [NounCase.GENITIVE]: 'lapsen',
      [NounCase.PARTITIVE]: 'lasta',
      [NounCase.ACCUSATIVE]: 'lapsen',
      [NounCase.INESSIVE]: 'lapsessa',
      [NounCase.ELATIVE]: 'lapsesta',
      [NounCase.ILLATIVE]: 'lapseen',
      [NounCase.ADESSIVE]: 'lapsella',
      [NounCase.ABLATIVE]: 'lapselta',
      [NounCase.ALLATIVE]: 'lapselle'
    }],
    
    ['vesi', {
      [NounCase.NOMINATIVE]: 'vesi',
      [NounCase.GENITIVE]: 'veden',
      [NounCase.PARTITIVE]: 'vettä',
      [NounCase.ACCUSATIVE]: 'veden',
      [NounCase.INESSIVE]: 'vedessä',
      [NounCase.ELATIVE]: 'vedestä',
      [NounCase.ILLATIVE]: 'veteen',
      [NounCase.ADESSIVE]: 'vedellä',
      [NounCase.ABLATIVE]: 'vedeltä',
      [NounCase.ALLATIVE]: 'vedelle'
    }],
    
    ['kirja', {
      [NounCase.NOMINATIVE]: 'kirja',
      [NounCase.GENITIVE]: 'kirjan',
      [NounCase.PARTITIVE]: 'kirjaa',
      [NounCase.ACCUSATIVE]: 'kirjan',
      [NounCase.INESSIVE]: 'kirjassa',
      [NounCase.ELATIVE]: 'kirjasta',
      [NounCase.ILLATIVE]: 'kirjaan',
      [NounCase.ADESSIVE]: 'kirjalla',
      [NounCase.ABLATIVE]: 'kirjalta',
      [NounCase.ALLATIVE]: 'kirjalle'
    }],
    
    ['ruoka', {
      [NounCase.NOMINATIVE]: 'ruoka',
      [NounCase.GENITIVE]: 'ruoan',
      [NounCase.PARTITIVE]: 'ruokaa',
      [NounCase.ACCUSATIVE]: 'ruoan',
      [NounCase.INESSIVE]: 'ruoassa',
      [NounCase.ELATIVE]: 'ruoasta',
      [NounCase.ILLATIVE]: 'ruokaan',
      [NounCase.ADESSIVE]: 'ruoalla',
      [NounCase.ABLATIVE]: 'ruoalta',
      [NounCase.ALLATIVE]: 'ruoalle'
    }],
    
    ['pää', {
      [NounCase.NOMINATIVE]: 'pää',
      [NounCase.GENITIVE]: 'pään',
      [NounCase.PARTITIVE]: 'päätä',
      [NounCase.ACCUSATIVE]: 'pään',
      [NounCase.INESSIVE]: 'päässä',
      [NounCase.ELATIVE]: 'päästä',
      [NounCase.ILLATIVE]: 'päähän',
      [NounCase.ADESSIVE]: 'päällä',
      [NounCase.ABLATIVE]: 'päältä',
      [NounCase.ALLATIVE]: 'päälle'
    }],
    
    ['yö', {
      [NounCase.NOMINATIVE]: 'yö',
      [NounCase.GENITIVE]: 'yön',
      [NounCase.PARTITIVE]: 'yötä',
      [NounCase.ACCUSATIVE]: 'yön',
      [NounCase.INESSIVE]: 'yössä',
      [NounCase.ELATIVE]: 'yöstä',
      [NounCase.ILLATIVE]: 'yöhön',
      [NounCase.ADESSIVE]: 'yöllä',
      [NounCase.ABLATIVE]: 'yöltä',
      [NounCase.ALLATIVE]: 'yölle'
    }],
    
    ['päivä', {
      [NounCase.NOMINATIVE]: 'päivä',
      [NounCase.GENITIVE]: 'päivän',
      [NounCase.PARTITIVE]: 'päivää',
      [NounCase.ACCUSATIVE]: 'päivän',
      [NounCase.INESSIVE]: 'päivässä',
      [NounCase.ELATIVE]: 'päivästä',
      [NounCase.ILLATIVE]: 'päivään',
      [NounCase.ADESSIVE]: 'päivällä',
      [NounCase.ABLATIVE]: 'päivältä',
      [NounCase.ALLATIVE]: 'päivälle'
    }],
    
    ['aika', {
      [NounCase.NOMINATIVE]: 'aika',
      [NounCase.GENITIVE]: 'ajan',
      [NounCase.PARTITIVE]: 'aikaa',
      [NounCase.ACCUSATIVE]: 'ajan',
      [NounCase.INESSIVE]: 'ajassa',
      [NounCase.ELATIVE]: 'ajasta',
      [NounCase.ILLATIVE]: 'aikaan',
      [NounCase.ADESSIVE]: 'ajalla',
      [NounCase.ABLATIVE]: 'ajalta',
      [NounCase.ALLATIVE]: 'ajalle'
    }],
    
    ['työ', {
      [NounCase.NOMINATIVE]: 'työ',
      [NounCase.GENITIVE]: 'työn',
      [NounCase.PARTITIVE]: 'työtä',
      [NounCase.ACCUSATIVE]: 'työn',
      [NounCase.INESSIVE]: 'työssä',
      [NounCase.ELATIVE]: 'työstä',
      [NounCase.ILLATIVE]: 'työhön',
      [NounCase.ADESSIVE]: 'työllä',
      [NounCase.ABLATIVE]: 'työltä',
      [NounCase.ALLATIVE]: 'työlle'
    }],
    
    ['koulu', {
      [NounCase.NOMINATIVE]: 'koulu',
      [NounCase.GENITIVE]: 'koulun',
      [NounCase.PARTITIVE]: 'koulua',
      [NounCase.ACCUSATIVE]: 'koulun',
      [NounCase.INESSIVE]: 'koulussa',
      [NounCase.ELATIVE]: 'koulusta',
      [NounCase.ILLATIVE]: 'kouluun',
      [NounCase.ADESSIVE]: 'koululla',
      [NounCase.ABLATIVE]: 'koululta',
      [NounCase.ALLATIVE]: 'koululle'
    }],
    
    ['maa', {
      [NounCase.NOMINATIVE]: 'maa',
      [NounCase.GENITIVE]: 'maan',
      [NounCase.PARTITIVE]: 'maata',
      [NounCase.ACCUSATIVE]: 'maan',
      [NounCase.INESSIVE]: 'maassa',
      [NounCase.ELATIVE]: 'maasta',
      [NounCase.ILLATIVE]: 'maahan',
      [NounCase.ADESSIVE]: 'maalla',
      [NounCase.ABLATIVE]: 'maalta',
      [NounCase.ALLATIVE]: 'maalle'
    }]
  ]);

  // Noun metadata for classification purposes
  private nounMetadata = new Map<string, { type: DeclensionType, stem: string }>([
    ['talo', { type: DeclensionType.TYPE_I, stem: 'talo' }],
    ['katu', { type: DeclensionType.TYPE_I, stem: 'katu' }],
    ['auto', { type: DeclensionType.TYPE_I, stem: 'auto' }],
    ['koti', { type: DeclensionType.TYPE_I, stem: 'koti' }],
    ['lintu', { type: DeclensionType.TYPE_I, stem: 'lintu' }],
    ['käsi', { type: DeclensionType.TYPE_V, stem: 'käte' }],
    ['sydän', { type: DeclensionType.TYPE_III, stem: 'sydäme' }],
    ['nainen', { type: DeclensionType.TYPE_IV, stem: 'naise' }],
    ['mies', { type: DeclensionType.TYPE_VI, stem: 'miehe' }],
    ['lapsi', { type: DeclensionType.TYPE_V, stem: 'lapse' }],
    ['vesi', { type: DeclensionType.TYPE_V, stem: 'vete' }],
    ['kirja', { type: DeclensionType.TYPE_I, stem: 'kirja' }],
    ['ruoka', { type: DeclensionType.TYPE_I, stem: 'ruoka' }],
    ['pää', { type: DeclensionType.TYPE_I, stem: 'pää' }],
    ['yö', { type: DeclensionType.TYPE_VI, stem: 'yö' }],
    ['päivä', { type: DeclensionType.TYPE_I, stem: 'päivä' }],
    ['aika', { type: DeclensionType.TYPE_I, stem: 'aika' }],
    ['työ', { type: DeclensionType.TYPE_VI, stem: 'työ' }],
    ['koulu', { type: DeclensionType.TYPE_I, stem: 'koulu' }],
    ['maa', { type: DeclensionType.TYPE_I, stem: 'maa' }]
  ]);

  /**
   * Classifies a Finnish noun by its declension type
   */
  classifyNoun(noun: string): DeclensionType {
    const cleanNoun = noun.toLowerCase().trim();
    const metadata = this.nounMetadata.get(cleanNoun);
    
    if (metadata) {
      return metadata.type;
    }
    
    // Default to Type I for unknown nouns
    return DeclensionType.TYPE_I;
  }

  /**
   * Extracts the stem from a Finnish noun
   */
  extractStem(noun: string, declensionType?: DeclensionType): string {
    const cleanNoun = noun.toLowerCase().trim();
    const metadata = this.nounMetadata.get(cleanNoun);
    
    if (metadata) {
      return metadata.stem;
    }
    
    // Fallback for unknown nouns - simple stem extraction
    return cleanNoun;
  }

  /**
   * Declines a noun to a specific case
   */
  declineNoun(noun: string, nounCase: NounCase): string {
    const cleanNoun = noun.toLowerCase().trim();
    
    // Check if we have this noun in our lookup table
    if (this.nounDeclensions.has(cleanNoun)) {
      const nounDeclension = this.nounDeclensions.get(cleanNoun)!;
      if (nounDeclension[nounCase]) {
        return nounDeclension[nounCase];
      }
    }
    
    // If we don't have the noun or case, return an error
    throw new Error(`Declension not available for noun "${noun}" in the requested case. Currently supported: ${Array.from(this.nounDeclensions.keys()).join(', ')}`);
  }

  /**
   * Gets all declensions for a noun
   */
  getAllDeclensions(noun: string): Record<string, string> {
    const cleanNoun = noun.toLowerCase().trim();
    
    // Check if we have this noun in our lookup table
    if (this.nounDeclensions.has(cleanNoun)) {
      const nounDeclension = this.nounDeclensions.get(cleanNoun)!;
      
      // Convert numeric keys to descriptive names
      return {
        'nominative': nounDeclension[NounCase.NOMINATIVE],
        'genitive': nounDeclension[NounCase.GENITIVE],
        'partitive': nounDeclension[NounCase.PARTITIVE],
        'accusative': nounDeclension[NounCase.ACCUSATIVE],
        'inessive': nounDeclension[NounCase.INESSIVE],
        'elative': nounDeclension[NounCase.ELATIVE],
        'illative': nounDeclension[NounCase.ILLATIVE],
        'adessive': nounDeclension[NounCase.ADESSIVE],
        'ablative': nounDeclension[NounCase.ABLATIVE],
        'allative': nounDeclension[NounCase.ALLATIVE]
      };
    }
    
    throw new Error(`Declension not available for noun "${noun}". Currently supported: ${Array.from(this.nounDeclensions.keys()).join(', ')}`);
  }

  /**
   * Get list of supported nouns
   */
  getSupportedNouns(): string[] {
    return Array.from(this.nounDeclensions.keys());
  }

  /**
   * Check if a noun is supported
   */
  isNounSupported(noun: string): boolean {
    const cleanNoun = noun.toLowerCase().trim();
    return this.nounDeclensions.has(cleanNoun);
  }

  /**
   * Get case names with descriptions
   */
  getCaseDescriptions(): Record<string, { english: string, finnish: string, description: string }> {
    return {
      'nominative': { english: 'Nominative', finnish: 'Perusmuoto', description: 'Subject of sentence' },
      'genitive': { english: 'Genitive', finnish: 'Omanto', description: 'Possession, "of"' },
      'partitive': { english: 'Partitive', finnish: 'Osanto', description: 'Partial object, after numbers' },
      'accusative': { english: 'Accusative', finnish: 'Kohdanto', description: 'Direct object' },
      'inessive': { english: 'Inessive', finnish: 'Sisäolento', description: 'Inside, "in"' },
      'elative': { english: 'Elative', finnish: 'Sisäeronto', description: 'From inside, "out of"' },
      'illative': { english: 'Illative', finnish: 'Sisätulento', description: 'Into, "into"' },
      'adessive': { english: 'Adessive', finnish: 'Ulkoolento', description: 'At/on, "at"' },
      'ablative': { english: 'Ablative', finnish: 'Ulkoeronto', description: 'From, "from"' },
      'allative': { english: 'Allative', finnish: 'Ulkotulento', description: 'To, "to"' }
    };
  }
}
