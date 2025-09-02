import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CEFRLevel } from '../users/user.entity';

@Entity('words')
export class Word {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  finnish: string;

  @Column()
  english: string;

  @Column({ nullable: true })
  phonetic: string;

  @Column({
    type: 'enum',
    enum: CEFRLevel,
    default: CEFRLevel.A1
  })
  cefrLevel: CEFRLevel;

  @Column({ default: 1 })
  frequency: number; // 1 = most common, higher = less common

  @Column({ nullable: true })
  category: string; // e.g., 'greetings', 'food', 'colors'

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
