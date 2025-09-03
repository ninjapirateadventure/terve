import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum NounCase {
  NOMINATIVE = 1,    // perusmuoto - talo
  GENITIVE = 2,      // omanto - talon  
  PARTITIVE = 3,     // osanto - taloa
  ACCUSATIVE = 4,    // kohdanto - talon (often same as genitive)
  INESSIVE = 5,      // sisäolento - talossa (in)
  ELATIVE = 6,       // sisäeronto - talosta (from inside)
  ILLATIVE = 7,      // sisätulento - taloon (into)
  ADESSIVE = 8,      // ulkoolento - talolla (at/on)
  ABLATIVE = 9,      // ulkoeronto - talolta (from)
  ALLATIVE = 10,     // ulkotulento - talolle (to)
}

export enum DeclensionType {
  TYPE_I = 1,        // vowel stems: talo, katu
  TYPE_II = 2,       // consonant + vowel: katu, lintu  
  TYPE_III = 3,      // consonant clusters: sydän, käsi
  TYPE_IV = 4,       // -nen words: nainen, suomalainen
  TYPE_V = 5,        // -si/-ti words: käsi, lehti
  TYPE_VI = 6,       // special/irregular: mies, yö
}

@Entity('nouns')
export class Noun {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nominative: string;

  @Column()
  translation: string;

  @Column('text', { array: true, default: [] })
  examples: string[];

  @Column({ name: 'declension_type' })
  declensionType: DeclensionType;

  @Column()
  stem: string;

  @Column({ name: 'cefr_level', default: 'A1' })
  cefrLevel: string;

  @Column({ default: 100 })
  frequency: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
