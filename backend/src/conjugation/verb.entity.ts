import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum VerbType {
  TYPE_I = 1,   // -a/-ä verbs (sanoa, puhua)
  TYPE_II = 2,  // -da/-dä verbs (syödä, juoda)
  TYPE_III = 3, // -la/-lä, -na/-nä, -ra/-rä, -ta/-tä verbs (tulla, mennä, purra, haluta)
  TYPE_IV = 4,  // -ata/-ätä verbs (tavata, hypätä)
  TYPE_V = 5,   // -ita/-itä verbs (tarvita, valita)
  TYPE_VI = 6,  // -eta/-etä verbs (vanheta, kylmetä)
}

export enum Tense {
  PRESENT = 1,
  IMPERFECT = 2,
  PERFECT = 3,
  PLUPERFECT = 4,
  CONDITIONAL = 5,
  CONDITIONAL_PERFECT = 6,
  IMPERATIVE = 7,
}

export enum Voice {
  ACTIVE = 1,
  PASSIVE = 2,
}

export enum Person {
  FIRST_SINGULAR = 1,  // minä
  SECOND_SINGULAR = 2, // sinä
  THIRD_SINGULAR = 3,  // hän
  FIRST_PLURAL = 4,    // me
  SECOND_PLURAL = 5,   // te
  THIRD_PLURAL = 6,    // he
}

@Entity('verbs')
export class Verb {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  infinitive: string;

  @Column({
    type: 'enum',
    enum: VerbType,
  })
  type: VerbType;

  @Column()
  stem: string;

  @Column()
  translation: string;

  @Column('text', { array: true, default: '{}' })
  examples: string[];

  @Column({ default: 1 })
  frequency: number; // 1 = most common, higher = less common

  @Column({ default: 'A1' })
  cefrLevel: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
